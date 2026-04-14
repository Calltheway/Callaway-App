import SwiftUI

struct ChatView: View {
    @EnvironmentObject var appState: AppState
    @State private var inputText = ""
    @State private var isStreaming = false
    @State private var scrollProxy: ScrollViewProxy? = nil
    @FocusState private var inputFocused: Bool

    private let bottomAnchor = "chat_bottom"

    private let suggestedPrompts = [
        "What's my biggest money leak?",
        "How much could I save in 10 years if I invested my surplus?",
        "Explain my Adobe subscription issue",
        "What's the best ETF for a beginner?",
        "How do I negotiate my Verizon bill?",
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Message list
                ScrollViewReader { proxy in
                    ScrollView(showsIndicators: false) {
                        LazyVStack(spacing: 12) {
                            if appState.chatMessages.isEmpty {
                                emptyState
                                    .padding(.top, 32)
                            } else {
                                ForEach(appState.chatMessages) { message in
                                    MessageBubble(message: message)
                                }
                            }
                            // Invisible anchor
                            Color.clear.frame(height: 1).id(bottomAnchor)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                    }
                    .onAppear {
                        scrollProxy = proxy
                        Task { await appState.loadChatHistory() }
                    }
                    .onChange(of: appState.chatMessages.count) { _ in
                        scrollToBottom(proxy: proxy)
                    }
                }

                Divider()

                // Input bar
                HStack(alignment: .bottom, spacing: 10) {
                    TextField("Ask Keeper anything…", text: $inputText, axis: .vertical)
                        .lineLimit(1...5)
                        .font(.body)
                        .focused($inputFocused)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: 20, style: .continuous)
                                .fill(Color(.secondarySystemBackground))
                        )
                        .onSubmit { sendMessage() }

                    Button(action: sendMessage) {
                        Image(systemName: isStreaming ? "stop.circle.fill" : "arrow.up.circle.fill")
                            .font(.system(size: 32))
                            .foregroundStyle(canSend ? Color.keeperGreen : Color.secondary)
                    }
                    .disabled(!canSend)
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(Color(.systemBackground))
            }
            .navigationTitle("Ask AI")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if !appState.chatMessages.isEmpty {
                        Button {
                            HapticManager.shared.impact(.light)
                            withAnimation { appState.chatMessages = [] }
                        } label: {
                            Image(systemName: "trash")
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
    }

    private var canSend: Bool {
        !inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !isStreaming
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 28) {
            ZStack {
                Circle()
                    .fill(Color.keeperGreen.opacity(0.10))
                    .frame(width: 80, height: 80)
                Image(systemName: "brain.head.profile")
                    .font(.system(size: 36))
                    .foregroundStyle(Color.keeperGreen)
            }

            VStack(spacing: 8) {
                Text("Your financial AI")
                    .font(.title3).fontWeight(.bold)
                Text("Ask me anything about your money, subscriptions, or investments.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            // Suggested prompts
            VStack(spacing: 10) {
                Text("SUGGESTED")
                    .font(.caption2).fontWeight(.semibold)
                    .foregroundStyle(.secondary)
                    .kerning(1.0)

                ForEach(suggestedPrompts, id: \.self) { prompt in
                    Button {
                        inputText = prompt
                        sendMessage()
                    } label: {
                        HStack {
                            Text(prompt)
                                .font(.subheadline)
                                .foregroundStyle(.primary)
                                .multilineTextAlignment(.leading)
                            Spacer()
                            Image(systemName: "arrow.up.right")
                                .font(.caption)
                                .foregroundStyle(Color.keeperGreen)
                        }
                        .padding(14)
                        .background(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .fill(Color(.secondarySystemBackground))
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    // MARK: - Send

    private func sendMessage() {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, !isStreaming else { return }

        inputText = ""
        inputFocused = false
        isStreaming = true
        HapticManager.shared.impact(.light)

        let userMsg = ChatMessage(role: .user, content: text, createdAt: Date(), isStreaming: false)
        appState.chatMessages.append(userMsg)
        Task { await appState.saveChatMessage(userMsg) }

        var assistantMsg = ChatMessage(role: .assistant, content: "", createdAt: Date(), isStreaming: true)
        appState.chatMessages.append(assistantMsg)
        let assistantIndex = appState.chatMessages.count - 1

        Task {
            // Build a context-aware system prompt
            let systemPrompt = buildSystemPrompt()

            await appState.claudeService.streamChat(
                messages: Array(appState.chatMessages.dropLast()),
                userContext: buildUserContext()
            ) { token in
                appState.chatMessages[assistantIndex].content += token
            }

            appState.chatMessages[assistantIndex].isStreaming = false
            isStreaming = false
            HapticManager.shared.impact(.light)
            let finalMsg = appState.chatMessages[assistantIndex]
            Task { await appState.saveChatMessage(finalMsg) }
        }
    }

    private func buildUserContext() -> String {
        let issuesSummary = appState.detectedIssues.prefix(5).map {
            "- \($0.merchantName): \($0.issueType.displayName), $\(String(format: "%.2f", $0.annualCost))/year"
        }.joined(separator: "\n")

        let surplus = appState.investableSurplus > 0
            ? "Investable surplus: $\(String(format: "%.2f", appState.investableSurplus))/month"
            : "Investable surplus: not yet calculated"

        return """
        \(surplus)
        Open issues:
        \(issuesSummary.isEmpty ? "None detected yet" : issuesSummary)
        """
    }

    private func scrollToBottom(proxy: ScrollViewProxy) {
        withAnimation(.easeOut(duration: 0.3)) {
            proxy.scrollTo(bottomAnchor, anchor: .bottom)
        }
    }
}

// MARK: - Message Bubble

private struct MessageBubble: View {
    let message: ChatMessage

    var isUser: Bool { message.role == .user }

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if isUser { Spacer(minLength: 60) }

            if !isUser {
                ZStack {
                    Circle()
                        .fill(Color.keeperGreen.opacity(0.12))
                        .frame(width: 28, height: 28)
                    Text("K")
                        .font(.system(size: 13, weight: .black))
                        .foregroundStyle(Color.keeperGreen)
                }
            }

            VStack(alignment: isUser ? .trailing : .leading, spacing: 4) {
                ZStack(alignment: .bottomTrailing) {
                    Text(message.content.isEmpty && message.isStreaming ? "…" : message.content)
                        .font(.body)
                        .foregroundStyle(isUser ? .white : .primary)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(
                                cornerRadius: 18,
                                style: .continuous
                            )
                            .fill(isUser ? Color.keeperGreen : Color(.secondarySystemBackground))
                        )

                    if message.isStreaming {
                        TypingIndicator()
                            .offset(x: -10, y: -8)
                    }
                }

                Text(message.createdAt.formatted(.dateTime.hour().minute()))
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            if !isUser { Spacer(minLength: 60) }
        }
    }
}

// MARK: - Typing Indicator

private struct TypingIndicator: View {
    @State private var phase = 0

    var body: some View {
        HStack(spacing: 3) {
            ForEach(0..<3, id: \.self) { i in
                Circle()
                    .fill(Color.secondary.opacity(0.5))
                    .frame(width: 5, height: 5)
                    .offset(y: phase == i ? -3 : 0)
                    .animation(
                        .easeInOut(duration: 0.4)
                        .repeatForever()
                        .delay(Double(i) * 0.15),
                        value: phase
                    )
            }
        }
        .onAppear {
            Timer.scheduledTimer(withTimeInterval: 0.45, repeats: true) { _ in
                phase = (phase + 1) % 3
            }
        }
    }
}

#Preview {
    ChatView()
        .environmentObject(AppState())
}
