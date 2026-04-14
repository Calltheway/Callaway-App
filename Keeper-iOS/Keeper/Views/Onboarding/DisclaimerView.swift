import SwiftUI

struct DisclaimerView: View {
    let onContinue: () -> Void
    @State private var agreed = false
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 28) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Before we start,")
                            .font(.largeTitle).fontWeight(.bold)
                        Text("a quick note.")
                            .font(.largeTitle).fontWeight(.bold)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 60)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 16)

                    VStack(spacing: 16) {
                        DisclaimerCard(
                            icon: "graduationcap.fill",
                            color: .blue,
                            title: "Educational Only",
                            body: "Keeper provides financial insights for educational purposes. Nothing we show you is personalized investment advice."
                        )
                        DisclaimerCard(
                            icon: "lock.shield.fill",
                            color: Color.keeperGreen,
                            title: "Read-Only Access",
                            body: "We only read your data. Keeper cannot move, transfer, or initiate any transactions on your behalf."
                        )
                        DisclaimerCard(
                            icon: "chart.line.downtrend.xyaxis",
                            color: .orange,
                            title: "Investing Has Risk",
                            body: "Past performance doesn't guarantee future results. You can lose money investing. Always consult a licensed advisor for personalized guidance."
                        )
                        DisclaimerCard(
                            icon: "person.badge.shield.checkmark",
                            color: .purple,
                            title: "Your Data Stays Yours",
                            body: "We never sell your financial data to third parties. Your information is encrypted and used only to power your Keeper insights."
                        )
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 12)

                    Text(Constants.InvestmentDisclaimer.text)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineSpacing(3)
                        .opacity(appeared ? 1 : 0)

                    Spacer().frame(height: 12)
                }
                .padding(.horizontal, 24)
            }

            VStack(spacing: 0) {
                Divider().opacity(0.3)

                VStack(spacing: 14) {
                    HStack(spacing: 12) {
                        Button {
                            HapticManager.shared.impact(.light)
                            withAnimation(.spring(response: 0.25)) { agreed.toggle() }
                        } label: {
                            ZStack {
                                RoundedRectangle(cornerRadius: 6, style: .continuous)
                                    .fill(agreed ? Color.keeperGreen : Color.clear)
                                    .frame(width: 22, height: 22)
                                RoundedRectangle(cornerRadius: 6, style: .continuous)
                                    .stroke(agreed ? Color.keeperGreen : Color.secondary.opacity(0.4), lineWidth: 1.5)
                                    .frame(width: 22, height: 22)
                                if agreed {
                                    Image(systemName: "checkmark")
                                        .font(.system(size: 12, weight: .bold))
                                        .foregroundStyle(.white)
                                }
                            }
                        }
                        Text("I understand this is educational, not financial advice.")
                            .font(.subheadline)
                            .foregroundStyle(.primary)
                        Spacer()
                    }

                    Button("I Agree, Let's Go") { onContinue() }
                        .buttonStyle(KeeperPrimaryButtonStyle())
                        .disabled(!agreed)
                        .opacity(agreed ? 1.0 : 0.4)
                        .animation(.easeOut(duration: 0.2), value: agreed)
                }
                .padding(.horizontal, 24)
                .padding(.top, 16)
                .padding(.bottom, 48)
                .background(Color(.systemBackground))
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.5).delay(0.1)) { appeared = true }
        }
    }
}

private struct DisclaimerCard: View {
    let icon: String
    let color: Color
    let title: String
    let body: String

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(color.opacity(0.12))
                    .frame(width: 42, height: 42)
                Image(systemName: icon)
                    .font(.body)
                    .foregroundStyle(color)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline).fontWeight(.semibold)
                Text(body)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineSpacing(3)
            }
            Spacer()
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color(.secondarySystemBackground))
        )
    }
}

#Preview {
    DisclaimerView(onContinue: {})
}
