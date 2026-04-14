import LocalAuthentication
import SwiftUI

/// Manages Face ID / Touch ID / passcode authentication for the app lock screen.
/// All published state mutations happen on the main actor so views update safely.
@MainActor
final class BiometricAuthService: ObservableObject {
    static let shared = BiometricAuthService()
    private init() {}

    // MARK: - Published State

    @Published var isAuthenticated = false
    @Published var biometricType: LABiometryType = .none

    // MARK: - Helpers

    /// Human-readable name of the device's primary biometric method.
    var biometricTypeName: String {
        switch biometricType {
        case .faceID:  return "Face ID"
        case .touchID: return "Touch ID"
        default:       return "Passcode"
        }
    }

    // MARK: - Availability Check

    /// Queries the device for biometric capability and updates `biometricType`.
    /// Call this once on app launch (e.g. from `AppState.init`).
    func checkBiometricAvailability() {
        let context = LAContext()
        var error: NSError?
        context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
        biometricType = context.biometryType
    }

    // MARK: - Authentication

    /// Presents the system authentication UI (biometric + passcode fallback).
    /// - Parameter reason: The localised string shown in the system prompt.
    /// - Returns: `true` if the user authenticated successfully, `false` otherwise.
    @discardableResult
    func authenticate(reason: String = "Authenticate to access Keeper") async -> Bool {
        // Always use a fresh context — reusing contexts can cause silent failures.
        let freshContext = LAContext()
        var error: NSError?

        guard freshContext.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
            isAuthenticated = false
            return false
        }

        do {
            let success = try await freshContext.evaluatePolicy(
                .deviceOwnerAuthentication,
                localizedReason: reason
            )
            isAuthenticated = success
            return success
        } catch {
            isAuthenticated = false
            return false
        }
    }
}
