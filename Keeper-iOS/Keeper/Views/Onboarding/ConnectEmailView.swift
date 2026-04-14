import SwiftUI

struct ConnectEmailView: View {
    let onContinue: () -> Void

    @State private var appeared = false

    let providers: [EmailProvider] = [
        EmailProvider(name: "Gmail",        icon: "envelope.fill",           color: Color(hex: "#EA4335"), note: "Most subscription receipts"),
        EmailProvider(name: "Outlook",      icon: "envelope.badge.fill",      color: Color(hex: "#0078D4"), note: "Microsoft / Hotmail accounts"),
        EmailProvider(name: "Apple Mail",   icon: "apple.logo",               color: Color(.label),         note: "iCloud email"),
        EmailProvider(name: "Yahoo Mail",   icon: "envelope.open.fill",        color: Color(hex: "#720E9E"), note: "Yahoo accounts"),
    ]

    var body: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 28) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Connect your")
                            .font(.largeTitle).fontWeight(.bold)
                        Text("email. (Optional)")
                            .font(.largeTitle).fontWeight(.bold)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 60)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 16)

                    Text("Keeper scans your inbox for subscription confirmation emails to find services you've forgotten about — and ones still billing you after you cancelled.")
                        .font(.body)
                        .foregroundStyle(.secondary)
                        .lineSpacing(4)
                        .opacity(appeared ? 1 : 0)

                    VStack(spacing: 12) {
                        ForEach(providers) { provider in
                            ProviderRow(provider: provider)
                        }
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 8)

                    // Privacy note
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: "lock.fill")
                            .font(.caption)
                            .foregroundStyle(Color.keeperGreen)
                            .padding(.top, 1)
                        VStack(alignment: .leading, spacing: 3) {
                            Text("Read-only. Always.")
                                .font(.footnote).fontWeight(.semibold)
                            Text("We only read subject lines and sender addresses. We never read email body content. Access can be revoked anytime.")
                                .font(.footnote)
                                .foregroundStyle(.secondary)
                                .lineSpacing(3)
                        }
                    }
                    .padding(14)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color.keeperGreen.opacity(0.07))
                    )
                    .opacity(appeared ? 1 : 0)

                    Spacer().frame(height: 12)
                }
                .padding(.horizontal, 24)
            }

            VStack(spacing: 10) {
                Divider().opacity(0.3)

                // In a real app these buttons would trigger OAuth. For now they all advance.
                Button("Connect Gmail") {
                    HapticManager.shared.impact(.medium)
                    onContinue()
                }
                .buttonStyle(KeeperPrimaryButtonStyle())
                .padding(.horizontal, 24)

                Button("Skip — Use Bank Data Only") {
                    HapticManager.shared.impact(.light)
                    onContinue()
                }
                .buttonStyle(KeeperGhostButtonStyle())
            }
            .padding(.top, 16)
            .padding(.bottom, 48)
            .background(Color(.systemBackground))
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.5).delay(0.1)) { appeared = true }
        }
    }
}

// MARK: - Supporting Types

struct EmailProvider: Identifiable {
    let id = UUID()
    let name: String
    let icon: String
    let color: Color
    let note: String
}

private struct ProviderRow: View {
    let provider: EmailProvider

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(provider.color.opacity(0.10))
                    .frame(width: 42, height: 42)
                Image(systemName: provider.icon)
                    .font(.body)
                    .foregroundStyle(provider.color)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(provider.name)
                    .font(.subheadline).fontWeight(.semibold)
                Text(provider.note)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color(.secondarySystemBackground))
        )
    }
}

#Preview {
    ConnectEmailView(onContinue: {})
}
