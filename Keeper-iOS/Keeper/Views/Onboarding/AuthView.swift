import SwiftUI

struct AuthView: View {
    let onComplete: () -> Void
    @EnvironmentObject var appState: AppState

    @State private var isSignUp = true
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var isLoading = false
    @State private var errorMessage: String? = nil
    @FocusState private var focusedField: Field?

    enum Field { case email, password, confirm }

    private var canSubmit: Bool {
        let emailOK = email.contains("@") && email.contains(".")
        let passOK  = password.count >= 8
        let confirmOK = !isSignUp || password == confirmPassword
        return emailOK && passOK && confirmOK && !isLoading
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 32) {
                // Header
                VStack(alignment: .leading, spacing: 6) {
                    Text(isSignUp ? "Create your" : "Welcome")
                        .font(.largeTitle).fontWeight(.bold)
                    Text(isSignUp ? "free account." : "back.")
                        .font(.largeTitle).fontWeight(.bold)
                        .foregroundStyle(Color.keeperGreen)
                }
                .padding(.top, 60)

                // Fields
                VStack(spacing: 14) {
                    AuthField(
                        placeholder: "Email address",
                        text: $email,
                        icon: "envelope.fill",
                        keyboardType: .emailAddress,
                        textContentType: .emailAddress
                    )
                    .focused($focusedField, equals: .email)
                    .submitLabel(.next)
                    .onSubmit { focusedField = .password }

                    AuthField(
                        placeholder: "Password (8+ characters)",
                        text: $password,
                        icon: "lock.fill",
                        isSecure: true,
                        textContentType: isSignUp ? .newPassword : .password
                    )
                    .focused($focusedField, equals: .password)
                    .submitLabel(isSignUp ? .next : .go)
                    .onSubmit {
                        if isSignUp { focusedField = .confirm } else { submit() }
                    }

                    if isSignUp {
                        AuthField(
                            placeholder: "Confirm password",
                            text: $confirmPassword,
                            icon: "lock.rotation",
                            isSecure: true,
                            textContentType: .newPassword
                        )
                        .focused($focusedField, equals: .confirm)
                        .submitLabel(.go)
                        .onSubmit { submit() }
                        .transition(.move(edge: .top).combined(with: .opacity))
                    }
                }
                .animation(.spring(response: 0.35), value: isSignUp)

                // Error
                if let err = errorMessage {
                    HStack(spacing: 8) {
                        Image(systemName: "exclamationmark.circle.fill")
                            .foregroundStyle(.red)
                        Text(err)
                            .font(.subheadline)
                            .foregroundStyle(.red)
                    }
                    .padding(12)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(Color.red.opacity(0.08))
                    )
                    .transition(.opacity.combined(with: .move(edge: .top)))
                }

                // CTA
                VStack(spacing: 12) {
                    Button(action: submit) {
                        HStack(spacing: 8) {
                            if isLoading {
                                ProgressView()
                                    .tint(.white)
                                    .scaleEffect(0.8)
                            }
                            Text(isSignUp ? "Create Account" : "Sign In")
                        }
                    }
                    .buttonStyle(KeeperPrimaryButtonStyle())
                    .disabled(!canSubmit)
                    .opacity(canSubmit ? 1.0 : 0.5)

                    Button {
                        withAnimation(.easeInOut(duration: 0.25)) {
                            isSignUp.toggle()
                            errorMessage = nil
                            confirmPassword = ""
                        }
                    } label: {
                        Text(isSignUp ? "Already have an account? **Sign in**" : "Don't have an account? **Sign up**")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer().frame(height: 40)
            }
            .padding(.horizontal, 24)
        }
        .animation(.easeInOut(duration: 0.2), value: errorMessage)
    }

    // MARK: - Submit

    private func submit() {
        guard canSubmit else { return }
        focusedField = nil
        isLoading = true
        errorMessage = nil
        HapticManager.shared.impact(.medium)

        Task {
            let user: KeeperUser?
            if isSignUp {
                user = await appState.supabaseService.signUp(email: email, password: password)
            } else {
                user = await appState.supabaseService.signIn(email: email, password: password)
            }

            isLoading = false

            if let user = user {
                appState.currentUser = user
                appState.isAuthenticated = true
                HapticManager.shared.success()
                onComplete()
            } else {
                HapticManager.shared.error()
                withAnimation {
                    errorMessage = isSignUp
                        ? "Couldn't create account. That email may already be in use."
                        : "Sign in failed. Check your email and password."
                }
            }
        }
    }
}

// MARK: - AuthField

private struct AuthField: View {
    let placeholder: String
    @Binding var text: String
    let icon: String
    var keyboardType: UIKeyboardType = .default
    var isSecure: Bool = false
    var textContentType: UITextContentType? = nil

    @State private var showPassword = false

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.subheadline)
                .foregroundStyle(Color.keeperGreen)
                .frame(width: 20)

            Group {
                if isSecure && !showPassword {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                        .keyboardType(keyboardType)
                        .autocapitalization(.none)
                        .autocorrectionDisabled()
                }
            }
            .font(.body)

            if isSecure {
                Button {
                    showPassword.toggle()
                } label: {
                    Image(systemName: showPassword ? "eye.slash.fill" : "eye.fill")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Color(.secondarySystemBackground))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(Color.keeperGreen.opacity(text.isEmpty ? 0 : 0.4), lineWidth: 1.5)
        )
        .animation(.easeOut(duration: 0.15), value: text.isEmpty)
    }
}

#Preview {
    AuthView(onComplete: {})
        .environmentObject(AppState())
}
