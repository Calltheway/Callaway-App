import SwiftUI

extension View {
    // MARK: - Card Style

    /// Applies the standard Keeper card background, rounded corners, and subtle shadow.
    func keeperCard() -> some View {
        self
            .background(Color.keeperSecondary)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 2)
    }

    // MARK: - Investment Disclaimer

    /// Appends the regulatory investment disclaimer beneath the view.
    func investmentDisclaimer() -> some View {
        VStack(alignment: .leading, spacing: 0) {
            self
            Text(Constants.InvestmentDisclaimer.text)
                .font(.caption2)
                .foregroundStyle(.secondary)
                .padding(.top, 8)
        }
    }

    // MARK: - Haptic Feedback

    /// Triggers a haptic impact when the view is tapped, without consuming the gesture.
    func hapticFeedback(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .light) -> some View {
        self.simultaneousGesture(
            TapGesture().onEnded {
                UIImpactFeedbackGenerator(style: style).impactOccurred()
            }
        )
    }
}
