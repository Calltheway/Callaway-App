import SwiftUI

struct FindingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedFilter: FilterTab = .all
    @State private var selectedIssue: DetectedIssue? = nil

    enum FilterTab: String, CaseIterable {
        case all = "All"
        case new = "New"
        case resolved = "Resolved"
    }

    private var filtered: [DetectedIssue] {
        let sorted = appState.detectedIssues.sorted { $0.annualCost > $1.annualCost }
        switch selectedFilter {
        case .all:      return sorted.filter { $0.status != .dismissed }
        case .new:      return sorted.filter { $0.status == .new || $0.status == .inProgress }
        case .resolved: return sorted.filter { $0.status == .resolved }
        }
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Filter tabs
                HStack(spacing: 0) {
                    ForEach(FilterTab.allCases, id: \.self) { tab in
                        Button {
                            HapticManager.shared.impact(.light)
                            withAnimation(.easeInOut(duration: 0.2)) { selectedFilter = tab }
                        } label: {
                            Text(tab.rawValue)
                                .font(.subheadline)
                                .fontWeight(selectedFilter == tab ? .semibold : .regular)
                                .foregroundStyle(selectedFilter == tab ? Color.keeperGreen : .secondary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 10)
                                .background(
                                    VStack {
                                        Spacer()
                                        if selectedFilter == tab {
                                            Color.keeperGreen.frame(height: 2)
                                        }
                                    }
                                )
                        }
                        .buttonStyle(.plain)
                    }
                }
                .background(Color(.systemBackground))
                .overlay(alignment: .bottom) {
                    Divider()
                }

                if filtered.isEmpty {
                    emptyState
                } else {
                    ScrollView(showsIndicators: false) {
                        // Summary banner
                        if selectedFilter != .resolved {
                            SavingsBanner()
                                .padding(.horizontal, 16)
                                .padding(.top, 16)
                        }

                        LazyVStack(spacing: 12) {
                            ForEach(filtered) { issue in
                                IssueCard(issue: issue)
                                    .onTapGesture {
                                        HapticManager.shared.impact(.light)
                                        selectedIssue = issue
                                    }
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 12)
                        .padding(.bottom, 24)
                    }
                }
            }
            .navigationTitle("Findings")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        HapticManager.shared.impact(.medium)
                        Task { await appState.runAnalysis() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                            .foregroundStyle(Color.keeperGreen)
                    }
                    .disabled(appState.isAnalyzing)
                }
            }
            .sheet(item: $selectedIssue) { issue in
                IssueDetailView(issue: issue)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 20) {
            Spacer()
            Image(systemName: selectedFilter == .resolved ? "checkmark.seal.fill" : "magnifyingglass")
                .font(.system(size: 52))
                .foregroundStyle(Color.keeperGreen.opacity(0.6))

            VStack(spacing: 8) {
                Text(selectedFilter == .resolved ? "Nothing resolved yet" : "No issues found")
                    .font(.title3).fontWeight(.semibold)
                Text(selectedFilter == .resolved
                     ? "When you fix an issue, it'll show up here."
                     : "Your finances look clean, or run a scan to check.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }

            if selectedFilter == .all && appState.connectedAccounts.isEmpty {
                Button("Connect a Bank Account") {
                    // Could navigate to settings — for now no-op
                }
                .buttonStyle(KeeperSecondaryButtonStyle())
                .padding(.horizontal, 48)
            }
            Spacer()
        }
    }
}

// MARK: - Savings Banner

private struct SavingsBanner: View {
    @EnvironmentObject var appState: AppState

    private var totalAnnual: Double {
        appState.detectedIssues
            .filter { $0.status == .new || $0.status == .inProgress }
            .reduce(0) { $0 + $1.annualCost }
    }

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.title3)
                .foregroundStyle(.orange)
            VStack(alignment: .leading, spacing: 2) {
                Text("Potential annual savings")
                    .font(.caption).fontWeight(.semibold)
                    .foregroundStyle(.secondary)
                Text(totalAnnual.asCurrencyRounded)
                    .font(.title3).fontWeight(.bold)
                    .foregroundStyle(.orange)
            }
            Spacer()
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(Color.orange.opacity(0.08))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(Color.orange.opacity(0.2), lineWidth: 1)
                )
        )
    }
}

// MARK: - Issue Card

struct IssueCard: View {
    let issue: DetectedIssue

    var statusColor: Color {
        switch issue.status {
        case .new:        return .orange
        case .inProgress: return .blue
        case .resolved:   return Color.keeperGreen
        case .dismissed:  return .secondary
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(statusColor.opacity(0.12))
                        .frame(width: 44, height: 44)
                    Image(systemName: issue.issueType.iconName)
                        .font(.body)
                        .foregroundStyle(statusColor)
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text(issue.merchantName)
                        .font(.subheadline).fontWeight(.semibold)
                    Text(issue.issueType.displayName)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text(issue.annualCost.asCurrencyRounded)
                        .font(.subheadline).fontWeight(.bold)
                        .foregroundStyle(statusColor)
                    Text("per year")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            Text(issue.claudeExplanation)
                .font(.caption)
                .foregroundStyle(.secondary)
                .lineSpacing(3)
                .lineLimit(2)

            HStack(spacing: 8) {
                StatusBadge(issue: issue)
                Spacer()
                ActionBadge(issue: issue)
                Image(systemName: "chevron.right")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color(.secondarySystemBackground))
        )
    }
}

private struct StatusBadge: View {
    let issue: DetectedIssue

    var body: some View {
        let (label, color): (String, Color) = {
            switch issue.status {
            case .new:        return ("New", .orange)
            case .inProgress: return ("In Progress", .blue)
            case .resolved:   return ("Resolved", Color.keeperGreen)
            case .dismissed:  return ("Dismissed", .secondary)
            }
        }()
        return Text(label)
            .font(.caption2).fontWeight(.semibold)
            .foregroundStyle(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(
                Capsule().fill(color.opacity(0.12))
            )
    }
}

private struct ActionBadge: View {
    let issue: DetectedIssue

    var body: some View {
        let difficulty = issue.actionType.difficulty
        return Text(issue.actionType.displayName)
            .font(.caption2).fontWeight(.semibold)
            .foregroundStyle(Color(difficulty.color))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(
                Capsule().fill(Color(difficulty.color).opacity(0.10))
            )
    }
}

#Preview {
    FindingsView()
        .environmentObject(AppState())
}
