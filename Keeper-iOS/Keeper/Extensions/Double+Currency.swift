import Foundation

extension Double {
    // MARK: - Currency Formatting

    /// Full currency with cents: "$12.34"
    var asCurrency: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        formatter.maximumFractionDigits = 2
        return formatter.string(from: NSNumber(value: self)) ?? "$\(self)"
    }

    /// Rounded currency, no cents: "$12"
    var asCurrencyRounded: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "USD"
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: self)) ?? "$\(Int(self))"
    }

    /// Percentage with one decimal: "11.2%"
    var asPercentage: String {
        String(format: "%.1f%%", self * 100)
    }

    /// Compact currency: "$1.2M", "$230K", "$450"
    var asCompactCurrency: String {
        switch self {
        case 1_000_000...: return String(format: "$%.1fM", self / 1_000_000)
        case 1_000...:     return String(format: "$%.1fK", self / 1_000)
        default:           return asCurrencyRounded
        }
    }
}
