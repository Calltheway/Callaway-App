import SwiftUI
import Combine

@MainActor
final class AppState: ObservableObject {

    // MARK: - Auth State
    @Published var isAuthenticated: Bool = false
    @Published var currentUser: KeeperUser? = nil
    @Published var requiresBiometric: Bool = false

    // MARK: - Onboarding
    @Published var onboardingComplete: Bool = false
    @Published var onboardingStep: Int = 0

    // MARK: - Financial Data
    @Published var connectedAccounts: [ConnectedAccount] = []
    @Published var detectedIssues: [DetectedIssue] = []
    @Published var transactions: [Transaction] = []
    @Published var etfPrices: [ETFPrice] = ETFPrice.defaults
    @Published var investableSurplus: Double = 0
    @Published var totalSavingsFound: Double = 0
    @Published var monthlyIncomeEstimate: Double = 0

    // MARK: - Chat
    @Published var chatMessages: [ChatMessage] = []

    // MARK: - Loading States
    @Published var isAnalyzing: Bool = false
    @Published var isSyncing: Bool = false
    @Published var analysisProgress: Double = 0
    @Published var analysisStep: String = ""

    // MARK: - UI State
    @Published var selectedTab: Int = 0
    @Published var activeError: AppError? = nil
    @Published var showingPaywall: Bool = false

    // MARK: - Services
    let supabaseService = SupabaseService.shared
    let claudeService = ClaudeService.shared
    let alphaVantageService = AlphaVantageService.shared

    // MARK: - Init

    init() {
        onboardingComplete = UserDefaults.standard.bool(forKey: Constants.UserDefaultsKeys.onboardingComplete)
        Task { await checkExistingSession() }
    }

    // MARK: - Session Management

    func checkExistingSession() async {
        guard let token = KeychainManager.shared.retrieve(Constants.Keychain.supabaseAccessToken),
              !token.isEmpty else { return }
        if let user = await supabaseService.getCurrentUser() {
            self.currentUser = user
            self.isAuthenticated = true
            await loadUserData()
        }
    }

    func signOut() async {
        await supabaseService.signOut()
        KeychainManager.shared.deleteAll()
        isAuthenticated = false
        currentUser = nil
        detectedIssues = []
        transactions = []
        chatMessages = []
        onboardingComplete = false
        investableSurplus = 0
        totalSavingsFound = 0
        monthlyIncomeEstimate = 0
        connectedAccounts = []
        selectedTab = 0
    }

    // MARK: - Data Loading

    func loadUserData() async {
        guard let user = currentUser else { return }

        async let accounts = supabaseService.fetchAccounts(userId: user.id)
        async let issues   = supabaseService.fetchIssues(userId: user.id)
        async let prices   = alphaVantageService.fetchAllETFPrices()

        let (fetchedAccounts, fetchedIssues, fetchedPrices) = await (accounts, issues, prices)

        self.connectedAccounts = fetchedAccounts
        self.detectedIssues    = fetchedIssues
        if !fetchedPrices.isEmpty { self.etfPrices = fetchedPrices }

        totalSavingsFound = fetchedIssues
            .filter { $0.status == .resolved }
            .compactMap { $0.amountSaved }
            .reduce(0, +)

        investableSurplus      = currentUser?.investableSurplus ?? 0
        monthlyIncomeEstimate  = currentUser?.monthlyIncomeEstimate ?? 0
    }

    // MARK: - Analysis

    func runAnalysis() async {
        guard !connectedAccounts.isEmpty else { return }
        guard let userId = currentUser?.id else { return }

        isAnalyzing      = true
        analysisProgress = 0

        analysisStep     = "Reading transactions..."
        analysisProgress = 0.2
        let txs = await supabaseService.fetchTransactions(userId: userId)
        self.transactions = txs

        analysisStep     = "Analyzing with AI..."
        analysisProgress = 0.5

        if let result = await claudeService.analyzeTransactions(txs, user: currentUser!) {
            analysisStep     = "Saving insights..."
            analysisProgress = 0.8

            await supabaseService.saveAnalysisResult(result, userId: userId)
            await loadUserData()

            self.investableSurplus     = result.investableSurplus
            self.monthlyIncomeEstimate = result.monthlyIncomeEstimate

            if var user = currentUser {
                user.investableSurplus     = result.investableSurplus
                user.monthlyIncomeEstimate = result.monthlyIncomeEstimate
                await supabaseService.updateUser(user)
                self.currentUser = user
            }
        }

        analysisProgress = 1.0
        analysisStep     = "Done!"
        isAnalyzing      = false

        HapticManager.shared.savingsRevealed()
    }

    // MARK: - Issue Management

    func markIssueResolved(_ issue: DetectedIssue, amountSaved: Double) async {
        var updated       = issue
        updated.status    = .resolved
        updated.resolvedAt = Date()
        updated.amountSaved = amountSaved

        await supabaseService.updateIssue(updated)

        if let idx = detectedIssues.firstIndex(where: { $0.id == issue.id }) {
            detectedIssues[idx] = updated
        }

        totalSavingsFound += amountSaved
        HapticManager.shared.success()
    }

    func dismissIssue(_ issue: DetectedIssue) async {
        var updated    = issue
        updated.status = .dismissed
        await supabaseService.updateIssue(updated)
        if let idx = detectedIssues.firstIndex(where: { $0.id == issue.id }) {
            detectedIssues[idx] = updated
        }
    }

    // MARK: - Chat History

    func loadChatHistory() async {
        guard let userId = currentUser?.id else { return }
        let history = await supabaseService.fetchChatHistory(userId: userId)
        self.chatMessages = history
    }

    func saveChatMessage(_ message: ChatMessage) async {
        guard let userId = currentUser?.id else { return }
        await supabaseService.saveChatMessage(message, userId: userId)
    }

    // MARK: - Error Handling

    func presentError(title: String, message: String) {
        activeError = AppError(message: message, title: title)
    }

    func clearError() {
        activeError = nil
    }
}

// MARK: - App Error

struct AppError: Identifiable {
    let id = UUID()
    let message: String
    let title: String
}
