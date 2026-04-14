import Foundation

/// Pure URLSession-based Supabase REST client. No external SDK dependency.
/// Uses Supabase's PostgREST API with JWT bearer auth and Supabase Auth endpoints.
@MainActor
final class SupabaseService {
    static let shared = SupabaseService()
    private init() {}

    // MARK: - Configuration

    private var supabaseURL: String { AppConfig.supabaseURL }
    private var anonKey: String     { AppConfig.supabaseAnonKey }

    private var accessToken: String? {
        KeychainManager.shared.retrieve(Constants.Keychain.supabaseAccessToken)
    }

    // MARK: - Headers

    private func makeHeaders(includeAuth: Bool = true) -> [String: String] {
        var headers: [String: String] = [
            "apikey":        anonKey,
            "Content-Type":  "application/json",
            "Prefer":        "return=representation"
        ]
        if includeAuth, let token = accessToken {
            headers["Authorization"] = "Bearer \(token)"
        } else {
            headers["Authorization"] = "Bearer \(anonKey)"
        }
        return headers
    }

    // MARK: - Generic Request

    /// Sends an HTTP request to the PostgREST REST API and decodes the response body as T.
    /// Returns nil on network error, bad status, or decode failure — callers handle nil gracefully.
    private func request<T: Decodable>(
        _ path: String,
        method: String = "GET",
        body: Data? = nil
    ) async -> T? {
        guard let url = URL(string: "\(supabaseURL)/rest/v1/\(path)") else { return nil }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.httpBody   = body
        makeHeaders().forEach { req.setValue($1, forHTTPHeaderField: $0) }

        guard let (data, response) = try? await URLSession.shared.data(for: req) else { return nil }

        // Surface server-side errors in debug builds for easier tracing.
        #if DEBUG
        if let http = response as? HTTPURLResponse, http.statusCode >= 400 {
            let body = String(data: data, encoding: .utf8) ?? "<binary>"
            print("[SupabaseService] \(method) /\(path) → HTTP \(http.statusCode): \(body)")
        }
        #endif

        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        decoder.keyDecodingStrategy  = .convertFromSnakeCase
        return try? decoder.decode(T.self, from: data)
    }

    // MARK: - Auth: Sign In

    /// Authenticates with email + password via Supabase Auth, stores tokens in Keychain,
    /// and returns the resolved KeeperUser profile.
    func signIn(email: String, password: String) async -> KeeperUser? {
        guard let url = URL(string: "\(supabaseURL)/auth/v1/token?grant_type=password") else { return nil }

        let payload = ["email": email, "password": password]
        guard let body = try? JSONSerialization.data(withJSONObject: payload) else { return nil }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.httpBody   = body
        makeHeaders(includeAuth: false).forEach { req.setValue($1, forHTTPHeaderField: $0) }

        guard let (data, _) = try? await URLSession.shared.data(for: req),
              let json         = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let accessToken  = json["access_token"]  as? String,
              let refreshToken = json["refresh_token"] as? String
        else { return nil }

        KeychainManager.shared.save(accessToken,  for: Constants.Keychain.supabaseAccessToken)
        KeychainManager.shared.save(refreshToken, for: Constants.Keychain.supabaseRefreshToken)
        return await getCurrentUser()
    }

    // MARK: - Auth: Sign Up

    /// Creates a new Supabase Auth account, stores tokens, and returns the KeeperUser profile.
    func signUp(email: String, password: String) async -> KeeperUser? {
        guard let url = URL(string: "\(supabaseURL)/auth/v1/signup") else { return nil }

        let payload = ["email": email, "password": password]
        guard let body = try? JSONSerialization.data(withJSONObject: payload) else { return nil }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.httpBody   = body
        makeHeaders(includeAuth: false).forEach { req.setValue($1, forHTTPHeaderField: $0) }

        guard let (data, _) = try? await URLSession.shared.data(for: req),
              let json         = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let accessToken  = json["access_token"]  as? String,
              let refreshToken = json["refresh_token"] as? String
        else { return nil }

        KeychainManager.shared.save(accessToken,  for: Constants.Keychain.supabaseAccessToken)
        KeychainManager.shared.save(refreshToken, for: Constants.Keychain.supabaseRefreshToken)
        return await getCurrentUser()
    }

    // MARK: - Auth: Sign Out

    /// Revokes the current session server-side. Keychain cleanup is the caller's responsibility.
    func signOut() async {
        guard let url = URL(string: "\(supabaseURL)/auth/v1/logout") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        makeHeaders().forEach { req.setValue($1, forHTTPHeaderField: $0) }
        _ = try? await URLSession.shared.data(for: req)
    }

    // MARK: - Auth: Current User

    /// Fetches the Supabase Auth user, then resolves or creates the matching row in `public.users`.
    func getCurrentUser() async -> KeeperUser? {
        guard let url = URL(string: "\(supabaseURL)/auth/v1/user") else { return nil }
        var req = URLRequest(url: url)
        makeHeaders().forEach { req.setValue($1, forHTTPHeaderField: $0) }

        guard let (data, _) = try? await URLSession.shared.data(for: req),
              let json      = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let idStr     = json["id"]    as? String,
              let id        = UUID(uuidString: idStr),
              let email     = json["email"] as? String
        else { return nil }

        // Try to fetch the matching profile row.
        let users: [KeeperUser]? = await request("users?id=eq.\(id)&select=*")
        if let existing = users?.first { return existing }

        // First sign-in: create a default profile.
        let newUser = KeeperUser(
            id:                    id,
            email:                 email,
            subscriptionTier:      .free,
            totalSaved:            0,
            riskTolerance:         .moderate,
            monthlyIncomeEstimate: nil,
            investableSurplus:     nil,
            onboardingComplete:    false,
            createdAt:             Date()
        )
        await upsertUser(newUser)
        return newUser
    }

    // MARK: - Auth: Refresh Token

    /// Silently exchanges a refresh token for new access/refresh tokens.
    /// Returns true on success.
    @discardableResult
    func refreshSession() async -> Bool {
        guard let refreshToken = KeychainManager.shared.retrieve(Constants.Keychain.supabaseRefreshToken),
              !refreshToken.isEmpty,
              let url = URL(string: "\(supabaseURL)/auth/v1/token?grant_type=refresh_token")
        else { return false }

        let payload = ["refresh_token": refreshToken]
        guard let body = try? JSONSerialization.data(withJSONObject: payload) else { return false }

        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.httpBody   = body
        makeHeaders(includeAuth: false).forEach { req.setValue($1, forHTTPHeaderField: $0) }

        guard let (data, _)    = try? await URLSession.shared.data(for: req),
              let json          = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let newAccess     = json["access_token"]  as? String,
              let newRefresh    = json["refresh_token"] as? String
        else { return false }

        KeychainManager.shared.save(newAccess,  for: Constants.Keychain.supabaseAccessToken)
        KeychainManager.shared.save(newRefresh, for: Constants.Keychain.supabaseRefreshToken)
        return true
    }

    // MARK: - Users

    /// Inserts or replaces the user's profile row (upsert on `id` primary key).
    func upsertUser(_ user: KeeperUser) async {
        let encoder = makeEncoder()
        guard let body = try? encoder.encode(user) else { return }
        let _: [KeeperUser]? = await request("users?on_conflict=id", method: "POST", body: body)
    }

    /// Patches mutable fields of an existing user profile row.
    func updateUser(_ user: KeeperUser) async {
        let encoder = makeEncoder()
        guard let body = try? encoder.encode(user) else { return }
        let _: [KeeperUser]? = await request("users?id=eq.\(user.id)", method: "PATCH", body: body)
    }

    // MARK: - Connected Accounts

    func fetchAccounts(userId: UUID) async -> [ConnectedAccount] {
        await request("connected_accounts?user_id=eq.\(userId)&select=*&order=institution_name.asc") ?? []
    }

    func saveAccount(_ account: ConnectedAccount) async {
        let encoder = makeEncoder()
        guard let body = try? encoder.encode(account) else { return }
        let _: [ConnectedAccount]? = await request("connected_accounts", method: "POST", body: body)
    }

    func deleteAccount(_ account: ConnectedAccount) async {
        let _: [ConnectedAccount]? = await request(
            "connected_accounts?id=eq.\(account.id)", method: "DELETE"
        )
    }

    // MARK: - Transactions

    func fetchTransactions(userId: UUID) async -> [Transaction] {
        await request(
            "transactions?user_id=eq.\(userId)&select=*&order=date.desc&limit=500"
        ) ?? []
    }

    /// Inserts transactions, ignoring conflicts on the Plaid transaction ID to prevent duplicates.
    func upsertTransactions(_ transactions: [Transaction]) async {
        guard !transactions.isEmpty else { return }
        let encoder = makeEncoder()
        guard let body = try? encoder.encode(transactions) else { return }
        let _: [Transaction]? = await request(
            "transactions?on_conflict=plaid_transaction_id", method: "POST", body: body
        )
    }

    // MARK: - Detected Issues

    func fetchIssues(userId: UUID) async -> [DetectedIssue] {
        await request(
            "detected_issues?user_id=eq.\(userId)&select=*&order=monthly_cost.desc"
        ) ?? []
    }

    /// Converts a ClaudeAnalysisResult into DetectedIssue rows and bulk-inserts them.
    func saveAnalysisResult(_ result: ClaudeAnalysisResult, userId: UUID) async {
        let issues: [DetectedIssue] = result.issues.map { claudeIssue in
            DetectedIssue(
                id:                  UUID(),
                userId:              userId,
                issueType:           DetectedIssue.IssueType(rawValue: claudeIssue.issueType) ?? .unusedSubscription,
                merchantName:        claudeIssue.merchantName,
                monthlyCost:         claudeIssue.monthlyCost,
                annualCost:          claudeIssue.annualCost,
                status:              .new,
                confidenceScore:     claudeIssue.confidenceScore,
                detectedAt:          Date(),
                resolvedAt:          nil,
                amountSaved:         nil,
                actionType:          DetectedIssue.ActionType(rawValue: claudeIssue.actionType) ?? .review,
                claudeExplanation:   claudeIssue.explanation,
                negotiationScript:   claudeIssue.negotiationScript
            )
        }

        guard !issues.isEmpty else { return }
        let encoder = makeEncoder()
        guard let body = try? encoder.encode(issues) else { return }
        let _: [DetectedIssue]? = await request("detected_issues", method: "POST", body: body)
    }

    func updateIssue(_ issue: DetectedIssue) async {
        let encoder = makeEncoder()
        guard let body = try? encoder.encode(issue) else { return }
        let _: [DetectedIssue]? = await request(
            "detected_issues?id=eq.\(issue.id)", method: "PATCH", body: body
        )
    }

    // MARK: - Chat History

    func saveChatMessage(_ message: ChatMessage, userId: UUID) async {
        let payload: [String: Any] = [
            "user_id": userId.uuidString,
            "role":    message.role.rawValue,
            "content": message.content
        ]
        guard let body = try? JSONSerialization.data(withJSONObject: payload) else { return }
        // Returned type is intentionally ignored; we just fire-and-forget.
        let _: [[String: String]]? = await request("chat_history", method: "POST", body: body)
    }

    func fetchChatHistory(userId: UUID) async -> [ChatMessage] {
        guard let url = URL(string: "\(supabaseURL)/rest/v1/chat_history?user_id=eq.\(userId)&select=*&order=created_at.asc&limit=100") else { return [] }

        var req = URLRequest(url: url)
        makeHeaders().forEach { req.setValue($1, forHTTPHeaderField: $0) }

        guard let (data, _) = try? await URLSession.shared.data(for: req),
              let rows = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]]
        else { return [] }

        return rows.compactMap { row -> ChatMessage? in
            guard let roleStr = row["role"]    as? String,
                  let content = row["content"] as? String,
                  let role    = ChatMessage.MessageRole(rawValue: roleStr)
            else { return nil }
            return ChatMessage(role: role, content: content, createdAt: Date(), isStreaming: false)
        }
    }

    // MARK: - Private Helpers

    private func makeEncoder() -> JSONEncoder {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy  = .convertToSnakeCase
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }
}
