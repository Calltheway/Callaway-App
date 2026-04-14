import SwiftUI

struct InvestView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedScenario: InvestmentScenario? = nil
    @State private var customMonthly: Double = 0
    @State private var useCustom = false
    @State private var appeared = false

    private var monthlyAmount: Double {
        useCustom ? customMonthly : max(appState.investableSurplus, Constants.Investment.defaultMonthlyAmount)
    }

    private var scenarios: [InvestmentScenario] {
        InvestmentScenario.scenarios(monthlyAmount: monthlyAmount, etfs: appState.etfPrices)
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    // Monthly amount picker
                    AmountPickerCard(
                        recommendedAmount: appState.investableSurplus,
                        customAmount: $customMonthly,
                        useCustom: $useCustom
                    )
                    .padding(.horizontal, 20)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 12)

                    // Scenario cards
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Investment Scenarios")
                            .font(.headline)
                            .padding(.horizontal, 20)

                        ForEach(scenarios) { scenario in
                            ScenarioCard(scenario: scenario) {
                                HapticManager.shared.impact(.medium)
                                selectedScenario = scenario
                            }
                            .padding(.horizontal, 20)
                        }
                    }
                    .opacity(appeared ? 1 : 0)

                    // ETF prices
                    ETFPricesSection()
                        .opacity(appeared ? 1 : 0)

                    // Disclaimer
                    Text(Constants.InvestmentDisclaimer.text)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineSpacing(3)
                        .padding(.horizontal, 20)
                        .padding(.bottom, 24)
                        .opacity(appeared ? 1 : 0)
                }
                .padding(.top, 8)
            }
            .navigationTitle("Invest")
            .navigationBarTitleDisplayMode(.large)
            .sheet(item: $selectedScenario) { scenario in
                ScenarioDetailView(scenario: scenario)
            }
        }
        .onAppear {
            customMonthly = max(appState.investableSurplus, Constants.Investment.defaultMonthlyAmount)
            withAnimation(.easeOut(duration: 0.45).delay(0.1)) { appeared = true }
        }
    }
}

// MARK: - Amount Picker Card

private struct AmountPickerCard: View {
    let recommendedAmount: Double
    @Binding var customAmount: Double
    @Binding var useCustom: Bool

    @State private var sliderValue: Double = 200

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Monthly Investment Amount")
                .font(.headline)

            // Toggle
            HStack {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Amount")
                        .font(.caption).foregroundStyle(.secondary)
                    Text(useCustom ? customAmount.asCurrencyRounded : recommendedAmount.asCurrencyRounded + "/mo")
                        .font(.title2).fontWeight(.bold)
                        .foregroundStyle(Color.keeperGreen)
                }
                Spacer()
                Toggle("Custom", isOn: $useCustom)
                    .labelsHidden()
                    .tint(Color.keeperGreen)
            }

            if useCustom {
                VStack(alignment: .leading, spacing: 6) {
                    Slider(
                        value: $sliderValue,
                        in: 50...2000,
                        step: 25,
                        onEditingChanged: { _ in
                            customAmount = sliderValue
                            HapticManager.shared.impact(.light)
                        }
                    )
                    .tint(Color.keeperGreen)
                    .onChange(of: sliderValue) { customAmount = $0 }

                    HStack {
                        Text("$50")
                        Spacer()
                        Text("$2,000")
                    }
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                }
                .transition(.move(edge: .top).combined(with: .opacity))
                .animation(.easeInOut(duration: 0.25), value: useCustom)
            } else if recommendedAmount > 0 {
                HStack(spacing: 6) {
                    Image(systemName: "lightbulb.fill")
                        .font(.caption)
                        .foregroundStyle(Color.keeperGreen)
                    Text("Based on your investable surplus from Keeper's analysis")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(18)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(Color(.secondarySystemBackground))
        )
        .onAppear { sliderValue = max(recommendedAmount, Constants.Investment.defaultMonthlyAmount) }
    }
}

// MARK: - Scenario Card

private struct ScenarioCard: View {
    let scenario: InvestmentScenario
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 14) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(scenario.name)
                            .font(.headline)
                        Text(scenario.description)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("\(Int(scenario.averageReturnRate * 100))%")
                            .font(.title3).fontWeight(.bold)
                            .foregroundStyle(Color.keeperGreen)
                        Text("avg return")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }

                // ETF chips
                HStack(spacing: 8) {
                    ForEach(scenario.etfs) { etf in
                        Text(etf.ticker)
                            .font(.caption).fontWeight(.semibold)
                            .foregroundStyle(Color.keeperGreen)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(
                                Capsule().fill(Color.keeperGreen.opacity(0.10))
                            )
                    }
                }

                // 10/20/30 year projections
                HStack(spacing: 0) {
                    ForEach([10, 20, 30], id: \.self) { years in
                        VStack(spacing: 3) {
                            Text(scenario.projectedValue(years: years).asCompactCurrency)
                                .font(.subheadline).fontWeight(.bold)
                            Text("\(years)yr")
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity)
                        if years != 30 {
                            Divider().frame(height: 28)
                        }
                    }
                }
                .padding(.top, 4)

                HStack {
                    Spacer()
                    Text("See full projection")
                        .font(.caption)
                        .foregroundStyle(Color.keeperGreen)
                    Image(systemName: "chevron.right")
                        .font(.caption2)
                        .foregroundStyle(Color.keeperGreen)
                }
            }
            .padding(18)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(Color(.secondarySystemBackground))
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - ETF Prices Section

private struct ETFPricesSection: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Live ETF Prices")
                    .font(.headline)
                Spacer()
                Text("Via Alpha Vantage")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .padding(.horizontal, 20)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(appState.etfPrices) { etf in
                        ETFChip(etf: etf)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

private struct ETFChip: View {
    let etf: ETFPrice

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(etf.ticker)
                    .font(.subheadline).fontWeight(.bold)
                Spacer()
                Text("\(Int(etf.tenYearReturnRate * 100))%")
                    .font(.caption).fontWeight(.semibold)
                    .foregroundStyle(Color.keeperGreen)
            }
            Text(etf.name)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(1)
            Text(String(format: "$%.2f", etf.currentPrice))
                .font(.footnote).fontWeight(.semibold)
        }
        .padding(12)
        .frame(width: 160)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color(.secondarySystemBackground))
        )
    }
}

// MARK: - Scenario Detail View

struct ScenarioDetailView: View {
    let scenario: InvestmentScenario
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 24) {
                    // Header
                    VStack(alignment: .leading, spacing: 6) {
                        Text(scenario.name)
                            .font(.largeTitle).fontWeight(.bold)
                        Text(scenario.description)
                            .font(.body)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 8)

                    // Projection table
                    VStack(spacing: 1) {
                        ProjectionRow(label: "Monthly investment", value: scenario.monthlyAmount.asCurrency, highlight: false)
                        ProjectionRow(label: "Avg. annual return",  value: "\(String(format: "%.1f", scenario.averageReturnRate * 100))%", highlight: false)
                        ProjectionRow(label: "5-year value",   value: scenario.projectedValue(years: 5).asCompactCurrency,  highlight: false)
                        ProjectionRow(label: "10-year value",  value: scenario.projectedValue(years: 10).asCompactCurrency, highlight: false)
                        ProjectionRow(label: "20-year value",  value: scenario.projectedValue(years: 20).asCompactCurrency, highlight: true)
                        ProjectionRow(label: "30-year value",  value: scenario.projectedValue(years: 30).asCompactCurrency, highlight: true)
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .padding(.horizontal, 20)

                    // ETFs
                    VStack(alignment: .leading, spacing: 12) {
                        Text("ETFs in this scenario")
                            .font(.headline)
                            .padding(.horizontal, 20)

                        ForEach(scenario.etfs) { etf in
                            ETFDetailRow(etf: etf)
                                .padding(.horizontal, 20)
                        }
                    }

                    // Disclaimer
                    Text(Constants.InvestmentDisclaimer.text)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineSpacing(3)
                        .padding(.horizontal, 20)
                        .padding(.bottom, 32)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(Color.keeperGreen)
                }
            }
        }
    }
}

private struct ProjectionRow: View {
    let label: String
    let value: String
    let highlight: Bool

    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(highlight ? .primary : .secondary)
            Spacer()
            Text(value)
                .font(.subheadline).fontWeight(highlight ? .bold : .regular)
                .foregroundStyle(highlight ? Color.keeperGreen : .primary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color(.secondarySystemBackground))
    }
}

private struct ETFDetailRow: View {
    let etf: ETFPrice

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(Color.keeperGreen.opacity(0.10))
                    .frame(width: 40, height: 40)
                Text(etf.ticker)
                    .font(.caption).fontWeight(.bold)
                    .foregroundStyle(Color.keeperGreen)
            }
            VStack(alignment: .leading, spacing: 3) {
                Text(etf.name)
                    .font(.subheadline).fontWeight(.medium)
                    .lineLimit(1)
                Text(etf.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text(String(format: "$%.2f", etf.currentPrice))
                    .font(.subheadline).fontWeight(.semibold)
                Text("\(Int(etf.tenYearReturnRate * 100))% 10yr")
                    .font(.caption2)
                    .foregroundStyle(Color.keeperGreen)
            }
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color(.secondarySystemBackground))
        )
    }
}

#Preview {
    InvestView()
        .environmentObject(AppState())
}
