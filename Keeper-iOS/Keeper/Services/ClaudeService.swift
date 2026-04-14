import Foundation

/// Anthropic Claude API client.
/// Uses `claude-sonnet-4-20250514` via the Messages API.
/// Analysis calls use a standard request/response; chat uses server-sent event streaming.
@MainActor
final class ClaudeService {
    static let shared = ClaudeService()
    private init() {}

    // MARK: - Configuration

    private var apiKey: String {
        KeychainManager.shared.retrieve(Constants.Keychain.anthropicKey) ?? ""
    }

    private let baseURL   = "https://api.anthropic.com/v1/messages"
    private let model     = Constants.API.claudeModel
    private let apiVersion = "2023-06-01"

    // MARK: - Transaction Analysis

    /// Sends up to 200 recent transactions to Claude and parses the structured JSON response
    /// into a `ClaudeAnalysisResult`. Returns nil if the API call fails or the JSON is malformed.
    func analyzeTransactions(_ transactions: [Transaction], user: KeeperUser) async -> ClaudeAnalysisResult? {
        let txData: [[String: Any]] = transactions.prefix(200).map { tx in
            [
                "merchant":  tx.merchantName,
                "amount":    tx.amount,
                "date":      tx.date.ISO8601Format(),
                "category":  tx.category.rawValue,
                "recurring": tx.isRecurring
            ]
        }

        let txJSON = (try? JSONSerialization.data(withJSONObject: txData))
            .flatMap { String(data: $0, encoding: .utf8) } ?? "[]"

        let systemPrompt = """
        You are Keeper, an elite AI financial guardian. Your sole purpose is to protect people's money.
        Analyze transactions and find every instance where the user is losing money unnecessarily.
        Always return valid JSON. Dollar amounts must be numeric. confidence_score: 0.0-1.0.
        issue_type must be one of: forgotten_subscription, price_increase, duplicate_charge, unused_subscription, overpriced_service, idle_money, billing_error
        action_type must be one of: cancel, negotiate, invest, claim, review, switch
        Be conservative — only flag issues with confidence >= 0.70.
        """

        let userPrompt = """
        Analyze these \(transactions.count) transactions. Find every money leak.
        User risk tolerance: \(user.riskTolerance.rawValue)

        TRANSACTIONS:
        \(txJSON)

        TODAY: \(Date().ISO8601Format())

        Return ONLY this JSON:
        {
          "issues": [
            {
              "issue_type": "...",
              "merchant_name": "...",
              "monthly_cost": 0.00,
              "annual_cost": 0.00,
              "confidence_score": 0.00,
              "action_type": "...",
              "explanation": "Plain English explanation for a non-technical person. Max 2 sentences. Specific about dollar amounts.",
              "negotiation_script": "Only include if action_type is negotiate. Word-for-word script starting with 'Hi, I'm calling about my account...'"
            }
          ],
          "total_potential_savings": 0.00,
          "investable_surplus": 0.00,
          "monthly_income_estimate": 0.00,
          "summary": "2-sentence summary of what was found",
          "transactions_analyzed": \(transactions.count)
        }
        """

        let body: [String: Any] = [
            "model":      model,
            "max_tokens": 4096,
            "system":     systemPrompt,
            "messages":   [["role": "user", "content": userPrompt]]
        ]

        guard let bodyData = try? JSONSerialization.data(withJSONObject: body) else { return nil }
        let req = makeRequest(body: bodyData)

        guard let (data, response) = try? await URLSession.shared.data(for: req) else { return nil }

        #if DEBUG
        if let http = response as? HTTPURLResponse, http.statusCode != 200 {
            let raw = String(data: data, encoding: .utf8) ?? "<binary>"
            print("[ClaudeService] analyzeTransactions HTTP \(http.statusCode): \(raw)")
        }
        #endif

        guard let json    = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let content = (json["content"] as? [[String: Any]])?.first,
              let text    = content["text"] as? String
        else { return nil }

        return parseJSONResult(from: text)
    }

    // MARK: - Chat (Streaming)

    /// Opens a streaming SSE connection to the Messages API and delivers each text delta
    /// to `onToken` as it arrives. Caller is responsible for assembling tokens into a message.
    func streamChat(
        messages: [ChatMessage],
        userContext: String,
        onToken: @escaping (String) -> Void
    ) async {
        let systemPrompt = """
        You are Keeper, an AI financial advisor and guardian. You have full context of the user's financial data.
        Answer questions about their finances with specific numbers from their data.
        Always reference actual dollar amounts when relevant.
        Include investment projections when asked, using current ETF prices.
        Always include a brief disclaimer on investment-related responses.
        Be conversational, warm, and direct. Maximum 300 words unless detail is requested.

        USER FINANCIAL CONTEXT:
        \(userContext)
        """

        let claudeMessages = messages.map { msg in
            ["role": msg.role.rawValue, "content": msg.content]
        }

        let body: [String: Any] = [
            "model":      model,
            "max_tokens": 1024,
            "system":     systemPrompt,
            "messages":   claudeMessages,
            "stream":     true
        ]

        guard let bodyData = try? JSONSerialization.data(withJSONObject: body) else { return }
        let req = makeRequest(body: bodyData)

        guard let (asyncBytes, response) = try? await URLSession.shared.bytes(for: req) else { return }

        #if DEBUG
        if let http = response as? HTTPURLResponse, http.statusCode != 200 {
            print("[ClaudeService] streamChat HTTP \(http.statusCode)")
        }
        #endif

        // Parse server-sent events: each line prefixed with "data: " carries a JSON object.
        for try await line in asyncBytes.lines {
            guard line.hasPrefix("data: ") else { continue }
            let payload = line.dropFirst(6) // strip "data: "
            guard !payload.isEmpty,
                  payload != "[DONE]",
                  let data   = payload.data(using: .utf8),
                  let json   = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let type_  = json["type"] as? String,
                  type_ == "content_block_delta",
                  let delta  = json["delta"] as? [String: Any],
                  let text   = delta["text"] as? String
            else { continue }
            onToken(text)
        }
    }

    // MARK: - Negotiation Script Generation

    /// Generates a word-for-word phone negotiation script for the given merchant and billing issue.
    /// Returns nil if the API call fails.
    func generateNegotiationScript(
        merchantName: String,
        monthlyCost: Double,
        issueType: String
    ) async -> String? {
        let prompt = """
        Write a concise phone negotiation script for lowering a \(merchantName) bill.
        Current monthly cost: $\(String(format: "%.2f", monthlyCost))
        Issue type: \(issueType)
        Requirements: Under 200 words. Natural speech. Include a specific ask. Include 2 pushback responses. End with escalation advice.
        Start with: "Hi, I'm calling about my account..."
        """

        let body: [String: Any] = [
            "model":      model,
            "max_tokens": 600,
            "messages":   [["role": "user", "content": prompt]]
        ]

        guard let bodyData = try? JSONSerialization.data(withJSONObject: body) else { return nil }
        let req = makeRequest(body: bodyData)

        guard let (data, _) = try? await URLSession.shared.data(for: req),
              let json       = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let content    = (json["content"] as? [[String: Any]])?.first,
              let text       = content["text"] as? String
        else { return nil }

        return text
    }

    // MARK: - Private Helpers

    /// Builds a URLRequest pre-loaded with Anthropic auth headers.
    private func makeRequest(body: Data) -> URLRequest {
        var req = URLRequest(url: URL(string: baseURL)!)
        req.httpMethod = "POST"
        req.httpBody   = body
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue(apiKey,             forHTTPHeaderField: "x-api-key")
        req.setValue(apiVersion,         forHTTPHeaderField: "anthropic-version")
        return req
    }

    /// Finds the first top-level JSON object in a string and decodes it as `ClaudeAnalysisResult`.
    /// Claude sometimes wraps the JSON in Markdown code fences; the regex handles that.
    private func parseJSONResult(from text: String) -> ClaudeAnalysisResult? {
        // Try to isolate the JSON object from any surrounding prose or markdown.
        guard let range    = text.range(of: "\\{[\\s\\S]*\\}", options: .regularExpression),
              let jsonData = String(text[range]).data(using: .utf8)
        else { return nil }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try? decoder.decode(ClaudeAnalysisResult.self, from: jsonData)
    }
}
