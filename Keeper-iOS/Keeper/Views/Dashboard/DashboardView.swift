import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var appState: AppState
    @State private var appeared = false

    private var newIssueCount: Int {
        appState.detectedIssues.filter { $0.status == .new }.count
    }

    private var totalAnnualLeak: Double {
        appState.detectedIssues
            .filter { $0.status == .new || $0.status == .inProgress }
            .reduce(0) { $0 + $1.annualCost }
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // Greeting + sync button
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(greeting)
                                .font(.title2).fontWeight(.bold)
                            Text("Here's your financial pulse")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Button {
                            HapticManager.shared.impact(.light)
                            Task { await appState.loadUserData() }
                        } label: {
                            Image(systemName: "arrow.clockwise")
                                .font(.body)
                                .foregroundStyle(Color.keeperGreen)
                        }
                        .disabled(appState.isSyncing)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 8)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 12)

                    // Hero savings card
                    HeroCard(
                        totalLeaking: totalAnnualLeak,
                        totalSaved: appState.totalSavingsFound,
                        issueCount: newIssueCount
                    )
                    .padding(.horizontal, 20)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 16)

                    // Quick action row
                    QuickActionsRow()
                        .padding(.horizontal, 20)
                        .opacity(appeared ? 1 : 0)

                    // Active issues preview
                    if !appState.detectedIssues.isEmpty {
                        IssuesPreviewSection()
                            .opacity(appeared ? 1 : 0)
                    }

                    // Connected accounts
                    AccountsSection()
                        .opacity(appeared ? 1 : 0)

                    // Invest teaser
                    if appState.investableSurplus > 0 {
                        InvestTeaserCard(surplus: appState.investableSurplus)
                            .padding(.horizontal, 20)
                            .opacity(appeared ? 1 : 0)
                    }

                    Spacer().frame(height: 24)
                }
            }
            .navigationTitle("Keeper")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if appState.isAnalyzing {
                        ProgressView()
                            .tint(Color.keeperGreen)
                            .scaleEffect(0.8)
                    }
                }
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.45).delay(0.1)) { appeared = true }
        }
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let name = appState.currentUser?.email.components(separatedBy: "@").first?.capitalized ?? "there"
        switch hour {
        case 0..<12:  return "Good morning, \(name)"
        case 12..<17: return "Good afternoon, \(name)"
        default:      return "Good evening, \(name)"
        }
    }
}

// MARK: - Hero Card

private struct HeroCard: View {
    let totalLeaking: Double
    let totalSaved: Double
    let issueCount: Int

    var body: some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "#0A1628"), Color(hex: "#0D2040")],
                        startPoint: .topLeading, endPoint: .bottomTrailing
                    )
                )

            VStack(alignment: .leading, spacing: 20) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("ANNUAL MONEY LEAK")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundStyle(Color.white.opacity(0.5))
                            .kerning(1.0)
                        Text(totalLeaking > 0 ? totalLeaking.asCurrencyRounded : "Scan to find out")
                            .font(.system(size: 36, weight: .black, design: .rounded))
                            .foregroundStyle(totalLeaking > 0 ? Color.keeperGreen : Color.white.opacity(0.4))
                    }
                    Spacer()
                    if issueCount > 0 {
                        ZStack {
                            Circle()
                                .fill(Color.orange.opacity(0.15))
                                .frame(width: 50, height: 50)
                            VStack(spacing: 0) {
                                Text("\(issueCount)")
                                    .font(.title3).fontWeight(.bold)
                                    .foregroundStyle(.orange)
                                Text("open")
                                    .font(.system(size: 9)).fontWeight(.medium)
                                    .foregroundStyle(.orange.opacity(0.7))
                            }
                        }
                    }
                }

                Divider().background(Color.white.opacity(0.1))

                HStack(spacing: 24) {
                    StatPill(label: "SAVED", value: totalSaved.asCurrencyRounded, color: Color.keeperGreen)
                    StatPill(label: "SURPLUS/MO", value: "$\(Int(totalLeaking / 12))", color: .blue)
                }
            }
            .padding(20)
        }
        .frame(height: 175)
    }
}

private struct StatPill: View {
    let label: String
    let value: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label)
                .font(.system(size: 9, weight: .semibold))
                .foregroundStyle(Color.white.opacity(0.45))
                .kerning(0.8)
            Text(value)
                .font(.subheadline).fontWeight(.bold)
                .foregroundStyle(color)
        }
    }
}

// MARK: - Quick Actions

private struct QuickActionsRow: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        HStack(spacing: 12) {
            QuickActionButton(
                icon: "wand.and.stars",
                label: "Re-scan",
                color: Color.keeperGreen
            ) {
                Task { await appState.runAnalysis() }
            }
            .disabled(appState.isAnalyzing || appState.connectedAccounts.isEmpty)

            QuickActionButton(
                icon: "bubble.left.fill",
                label: "Ask AI",
                color: .blue
            ) {
                appState.selectedTab = 3
            }

            QuickActionButton(
                icon: "chart.bar.fill",
                label: "Invest",
                color: .purple
            ) {
                appState.selectedTab = 2
            }
        }
    }
}

private struct QuickActionButton: View {
    let icon: String
    let label: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(color.opacity(0.12))
                        .frame(width: 52, height: 52)
                    Image(systemName: icon)
                        .font(.title3)
                        .foregroundStyle(color)
                }
                Text(label)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(.primary)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Issues Preview

private struct IssuesPreviewSection: View {
    @EnvironmentObject var appState: AppState

    private var topIssues: [DetectedIssue] {
        Array(appState.detectedIssues
            .filter { $0.status == .new }
            .sorted { $0.annualCost > $1.annualCost }
            .prefix(3))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Open Issues")
                    .font(.headline)
                Spacer()
                Button("See All") { appState.selectedTab = 1 }
                    .font(.subheadline)
                    .foregroundStyle(Color.keeperGreen)
            }
            .padding(.horizontal, 20)

            ForEach(topIssues) { issue in
                DashboardIssueRow(issue: issue)
                    .padding(.horizontal, 20)
            }
        }
    }
}

private struct DashboardIssueRow: View {
    let issue: DetectedIssue

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(Color.orange.opacity(0.10))
                    .frame(width: 40, height: 40)
                Image(systemName: issue.issueType.iconName)
                    .font(.subheadline)
                    .foregroundStyle(.orange)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(issue.merchantName)
                    .font(.subheadline).fontWeight(.semibold)
                    .lineLimit(1)
                Text(issue.issueType.displayName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Text(issue.annualCost.asCurrencyRounded + "/yr")
                .font(.subheadline).fontWeight(.semibold)
                .foregroundStyle(.orange)
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color(.secondarySystemBackground))
        )
    }
}

// MARK: - Accounts Section

private struct AccountsSection: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        if !appState.connectedAccounts.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
                Text("Connected Accounts")
                    .font(.headline)
                    .padding(.horizontal, 20)

                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(appState.connectedAccounts) { account in
                            AccountChip(account: account)
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }
        }
    }
}

private struct AccountChip: View {
    let account: ConnectedAccount

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(account.institutionName)
                .font(.footnote).fontWeight(.semibold)
                .lineLimit(1)
            Text(account.currentBalance.asCurrencyRounded)
                .font(.subheadline).fontWeight(.bold)
                .foregroundStyle(Color.keeperGreen)
            Text(account.accountType.capitalized)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .padding(14)
        .frame(width: 140)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color(.secondarySystemBackground))
        )
    }
}

// MARK: - Invest Teaser

private struct InvestTeaserCard: View {
    let surplus: Double
    @EnvironmentObject var appState: AppState

    var body: some View {
        Button { appState.selectedTab = 2 } label: {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(Color.purple.opacity(0.12))
                        .frame(width: 50, height: 50)
                    Image(systemName: "chart.line.uptrend.xyaxis")
                        .font(.title3)
                        .foregroundStyle(.purple)
                }
                VStack(alignment: .leading, spacing: 3) {
                    Text("Ready to invest?")
                        .font(.subheadline).fontWeight(.semibold)
                    Text("You have \(surplus.asCurrency)/mo available")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding(16)
            .background(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(Color(.secondarySystemBackground))
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    DashboardView()
        .environmentObject(AppState())
}
