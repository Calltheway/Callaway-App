import SwiftUI

struct ConnectBankView: View {
    let onContinue: () -> Void
    @EnvironmentObject var appState: AppState

    @State private var step: ConnectStep = .intro
    @State private var selectedBank: MockBank? = nil
    @State private var isConnecting = false
    @State private var connectProgress: Double = 0

    enum ConnectStep { case intro, picker, connecting, done }

    let mockBanks: [MockBank] = [
        MockBank(name: "Chase",         logo: "building.columns.fill",   color: Color(hex: "#117ACA")),
        MockBank(name: "Bank of America", logo: "building.2.fill",        color: Color(hex: "#E31837")),
        MockBank(name: "Wells Fargo",   logo: "shield.fill",              color: Color(hex: "#D71E28")),
        MockBank(name: "Citi",          logo: "creditcard.fill",          color: Color(hex: "#003B70")),
        MockBank(name: "Capital One",   logo: "bolt.fill",                color: Color(hex: "#D03027")),
        MockBank(name: "US Bank",       logo: "flag.fill",                color: Color(hex: "#003087")),
        MockBank(name: "TD Bank",       logo: "leaf.fill",                color: Color(hex: "#00A950")),
        MockBank(name: "PNC Bank",      logo: "chart.pie.fill",           color: Color(hex: "#F58025")),
    ]

    var body: some View {
        Group {
            switch step {
            case .intro:    introView
            case .picker:   pickerView
            case .connecting: connectingView
            case .done:     doneView
            }
        }
        .animation(.easeInOut(duration: 0.3), value: step)
    }

    // MARK: - Intro

    private var introView: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 28) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Connect your")
                            .font(.largeTitle).fontWeight(.bold)
                        Text("bank account.")
                            .font(.largeTitle).fontWeight(.bold)
                            .foregroundStyle(Color.keeperGreen)
                    }
                    .padding(.top, 60)

                    Text("Keeper reads your transactions to find money leaks. We use read-only access — we can never move your money.")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .lineSpacing(4)

                    VStack(spacing: 12) {
                        BankFeatureRow(icon: "lock.shield.fill",        color: .blue,  text: "Bank-level 256-bit encryption")
                        BankFeatureRow(icon: "eye.fill",               color: Color.keeperGreen,  text: "Read-only — zero write access")
                        BankFeatureRow(icon: "arrow.triangle.2.circlepath", color: .orange, text: "Syncs automatically every 24 hours")
                        BankFeatureRow(icon: "trash.slash.fill",       color: .purple, text: "Delete your data anytime, instantly")
                    }

                    // Demo note
                    HStack(spacing: 10) {
                        Image(systemName: "info.circle.fill")
                            .foregroundStyle(.blue)
                        Text("This is a **demo build**. Selecting any bank creates sample transaction data for testing.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                    .padding(12)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(Color.blue.opacity(0.07))
                    )

                    Spacer().frame(height: 12)
                }
                .padding(.horizontal, 24)
            }

            VStack(spacing: 10) {
                Divider().opacity(0.3)
                Button("Connect My Bank") { step = .picker }
                    .buttonStyle(KeeperPrimaryButtonStyle())
                    .padding(.horizontal, 24)
                Button("Skip for Now") { onContinue() }
                    .buttonStyle(KeeperGhostButtonStyle())
                    .padding(.bottom, 2)
            }
            .padding(.top, 16)
            .padding(.bottom, 48)
            .background(Color(.systemBackground))
        }
    }

    // MARK: - Picker

    private var pickerView: some View {
        VStack(spacing: 0) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Choose your bank")
                    .font(.title2).fontWeight(.bold)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 24)
            .padding(.top, 60)
            .padding(.bottom, 24)

            ScrollView(showsIndicators: false) {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 14) {
                    ForEach(mockBanks) { bank in
                        BankTile(bank: bank, isSelected: selectedBank?.id == bank.id) {
                            HapticManager.shared.impact(.light)
                            selectedBank = bank
                        }
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 24)
            }

            VStack(spacing: 10) {
                Divider().opacity(0.3)
                Button("Connect \(selectedBank?.name ?? "Bank")") { startConnecting() }
                    .buttonStyle(KeeperPrimaryButtonStyle())
                    .disabled(selectedBank == nil)
                    .opacity(selectedBank == nil ? 0.4 : 1.0)
                    .padding(.horizontal, 24)
                Button("Back") { step = .intro }
                    .buttonStyle(KeeperGhostButtonStyle())
            }
            .padding(.top, 16)
            .padding(.bottom, 48)
            .background(Color(.systemBackground))
        }
    }

    // MARK: - Connecting

    private var connectingView: some View {
        VStack(spacing: 32) {
            Spacer()

            ZStack {
                Circle()
                    .stroke(Color.keeperGreen.opacity(0.15), lineWidth: 3)
                    .frame(width: 100, height: 100)
                Circle()
                    .trim(from: 0, to: connectProgress)
                    .stroke(Color.keeperGreen, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                    .frame(width: 100, height: 100)
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 0.4), value: connectProgress)

                Image(systemName: selectedBank?.logo ?? "building.columns.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(selectedBank?.color ?? Color.keeperGreen)
            }

            VStack(spacing: 8) {
                Text("Connecting to \(selectedBank?.name ?? "your bank")…")
                    .font(.title3).fontWeight(.semibold)
                Text("Securely establishing read-only access")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()
        }
    }

    // MARK: - Done

    private var doneView: some View {
        VStack(spacing: 32) {
            Spacer()

            ZStack {
                Circle()
                    .fill(Color.keeperGreen.opacity(0.12))
                    .frame(width: 100, height: 100)
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 52))
                    .foregroundStyle(Color.keeperGreen)
            }

            VStack(spacing: 8) {
                Text("\(selectedBank?.name ?? "Bank") connected!")
                    .font(.title2).fontWeight(.bold)
                Text("We imported sample transactions for demo purposes.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Spacer()

            Button("Continue") { onContinue() }
                .buttonStyle(KeeperPrimaryButtonStyle())
                .padding(.horizontal, 24)
                .padding(.bottom, 48)
        }
    }

    // MARK: - Actions

    private func startConnecting() {
        step = .connecting
        connectProgress = 0
        isConnecting = true

        let progresses: [(Double, Double)] = [(0.3, 0.6), (0.65, 0.5), (0.9, 0.5), (1.0, 0.3)]
        var delay: Double = 0
        for (p, d) in progresses {
            delay += d
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
                connectProgress = p
            }
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + delay + 0.5) {
            seedSampleAccount()
            HapticManager.shared.success()
            step = .done
        }
    }

    private func seedSampleAccount() {
        guard let userId = appState.currentUser?.id else { return }
        let account = ConnectedAccount(
            id: UUID(),
            userId: userId,
            institutionName: selectedBank?.name ?? "Demo Bank",
            institutionLogoURL: nil,
            lastSynced: Date(),
            accountType: "checking",
            currentBalance: Double.random(in: 2500...18000),
            plaidItemId: "demo_\(UUID().uuidString.prefix(8))"
        )
        Task {
            await appState.supabaseService.saveAccount(account)
            appState.connectedAccounts.append(account)
        }
    }
}

// MARK: - Supporting Types & Views

struct MockBank: Identifiable {
    let id = UUID()
    let name: String
    let logo: String
    let color: Color
}

private struct BankFeatureRow: View {
    let icon: String
    let color: Color
    let text: String

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.subheadline)
                .foregroundStyle(color)
                .frame(width: 22)
            Text(text)
                .font(.subheadline)
                .foregroundStyle(.primary)
            Spacer()
        }
    }
}

private struct BankTile: View {
    let bank: MockBank
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10, style: .continuous)
                        .fill(bank.color.opacity(0.12))
                        .frame(width: 48, height: 48)
                    Image(systemName: bank.logo)
                        .font(.title3)
                        .foregroundStyle(bank.color)
                }
                Text(bank.name)
                    .font(.footnote).fontWeight(.medium)
                    .foregroundStyle(.primary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(Color(.secondarySystemBackground))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(isSelected ? Color.keeperGreen : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    ConnectBankView(onContinue: {})
        .environmentObject(AppState())
}
