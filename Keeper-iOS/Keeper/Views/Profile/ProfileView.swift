import SwiftUI

struct ProfileView: View {
    @EnvironmentObject var appState: AppState
    @State private var showingSignOutAlert = false
    @State private var showingDeleteAlert = false
    @State private var biometricEnabled = true

    var body: some View {
        NavigationStack {
            List {
                // User header
                Section {
                    HStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(Color.keeperGreen.opacity(0.15))
                                .frame(width: 56, height: 56)
                            Text(userInitial)
                                .font(.title2).fontWeight(.bold)
                                .foregroundStyle(Color.keeperGreen)
                        }
                        VStack(alignment: .leading, spacing: 3) {
                            Text(appState.currentUser?.email ?? "User")
                                .font(.headline)
                                .lineLimit(1)
                            Text(tierLabel)
                                .font(.caption)
                                .foregroundStyle(Color.keeperGreen)
                        }
                    }
                    .padding(.vertical, 4)
                }

                // Stats
                Section("Your Impact") {
                    StatsRow(label: "Total Saved", value: appState.totalSavingsFound.asCurrencyRounded, icon: "dollarsign.circle.fill", color: Color.keeperGreen)
                    StatsRow(label: "Issues Found", value: "\(appState.detectedIssues.count)", icon: "exclamationmark.shield.fill", color: .orange)
                    StatsRow(label: "Issues Resolved", value: "\(resolvedCount)", icon: "checkmark.seal.fill", color: .blue)
                    StatsRow(label: "Connected Accounts", value: "\(appState.connectedAccounts.count)", icon: "building.columns.fill", color: .purple)
                }

                // Security
                Section("Security") {
                    HStack {
                        Label(BiometricAuthService.shared.biometricTypeName, systemImage: BiometricAuthService.shared.biometricTypeName == "Face ID" ? "faceid" : "touchid")
                        Spacer()
                        Toggle("", isOn: $biometricEnabled)
                            .tint(Color.keeperGreen)
                            .labelsHidden()
                    }
                }

                // Connected accounts
                if !appState.connectedAccounts.isEmpty {
                    Section("Connected Accounts") {
                        ForEach(appState.connectedAccounts) { account in
                            HStack {
                                Label(account.institutionName, systemImage: "building.columns")
                                Spacer()
                                Text(account.accountType.capitalized)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }

                // Legal
                Section("Legal") {
                    NavigationLink {
                        DisclaimerFullView()
                    } label: {
                        Label("Investment Disclaimer", systemImage: "doc.text")
                    }
                    Link(destination: URL(string: "https://keeperapp.io/privacy")!) {
                        Label("Privacy Policy", systemImage: "hand.raised")
                    }
                    Link(destination: URL(string: "https://keeperapp.io/terms")!) {
                        Label("Terms of Service", systemImage: "doc.plaintext")
                    }
                }

                // Account
                Section {
                    Button(role: .destructive) {
                        showingSignOutAlert = true
                    } label: {
                        Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                    }
                }

                // App info
                Section {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text(appVersion)
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Text("Build")
                        Spacer()
                        Text("Powered by Claude AI")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.large)
            .alert("Sign Out", isPresented: $showingSignOutAlert) {
                Button("Sign Out", role: .destructive) {
                    Task { await appState.signOut() }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("You'll need to sign in again to access your data.")
            }
        }
    }

    private var userInitial: String {
        appState.currentUser?.email.prefix(1).uppercased() ?? "K"
    }

    private var tierLabel: String {
        switch appState.currentUser?.subscriptionTier {
        case .pro:        return "Keeper Pro"
        case .keeperPlus: return "Keeper+"
        default:          return "Free Plan"
        }
    }

    private var resolvedCount: Int {
        appState.detectedIssues.filter { $0.status == .resolved }.count
    }

    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }
}

// MARK: - Stats Row

private struct StatsRow: View {
    let label: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        HStack {
            Label(label, systemImage: icon)
                .foregroundStyle(color)
            Spacer()
            Text(value)
                .font(.subheadline).fontWeight(.semibold)
                .foregroundStyle(.primary)
        }
    }
}

// MARK: - Full Disclaimer View

private struct DisclaimerFullView: View {
    var body: some View {
        ScrollView {
            Text(Constants.InvestmentDisclaimer.text)
                .font(.body)
                .lineSpacing(5)
                .padding(24)
        }
        .navigationTitle("Investment Disclaimer")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    ProfileView()
        .environmentObject(AppState())
}
