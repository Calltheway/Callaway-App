import SwiftUI

// MARK: - WelcomeView

struct WelcomeView: View {
    let onContinue: () -> Void

    // Logo animation state
    @State private var logoPulse: Bool = false
    @State private var logoScale: CGFloat = 0.6
    @State private var logoOpacity: Double = 0
    @State private var glowRadius: CGFloat = 10

    // Content animation state
    @State private var titleOpacity: Double = 0
    @State private var titleOffset: CGFloat = 24
    @State private var subtitleOpacity: Double = 0
    @State private var statsOpacity: Double = 0
    @State private var buttonOpacity: Double = 0

    // Particle animation state
    @State private var particleOpacity: Double = 0

    var body: some View {
        ZStack {
            // MARK: Background gradient
            LinearGradient(
                colors: [
                    Color(hex: "#0A1628"),
                    Color(hex: "#0F1D35"),
                    Color(hex: "#0D1A2E")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            // MARK: Ambient particle field
            ParticleFieldView()
                .opacity(particleOpacity)
                .ignoresSafeArea()

            // MARK: Content
            VStack(spacing: 0) {
                Spacer()

                // Logo cluster
                ZStack {
                    // Outer glow ring
                    Circle()
                        .fill(Color.keeperGreen.opacity(0.08))
                        .frame(width: 180, height: 180)
                        .blur(radius: glowRadius)
                        .scaleEffect(logoPulse ? 1.15 : 1.0)
                        .animation(
                            .easeInOut(duration: 2.2)
                            .repeatForever(autoreverses: true),
                            value: logoPulse
                        )

                    // Mid ring
                    Circle()
                        .stroke(Color.keeperGreen.opacity(0.25), lineWidth: 1)
                        .frame(width: 130, height: 130)
                        .scaleEffect(logoPulse ? 1.08 : 1.0)
                        .animation(
                            .easeInOut(duration: 2.2)
                            .repeatForever(autoreverses: true)
                            .delay(0.3),
                            value: logoPulse
                        )

                    // Logo background circle
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Color.keeperGreen.opacity(0.30), Color.keeperGreen.opacity(0.10)],
                                center: .center,
                                startRadius: 0,
                                endRadius: 55
                            )
                        )
                        .frame(width: 110, height: 110)

                    // K lettermark
                    Text("K")
                        .font(.system(size: 58, weight: .black, design: .rounded))
                        .foregroundStyle(Color.keeperGreen)
                        .shadow(color: Color.keeperGreen.opacity(0.7), radius: 12, x: 0, y: 0)
                }
                .scaleEffect(logoScale)
                .opacity(logoOpacity)
                .padding(.bottom, 56)

                // MARK: Title
                VStack(spacing: 10) {
                    Text("Your money has been")
                        .font(.system(size: 34, weight: .bold, design: .default))
                        .foregroundStyle(.white)
                    Text("waiting for this.")
                        .font(.system(size: 34, weight: .bold, design: .default))
                        .foregroundStyle(Color.keeperGreen)
                }
                .multilineTextAlignment(.center)
                .opacity(titleOpacity)
                .offset(y: titleOffset)
                .padding(.horizontal, 32)
                .padding(.bottom, 20)

                // MARK: Subtitle
                Text("Keeper finds money you're losing every month and shows you exactly how to build wealth with it.")
                    .font(.body)
                    .foregroundStyle(Color.white.opacity(0.65))
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
                    .padding(.horizontal, 36)
                    .opacity(subtitleOpacity)
                    .padding(.bottom, 32)

                // MARK: Stats badge
                HStack(spacing: 6) {
                    Image(systemName: "chart.bar.fill")
                        .font(.caption)
                        .foregroundStyle(Color.keeperGreen)

                    Text("$3,000–$5,000 LOST PER YEAR  ·  AVERAGE HOUSEHOLD")
                        .font(.system(size: 11, weight: .semibold, design: .default))
                        .foregroundStyle(Color.white.opacity(0.45))
                        .kerning(0.5)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(
                    Capsule()
                        .fill(Color.white.opacity(0.06))
                        .overlay(
                            Capsule()
                                .stroke(Color.white.opacity(0.10), lineWidth: 1)
                        )
                )
                .opacity(statsOpacity)

                Spacer()

                // MARK: CTA Button
                VStack(spacing: 14) {
                    Button(action: onContinue) {
                        Text("Get Started")
                    }
                    .buttonStyle(KeeperPrimaryButtonStyle())
                    .padding(.horizontal, 24)

                    Text("Free · No credit card required")
                        .font(.caption)
                        .foregroundStyle(Color.white.opacity(0.35))
                }
                .opacity(buttonOpacity)
                .padding(.bottom, 52)
            }
        }
        .onAppear { runAppearAnimation() }
    }

    // MARK: - Animation Sequence

    private func runAppearAnimation() {
        // Particle field fades in
        withAnimation(.easeIn(duration: 1.0)) {
            particleOpacity = 0.6
        }

        // Logo springs in
        withAnimation(.spring(response: 0.7, dampingFraction: 0.65).delay(0.2)) {
            logoScale = 1.0
            logoOpacity = 1.0
        }

        // Start pulse loop
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            logoPulse = true
            withAnimation(.easeInOut(duration: 2.2).repeatForever(autoreverses: true)) {
                glowRadius = 22
            }
        }

        // Title rises in
        withAnimation(.easeOut(duration: 0.5).delay(0.55)) {
            titleOpacity = 1.0
            titleOffset = 0
        }

        // Subtitle
        withAnimation(.easeOut(duration: 0.5).delay(0.75)) {
            subtitleOpacity = 1.0
        }

        // Stats badge
        withAnimation(.easeOut(duration: 0.45).delay(0.95)) {
            statsOpacity = 1.0
        }

        // Button
        withAnimation(.easeOut(duration: 0.4).delay(1.15)) {
            buttonOpacity = 1.0
        }
    }
}

// MARK: - Particle Field

private struct ParticleFieldView: View {
    @State private var particles: [Particle] = (0..<22).map { _ in Particle() }

    var body: some View {
        GeometryReader { geo in
            ForEach(particles) { particle in
                ParticleDot(particle: particle, containerSize: geo.size)
            }
        }
    }
}

private struct Particle: Identifiable {
    let id = UUID()
    let relX: CGFloat = .random(in: 0.05...0.95)
    let relY: CGFloat = .random(in: 0.05...0.95)
    let size: CGFloat = .random(in: 2...5)
    let opacity: Double = .random(in: 0.25...0.65)
    let duration: Double = .random(in: 3.0...6.0)
    let delay: Double = .random(in: 0...2.5)
}

private struct ParticleDot: View {
    let particle: Particle
    let containerSize: CGSize
    @State private var floating = false

    var body: some View {
        Circle()
            .fill(Color.keeperGreen.opacity(particle.opacity))
            .frame(width: particle.size, height: particle.size)
            .position(
                x: particle.relX * containerSize.width,
                y: particle.relY * containerSize.height + (floating ? -8 : 4)
            )
            .animation(
                .easeInOut(duration: particle.duration)
                .repeatForever(autoreverses: true)
                .delay(particle.delay),
                value: floating
            )
            .onAppear { floating = true }
    }
}

// MARK: - Preview

#Preview {
    WelcomeView(onContinue: {})
}
