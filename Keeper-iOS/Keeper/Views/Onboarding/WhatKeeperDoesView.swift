import SwiftUI

// MARK: - WhatKeeperDoesView

struct WhatKeeperDoesView: View {
    let onContinue: () -> Void
    @State private var visibleItems = 0

    let canDo: [(icon: String, text: String)] = [
        ("banknote.fill",               "Reads your transactions (read-only)"),
        ("magnifyingglass.circle.fill",  "Finds money you're losing"),
        ("chart.line.uptrend.xyaxis",    "Gives investment guidance"),
        ("bell.fill",                    "Sends you weekly intelligence reports"),
    ]

    let cannotDo: [(icon: String, text: String)] = [
        ("xmark.circle.fill", "Cannot move or transfer money"),
        ("xmark.circle.fill", "Cannot make purchases"),
        ("xmark.circle.fill", "Does not sell your data"),
        ("xmark.circle.fill", "Cannot access your passwords"),
    ]

    private var totalItems: Int { canDo.count + cannotDo.count }

    var body: some View {
        VStack(spacing: 0) {

            // MARK: Scrollable content
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 32) {

                    // MARK: Header
                    VStack(alignment: .leading, spacing: 6) {
                        Text("What Keeper does")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        Text("and doesn't do.")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 60)

                    // MARK: Can do list
                    VStack(alignment: .leading, spacing: 14) {
                        SectionLabel(text: "WE DO THIS")

                        ForEach(Array(canDo.enumerated()), id: \.offset) { index, item in
                            if index < visibleItems {
                                CheckRow(
                                    icon: "checkmark.circle.fill",
                                    text: item.text,
                                    isPositive: true
                                )
                                .transition(
                                    .asymmetric(
                                        insertion: .move(edge: .leading).combined(with: .opacity),
                                        removal: .opacity
                                    )
                                )
                            }
                        }
                    }

                    // MARK: Cannot do list
                    VStack(alignment: .leading, spacing: 14) {
                        SectionLabel(text: "WE NEVER DO THIS")

                        ForEach(Array(cannotDo.enumerated()), id: \.offset) { index, item in
                            if index + canDo.count < visibleItems {
                                CheckRow(
                                    icon: item.icon,
                                    text: item.text,
                                    isPositive: false
                                )
                                .transition(
                                    .asymmetric(
                                        insertion: .move(edge: .leading).combined(with: .opacity),
                                        removal: .opacity
                                    )
                                )
                            }
                        }
                    }

                    // Bottom spacer so last item clears the button bar
                    Spacer().frame(height: 16)
                }
                .padding(.horizontal, 24)
            }

            // MARK: Fixed bottom button
            VStack(spacing: 0) {
                Divider().opacity(0.3)

                Button("I Understand, Continue") {
                    HapticManager.shared.impact(.medium)
                    onContinue()
                }
                .buttonStyle(KeeperPrimaryButtonStyle())
                .padding(.horizontal, 24)
                .padding(.top, 16)
                .padding(.bottom, 48)
                .opacity(visibleItems >= totalItems ? 1.0 : 0.0)
                .animation(.easeOut(duration: 0.3), value: visibleItems >= totalItems)
            }
            .background(Color(.systemBackground))
        }
        .onAppear { animateItems() }
    }

    // MARK: - Stagger animation

    private func animateItems() {
        for i in 0...totalItems {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * 0.15) {
                withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
                    visibleItems = i + 1
                }
            }
        }
    }
}

// MARK: - Supporting Views

private struct SectionLabel: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.caption)
            .fontWeight(.semibold)
            .foregroundStyle(.secondary)
            .kerning(1.5)
    }
}

struct CheckRow: View {
    let icon: String
    let text: String
    let isPositive: Bool

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(isPositive ? Color.keeperGreen.opacity(0.12) : Color.red.opacity(0.10))
                    .frame(width: 38, height: 38)

                Image(systemName: icon)
                    .font(.body)
                    .fontWeight(.semibold)
                    .foregroundStyle(isPositive ? Color.keeperGreen : Color.red)
            }

            Text(text)
                .font(.body)
                .foregroundStyle(.primary)

            Spacer()
        }
        .padding(.vertical, 4)
    }
}

// MARK: - Preview

#Preview {
    WhatKeeperDoesView(onContinue: {})
}
