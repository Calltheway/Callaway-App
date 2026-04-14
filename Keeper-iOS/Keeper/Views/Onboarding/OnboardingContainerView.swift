import SwiftUI

struct OnboardingContainerView: View {
    @EnvironmentObject var appState: AppState
    @State private var currentStep = 0

    var body: some View {
        ZStack {
            Group {
                switch currentStep {
                case 0: WelcomeView(onContinue: { nextStep() })
                case 1: WhatKeeperDoesView(onContinue: { nextStep() })
                case 2: DisclaimerView(onContinue: { nextStep() })
                case 3: AuthView(onComplete: { nextStep() })
                case 4: ConnectBankView(onContinue: { nextStep() })
                case 5: ConnectEmailView(onContinue: { nextStep() })
                case 6: FirstScanView(onComplete: { nextStep() })
                case 7: ResultsRevealView(onComplete: { completeOnboarding() })
                default: EmptyView()
                }
            }
            .transition(.asymmetric(
                insertion: .move(edge: .trailing).combined(with: .opacity),
                removal: .move(edge: .leading).combined(with: .opacity)
            ))
        }
        .animation(.easeInOut(duration: 0.35), value: currentStep)
    }

    // MARK: - Navigation

    private func nextStep() {
        HapticManager.shared.impact(.light)
        withAnimation { currentStep += 1 }
    }

    private func completeOnboarding() {
        UserDefaults.standard.set(true, forKey: Constants.UserDefaultsKeys.onboardingComplete)
        withAnimation(.easeInOut(duration: 0.4)) {
            appState.onboardingComplete = true
        }
    }
}

#Preview {
    OnboardingContainerView()
        .environmentObject(AppState())
}
