import SwiftUI

struct FirstScanView: View {
    let onComplete: () -> Void
    @EnvironmentObject var appState: AppState

    @State private var phase: ScanPhase = .preparing
    @State private var pulseScale: CGFloat = 1.0
    @State private var dotAngles: [Double] = Array(repeating: 0, count: 6)
    @State private var appeared = false

    enum ScanPhase: CaseIterable {
        case preparing, scanning, analyzing, finalizing

        var title: String {
            switch self {
            case .preparing:   return "Preparing your scan…"
            case .scanning:    return "Reading transactions…"
            case .analyzing:   return "AI is analyzing…"
            case .finalizing:  return "Finalizing insights…"
            }
        }

        var subtitle: String {
            switch self {
            case .preparing:   return "Connecting to your accounts"
            case .scanning:    return "Checking the last 6 months"
            case .analyzing:   return "Looking for money leaks"
            case .finalizing:  return "Almost there — hang tight"
            }
        }

        var iconName: String {
            switch self {
            case .preparing:   return "arrow.down.circle.fill"
            case .scanning:    return "doc.text.magnifyingglass"
            case .analyzing:   return "brain.head.profile"
            case .finalizing:  return "checkmark.seal.fill"
            }
        }
    }

    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [Color(hex: "#0A1628"), Color(hex: "#0F1D35")],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Animated scan ring
                ZStack {
                    ForEach(0..<3, id: \.self) { i in
                        Circle()
                            .stroke(Color.keeperGreen.opacity(0.08 - Double(i) * 0.02), lineWidth: 1)
                            .frame(width: CGFloat(160 + i * 50), height: CGFloat(160 + i * 50))
                            .scaleEffect(pulseScale + CGFloat(i) * 0.04)
                            .animation(
                                .easeInOut(duration: 1.8)
                                .repeatForever(autoreverses: true)
                                .delay(Double(i) * 0.3),
                                value: pulseScale
                            )
                    }

                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color.keeperGreen.opacity(0.25), Color.keeperGreen.opacity(0.05)],
                                center: .center, startRadius: 0, endRadius: 70
                            )
                        )
                        .frame(width: 130, height: 130)

                    Image(systemName: phase.iconName)
                        .font(.system(size: 44))
                        .foregroundStyle(Color.keeperGreen)
                        .shadow(color: Color.keeperGreen.opacity(0.6), radius: 10)
                        .transition(.scale.combined(with: .opacity))
                        .id(phase)
                }
                .frame(height: 280)

                // Phase text
                VStack(spacing: 10) {
                    Text(phase.title)
                        .font(.title3).fontWeight(.bold)
                        .foregroundStyle(.white)
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
                        .id("title_\(phase)")

                    Text(phase.subtitle)
                        .font(.subheadline)
                        .foregroundStyle(Color.white.opacity(0.55))
                        .transition(.opacity)
                        .id("sub_\(phase)")
                }
                .animation(.easeInOut(duration: 0.35), value: phase)
                .padding(.top, 32)

                // Step indicators
                HStack(spacing: 8) {
                    ForEach(ScanPhase.allCases, id: \.self) { p in
                        Capsule()
                            .fill(p == phase ? Color.keeperGreen : Color.white.opacity(0.2))
                            .frame(width: p == phase ? 24 : 8, height: 4)
                            .animation(.spring(response: 0.4), value: phase)
                    }
                }
                .padding(.top, 28)

                Spacer()

                Text("Keeper uses Claude AI to analyze your spending patterns")
                    .font(.caption)
                    .foregroundStyle(Color.white.opacity(0.3))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 48)
                    .padding(.bottom, 52)
            }
        }
        .onAppear { startScan() }
    }

    private func startScan() {
        pulseScale = 1.08

        // Seed demo transactions if needed
        Task {
            await seedDemoTransactionsIfNeeded()

            // Phase progression
            let phases: [(ScanPhase, TimeInterval)] = [
                (.scanning,   1.2),
                (.analyzing,  2.0),
                (.finalizing, 3.5),
            ]
            var elapsed: TimeInterval = 0.8
            for (p, delay) in phases {
                elapsed += delay
                DispatchQueue.main.asyncAfter(deadline: .now() + elapsed) {
                    withAnimation { phase = p }
                }
            }

            // Run real analysis (or skip if no accounts)
            if !appState.connectedAccounts.isEmpty {
                await appState.runAnalysis()
            }

            DispatchQueue.main.asyncAfter(deadline: .now() + elapsed + 1.5) {
                HapticManager.shared.success()
                onComplete()
            }
        }
    }

    private func seedDemoTransactionsIfNeeded() async {
        guard let account = appState.connectedAccounts.first,
              let userId = appState.currentUser?.id else { return }

        let merchants: [(String, Double, Transaction.TransactionCategory, Bool)] = [
            ("Netflix",          15.99, .subscriptions,   true),
            ("Spotify",          9.99,  .subscriptions,   true),
            ("Hulu",             17.99, .subscriptions,   true),
            ("Disney+",          13.99, .subscriptions,   true),
            ("Apple iCloud",     2.99,  .subscriptions,   true),
            ("Adobe CC",         54.99, .subscriptions,   true),
            ("Gym (Planet Fitness)", 24.99, .subscriptions, true),
            ("Amazon Prime",     14.99, .subscriptions,   true),
            ("Whole Foods",      145.30, .food,           false),
            ("Trader Joe's",     87.54, .food,            false),
            ("Chipotle",         13.45, .food,            false),
            ("Starbucks",        6.75,  .food,            false),
            ("Uber",             24.00, .transportation,  false),
            ("Shell Gas",        58.20, .transportation,  false),
            ("Con Edison",       112.40, .utilities,      true),
            ("Verizon",          89.00, .utilities,       true),
            ("Direct Deposit",   -3800.00, .income,       true),
        ]

        let calendar = Calendar.current
        let now = Date()
        var transactions: [Transaction] = []

        for (merchant, amount, category, recurring) in merchants {
            for monthOffset in 0..<4 {
                guard let date = calendar.date(byAdding: .month, value: -monthOffset, to: now) else { continue }
                let tx = Transaction(
                    id: UUID(),
                    userId: userId,
                    accountId: account.id,
                    merchantName: merchant,
                    amount: amount,
                    date: date,
                    category: category,
                    isRecurring: recurring,
                    recurringFrequency: recurring ? .monthly : nil,
                    isFlagged: false,
                    plaidTransactionId: "demo_\(merchant.lowercased().replacingOccurrences(of: " ", with: "_"))_\(monthOffset)"
                )
                transactions.append(tx)
            }
        }

        await appState.supabaseService.upsertTransactions(transactions)
        appState.transactions = transactions
    }
}

#Preview {
    FirstScanView(onComplete: {})
        .environmentObject(AppState())
}
