import SwiftUI

struct ResultsRevealView: View {
    let onComplete: () -> Void
    @EnvironmentObject var appState: AppState

    @State private var countedAmount: Double = 0
    @State private var phase: RevealPhase = .counting
    @State private var issueCardsVisible = 0
    @State private var ctaVisible = false

    enum RevealPhase { case counting, results }

    private var annualAmount: Double {
        appState.detectedIssues
            .filter { $0.status == .new || $0.status == .inProgress }
            .reduce(0) { $0 + $1.annualCost }
    }

    private var topIssues: [DetectedIssue] {
        Array(
            appState.detectedIssues
                .filter { $0.status == .new }
                .sorted { $0.annualCost > $1.annualCost }
                .prefix(3)
        )
    }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(hex: "#0A1628"), Color(hex: "#0F1D35")],
                startPoint: .topLeading, endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Amount counter
                VStack(spacing: 12) {
                    Text("We found")
                        .font(.title3)
                        .foregroundStyle(Color.white.opacity(0.65))

                    Text(countedAmount.asCurrencyRounded)
                        .font(.system(size: 64, weight: .black, design: .rounded))
                        .foregroundStyle(Color.keeperGreen)
                        .shadow(color: Color.keeperGreen.opacity(0.4), radius: 16)
                        .contentTransition(.numericText(countsDown: false))
                        .animation(.easeOut(duration: 1.8), value: countedAmount)

                    Text("leaking from your finances annually")
                        .font(.body)
                        .foregroundStyle(Color.white.opacity(0.55))
                        .multilineTextAlignment(.center)
                }

                // Issue preview cards
                if phase == .results && !topIssues.isEmpty {
                    VStack(spacing: 10) {
                        Text("\(appState.detectedIssues.count) issue\(appState.detectedIssues.count == 1 ? "" : "s") found")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundStyle(Color.white.opacity(0.45))
                            .kerning(1.0)
                            .padding(.top, 32)

                        ForEach(Array(topIssues.enumerated()), id: \.element.id) { idx, issue in
                            if idx < issueCardsVisible {
                                ResultIssueCard(issue: issue)
                                    .transition(.asymmetric(
                                        insertion: .move(edge: .bottom).combined(with: .opacity),
                                        removal: .opacity
                                    ))
                            }
                        }
                    }
                    .padding(.horizontal, 24)
                } else if phase == .results {
                    // No issues found (clean finances)
                    VStack(spacing: 12) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(Color.keeperGreen)
                            .padding(.top, 32)
                        Text("Your finances look clean!")
                            .font(.title3).fontWeight(.semibold)
                            .foregroundStyle(.white)
                        Text("No significant issues detected. We'll keep watching.")
                            .font(.subheadline)
                            .foregroundStyle(Color.white.opacity(0.5))
                            .multilineTextAlignment(.center)
                    }
                }

                Spacer()

                // CTA
                if ctaVisible {
                    VStack(spacing: 8) {
                        Button("View My Dashboard") {
                            HapticManager.shared.impact(.medium)
                            onComplete()
                        }
                        .buttonStyle(KeeperPrimaryButtonStyle())
                        .padding(.horizontal, 24)

                        Text("Your full analysis is ready")
                            .font(.caption)
                            .foregroundStyle(Color.white.opacity(0.35))
                    }
                    .padding(.bottom, 52)
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
        }
        .onAppear { startReveal() }
    }

    private func startReveal() {
        // Count up to the found amount
        let target = annualAmount > 0 ? annualAmount : 3240 // fallback demo amount
        let duration: Double = 1.8
        let steps = 60
        let stepValue = target / Double(steps)
        let stepDelay = duration / Double(steps)

        for i in 0...steps {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * stepDelay) {
                countedAmount = min(Double(i) * stepValue, target)
            }
        }

        // Switch to results phase
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.2) {
            withAnimation(.spring(response: 0.5)) { phase = .results }
            HapticManager.shared.notification(.success)
        }

        // Animate issue cards in
        for i in 0..<min(topIssues.count, 3) {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.5 + Double(i) * 0.2) {
                withAnimation(.spring(response: 0.45)) { issueCardsVisible = i + 1 }
                HapticManager.shared.impact(.light)
            }
        }

        // Show CTA
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.4) {
            withAnimation(.easeOut(duration: 0.4)) { ctaVisible = true }
        }
    }
}

// MARK: - Result Issue Card

private struct ResultIssueCard: View {
    let issue: DetectedIssue

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Color.keeperGreen.opacity(0.12))
                    .frame(width: 44, height: 44)
                Image(systemName: issue.issueType.iconName)
                    .font(.body)
                    .foregroundStyle(Color.keeperGreen)
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(issue.merchantName)
                    .font(.subheadline).fontWeight(.semibold)
                    .foregroundStyle(.white)
                Text(issue.issueType.displayName)
                    .font(.caption)
                    .foregroundStyle(Color.white.opacity(0.5))
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(issue.annualCost.asCurrencyRounded)
                    .font(.subheadline).fontWeight(.bold)
                    .foregroundStyle(Color.keeperGreen)
                Text("per year")
                    .font(.caption2)
                    .foregroundStyle(Color.white.opacity(0.35))
            }
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color.white.opacity(0.05))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(Color.white.opacity(0.08), lineWidth: 1)
                )
        )
    }
}

#Preview {
    ResultsRevealView(onComplete: {})
        .environmentObject(AppState())
}
