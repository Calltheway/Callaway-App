import SwiftUI

struct IssueDetailView: View {
    let issue: DetectedIssue
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    @State private var showingResolveSheet = false
    @State private var resolveAmount: String = ""
    @State private var generatingScript = false
    @State private var negotiationScript: String? = nil
    @State private var showScript = false

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 24) {
                    // Header card
                    headerCard

                    // AI Explanation
                    SectionCard(title: "What Keeper Found") {
                        Text(issue.claudeExplanation)
                            .font(.body)
                            .foregroundStyle(.primary)
                            .lineSpacing(5)
                    }

                    // Cost breakdown
                    SectionCard(title: "Cost Breakdown") {
                        HStack {
                            CostRow(label: "Monthly", value: issue.monthlyCost.asCurrency)
                            Spacer()
                            CostRow(label: "Annual", value: issue.annualCost.asCurrencyRounded)
                        }
                    }

                    // Negotiation script
                    if issue.actionType == .negotiate {
                        negotiationSection
                    }

                    // Actions
                    if issue.status == .new || issue.status == .inProgress {
                        actionButtons
                    } else if issue.status == .resolved {
                        resolvedBanner
                    }

                    Spacer().frame(height: 32)
                }
                .padding(.horizontal, 20)
                .padding(.top, 8)
            }
            .navigationTitle(issue.merchantName)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Color.keeperGreen)
                }
            }
        }
        .sheet(isPresented: $showingResolveSheet) {
            resolveSheet
        }
    }

    // MARK: - Header Card

    private var headerCard: some View {
        HStack(spacing: 16) {
            ZStack {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color.orange.opacity(0.12))
                    .frame(width: 60, height: 60)
                Image(systemName: issue.issueType.iconName)
                    .font(.title2)
                    .foregroundStyle(.orange)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(issue.issueType.displayName)
                    .font(.headline)
                HStack(spacing: 6) {
                    Circle()
                        .fill(confidenceColor)
                        .frame(width: 8, height: 8)
                    Text("\(Int(issue.confidenceScore * 100))% confidence")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text(issue.annualCost.asCurrencyRounded)
                    .font(.title3).fontWeight(.bold)
                    .foregroundStyle(.orange)
                Text("per year")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(Color(.secondarySystemBackground))
        )
    }

    private var confidenceColor: Color {
        switch issue.confidenceScore {
        case 0.85...: return Color.keeperGreen
        case 0.70...: return .orange
        default:      return .red
        }
    }

    // MARK: - Negotiation Section

    private var negotiationSection: some View {
        SectionCard(title: "Negotiation Script") {
            if let script = negotiationScript ?? issue.negotiationScript {
                VStack(alignment: .leading, spacing: 12) {
                    Text(script)
                        .font(.subheadline)
                        .foregroundStyle(.primary)
                        .lineSpacing(4)

                    Button {
                        UIPasteboard.general.string = script
                        HapticManager.shared.success()
                    } label: {
                        Label("Copy Script", systemImage: "doc.on.doc")
                            .font(.subheadline).fontWeight(.medium)
                    }
                    .foregroundStyle(Color.keeperGreen)
                }
            } else {
                Button {
                    generateScript()
                } label: {
                    HStack(spacing: 8) {
                        if generatingScript {
                            ProgressView().scaleEffect(0.8)
                        } else {
                            Image(systemName: "wand.and.stars")
                        }
                        Text(generatingScript ? "Generating script…" : "Generate Negotiation Script")
                    }
                }
                .buttonStyle(KeeperSecondaryButtonStyle())
                .disabled(generatingScript)
            }
        }
    }

    private func generateScript() {
        generatingScript = true
        Task {
            let script = await appState.claudeService.generateNegotiationScript(
                merchantName: issue.merchantName,
                monthlyCost:  issue.monthlyCost,
                issueType:    issue.issueType.rawValue
            )
            generatingScript = false
            withAnimation { negotiationScript = script }
        }
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        VStack(spacing: 12) {
            Button {
                resolveAmount = String(format: "%.2f", issue.monthlyCost)
                showingResolveSheet = true
            } label: {
                Label("Mark as Resolved", systemImage: "checkmark.circle.fill")
            }
            .buttonStyle(KeeperPrimaryButtonStyle())

            Button {
                Task {
                    await appState.dismissIssue(issue)
                    dismiss()
                }
            } label: {
                Text("Dismiss")
            }
            .buttonStyle(KeeperGhostButtonStyle())
        }
    }

    // MARK: - Resolved Banner

    private var resolvedBanner: some View {
        HStack(spacing: 14) {
            Image(systemName: "checkmark.seal.fill")
                .font(.title2)
                .foregroundStyle(Color.keeperGreen)
            VStack(alignment: .leading, spacing: 3) {
                Text("Resolved!")
                    .font(.subheadline).fontWeight(.bold)
                if let saved = issue.amountSaved {
                    Text("You saved \(saved.asCurrency)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 14)
                .fill(Color.keeperGreen.opacity(0.10))
        )
    }

    // MARK: - Resolve Sheet

    private var resolveSheet: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Text("How much did you save?")
                    .font(.title3).fontWeight(.bold)

                Text("Enter the monthly amount you'll no longer be paying.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)

                HStack {
                    Text("$")
                        .font(.title2).fontWeight(.semibold)
                    TextField("0.00", text: $resolveAmount)
                        .keyboardType(.decimalPad)
                        .font(.title2).fontWeight(.semibold)
                }
                .padding(16)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(.secondarySystemBackground))
                )
                .padding(.horizontal, 24)

                Button("Save & Resolve") {
                    let amount = Double(resolveAmount) ?? issue.monthlyCost
                    showingResolveSheet = false
                    Task {
                        await appState.markIssueResolved(issue, amountSaved: amount)
                        dismiss()
                    }
                }
                .buttonStyle(KeeperPrimaryButtonStyle())
                .padding(.horizontal, 24)

                Spacer()
            }
            .padding(.top, 32)
            .navigationTitle("Resolve Issue")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { showingResolveSheet = false }
                        .foregroundStyle(.secondary)
                }
            }
        }
        .presentationDetents([.medium])
    }
}

// MARK: - Section Card

private struct SectionCard<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
            content()
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color(.secondarySystemBackground))
        )
    }
}

private struct CostRow: View {
    let label: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.title3).fontWeight(.bold)
        }
    }
}

#Preview {
    IssueDetailView(issue: DetectedIssue(
        id: UUID(),
        userId: UUID(),
        issueType: .forgottenSubscription,
        merchantName: "Adobe Creative Cloud",
        monthlyCost: 54.99,
        annualCost: 659.88,
        status: .new,
        confidenceScore: 0.92,
        detectedAt: Date(),
        resolvedAt: nil,
        amountSaved: nil,
        actionType: .cancel,
        claudeExplanation: "You're paying $54.99/month for Adobe Creative Cloud but haven't used it in over 4 months. Cancelling would save you $659.88 annually.",
        negotiationScript: nil
    ))
    .environmentObject(AppState())
}
