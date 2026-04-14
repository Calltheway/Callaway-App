import Foundation

enum Constants {
    enum API {
        static let claudeBaseURL        = "https://api.anthropic.com"
        static let claudeModel          = "claude-sonnet-4-20250514"
        static let alphaVantageBaseURL  = "https://www.alphavantage.co/query"
        static let plaidBaseURL         = "https://production.plaid.com" // sandbox: sandbox.plaid.com
    }

    enum Keychain {
        static let supabaseAccessToken  = "keeper.supabase.access_token"
        static let supabaseRefreshToken = "keeper.supabase.refresh_token"
        static let plaidAccessToken     = "keeper.plaid.access_token"
        static let anthropicKey         = "keeper.anthropic.api_key"
        static let alphaVantageKey      = "keeper.alphavantage.api_key"
    }

    enum ETFCacheDuration: Double {
        case minutes60 = 3600
    }

    enum UserDefaultsKeys {
        static let onboardingComplete        = "onboarding_complete"
        static let lastBiometricDate         = "last_biometric_date"
        static let biometricTimeoutMinutes   = 15
    }

    enum Investment {
        /// Minimum balance to keep in checking before calculating investable surplus.
        static let comfortBuffer: Double    = 1000
        static let defaultMonthlyAmount: Double = 200
    }

    enum InvestmentDisclaimer {
        static let text = "Investment information provided by Keeper is for educational purposes only and does not constitute personalized financial advice, a solicitation, or a recommendation to buy or sell any security. Past performance does not guarantee future results. Investing involves risk, including the possible loss of principal. Consult a licensed financial advisor before making investment decisions."
    }
}

// MARK: - App Configuration (reads from Info.plist, populated via xcconfig)
enum AppConfig {
    static var supabaseURL: String {
        Bundle.main.infoDictionary?["SUPABASE_URL"] as? String ?? ""
    }
    static var supabaseAnonKey: String {
        Bundle.main.infoDictionary?["SUPABASE_ANON_KEY"] as? String ?? ""
    }
    static var plaidClientId: String {
        Bundle.main.infoDictionary?["PLAID_CLIENT_ID"] as? String ?? ""
    }
    static var revenueCatKey: String {
        Bundle.main.infoDictionary?["REVENUECAT_API_KEY"] as? String ?? ""
    }
}
