import UIKit

@MainActor
final class HapticManager {
    static let shared = HapticManager()
    private init() {}

    // MARK: - Impact Feedback

    /// Fires a single impact haptic at the requested intensity.
    func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .light) {
        UIImpactFeedbackGenerator(style: style).impactOccurred()
    }

    // MARK: - Notification Feedback

    /// Fires a notification-style haptic (.success, .warning, or .error).
    func notification(_ type: UINotificationFeedbackGenerator.FeedbackType) {
        UINotificationFeedbackGenerator().notificationOccurred(type)
    }

    /// Convenience: success notification haptic.
    func success() { notification(.success) }

    /// Convenience: warning notification haptic.
    func warning() { notification(.warning) }

    /// Convenience: error notification haptic.
    func error() { notification(.error) }

    // MARK: - Custom Patterns

    /// Double-impact pattern followed by a success notification — used when
    /// Keeper reveals new savings to the user.
    func savingsRevealed() {
        Task {
            impact(.medium)
            try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 s
            impact(.heavy)
            try? await Task.sleep(nanoseconds: 200_000_000) // 0.2 s
            notification(.success)
        }
    }
}
