import SwiftUI

extension Color {
    // MARK: - Brand Colors
    static let keeperGreen        = Color(hex: "#00C48C")
    static let keeperGreenLight   = Color(hex: "#00C48C").opacity(0.15)

    // MARK: - Semantic / Adaptive Colors
    static let keeperBackground       = Color(.systemBackground)
    static let keeperSecondary        = Color(.secondarySystemBackground)
    static let keeperTertiary         = Color(.tertiarySystemBackground)
    static let keeperLabel            = Color(.label)
    static let keeperSecondaryLabel   = Color(.secondaryLabel)

    // MARK: - Hex Initializer
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:  (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:  (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:  (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 255, 255, 255)
        }
        self.init(
            .sRGB,
            red:     Double(r) / 255,
            green:   Double(g) / 255,
            blue:    Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
