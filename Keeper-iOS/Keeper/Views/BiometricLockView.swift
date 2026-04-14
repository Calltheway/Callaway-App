import SwiftUI

struct BiometricLockView: View {
    @EnvironmentObject var appState: AppState
    @State private var isAuthenticating = false
    @State private var failed = false

    var body: some View {
        ZStack {
            // Blur the content beneath
            Rectangle()
                .fill(.ultraThinMaterial)
                .ignoresSafeArea()

            VStack(spacing: 32) {
                Spacer()

                // Logo
                ZStack {
                    Circle()
                        .fill(Color.keeperGreen.opacity(0.12))
                        .frame(width: 100, height: 100)
                    Text("K")
                        .font(.system(size: 48, weight: .black, design: .rounded))
                        .foregroundStyle(Color.keeperGreen)
                }

                VStack(spacing: 8) {
                    Text("Keeper is locked")
                        .font(.title2).fontWeight(.bold)
                    Text("Authenticate to continue")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                if failed {
                    Text("Authentication failed. Try again.")
                        .font(.footnote)
                        .foregroundStyle(.red)
                        .transition(.opacity)
                }

                Spacer()

                VStack(spacing: 12) {
                    Button {
                        authenticate()
                    } label: {
                        HStack(spacing: 8) {
                            if isAuthenticating {
                                ProgressView().tint(.white).scaleEffect(0.8)
                            } else {
                                Image(systemName: BiometricAuthService.shared.biometricTypeName == "Face ID"
                                      ? "faceid" : "touchid")
                                    .font(.body)
                            }
                            Text("Unlock with \(BiometricAuthService.shared.biometricTypeName)")
                        }
                    }
                    .buttonStyle(KeeperPrimaryButtonStyle())
                    .disabled(isAuthenticating)
                    .padding(.horizontal, 32)

                    Button("Sign Out") {
                        Task { await appState.signOut() }
                    }
                    .buttonStyle(KeeperGhostButtonStyle(foregroundColor: .red))
                }
                .padding(.bottom, 52)
            }
        }
        .onAppear { authenticate() }
        .animation(.easeInOut(duration: 0.2), value: failed)
    }

    private func authenticate() {
        guard !isAuthenticating else { return }
        isAuthenticating = true
        failed = false

        Task {
            let success = await BiometricAuthService.shared.authenticate()
            isAuthenticating = false
            if success {
                HapticManager.shared.success()
                appState.requiresBiometric = false
            } else {
                HapticManager.shared.error()
                withAnimation { failed = true }
            }
        }
    }
}

#Preview {
    BiometricLockView()
        .environmentObject(AppState())
}
