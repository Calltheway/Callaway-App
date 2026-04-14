import Foundation

// MARK: - User
struct KeeperUser: Codable, Identifiable {
    let id: UUID
    var email: String
    var subscriptionTier: SubscriptionTier
    var totalSaved: Double
    var riskTolerance: RiskTolerance
    var monthlyIncomeEstimate: Double?
    var investableSurplus: Double?
    var onboardingComplete: Bool
    var createdAt: Date

    enum SubscriptionTier: String, Codable {
        case free, pro, keeperPlus = "keeper_plus"
    }

    enum RiskTolerance: String, Codable {
        case conservative, moderate, aggressive
    }
}

// MARK: - Connected Account
struct ConnectedAccount: Codable, Identifiable {
    let id: UUID
    var userId: UUID
    var institutionName: String
    var institutionLogoURL: String?
    var lastSynced: Date?
    var accountType: String
    var currentBalance: Double
    var plaidItemId: String
}

// MARK: - Transaction
struct Transaction: Codable, Identifiable {
    let id: UUID
    var userId: UUID
    var accountId: UUID
    var merchantName: String
    var amount: Double
    var date: Date
    var category: TransactionCategory
    var isRecurring: Bool
    var recurringFrequency: RecurringFrequency?
    var isFlagged: Bool
    var plaidTransactionId: String

    enum TransactionCategory: String, Codable, CaseIterable {
        case subscriptions, utilities, food, transportation, entertainment
        case healthcare, shopping, income, savings, other

        var displayName: String {
            switch self {
            case .subscriptions:   return "Subscriptions"
            case .utilities:       return "Utilities"
            case .food:            return "Food & Dining"
            case .transportation:  return "Transportation"
            case .entertainment:   return "Entertainment"
            case .healthcare:      return "Healthcare"
            case .shopping:        return "Shopping"
            case .income:          return "Income"
            case .savings:         return "Savings"
            case .other:           return "Other"
            }
        }
    }

    enum RecurringFrequency: String, Codable {
        case weekly, monthly, quarterly, annual
    }
}

// MARK: - Detected Issue
struct DetectedIssue: Codable, Identifiable {
    let id: UUID
    var userId: UUID
    var issueType: IssueType
    var merchantName: String
    var monthlyCost: Double
    var annualCost: Double
    var status: IssueStatus
    var confidenceScore: Double
    var detectedAt: Date
    var resolvedAt: Date?
    var amountSaved: Double?
    var actionType: ActionType
    var claudeExplanation: String
    var negotiationScript: String?

    enum IssueType: String, Codable {
        case forgottenSubscription = "forgotten_subscription"
        case priceIncrease         = "price_increase"
        case duplicateCharge       = "duplicate_charge"
        case unusedSubscription    = "unused_subscription"
        case overpricedService     = "overpriced_service"
        case idleMoney             = "idle_money"
        case billingError          = "billing_error"

        var displayName: String {
            switch self {
            case .forgottenSubscription: return "Forgotten Subscription"
            case .priceIncrease:         return "Price Increase"
            case .duplicateCharge:       return "Duplicate Charge"
            case .unusedSubscription:    return "Unused Subscription"
            case .overpricedService:     return "Overpriced Service"
            case .idleMoney:             return "Idle Money"
            case .billingError:          return "Billing Error"
            }
        }

        var iconName: String {
            switch self {
            case .forgottenSubscription: return "creditcard.fill"
            case .priceIncrease:         return "arrow.up.circle.fill"
            case .duplicateCharge:       return "doc.on.doc.fill"
            case .unusedSubscription:    return "zzz"
            case .overpricedService:     return "dollarsign.circle.fill"
            case .idleMoney:             return "banknote.fill"
            case .billingError:          return "exclamationmark.circle.fill"
            }
        }
    }

    enum IssueStatus: String, Codable {
        case new, inProgress = "in_progress", resolved, dismissed
    }

    enum ActionType: String, Codable {
        case cancel, negotiate, invest, claim, review, switchService = "switch"

        var displayName: String {
            switch self {
            case .cancel:        return "Cancel"
            case .negotiate:     return "Negotiate"
            case .invest:        return "Invest Savings"
            case .claim:         return "Claim Refund"
            case .review:        return "Review"
            case .switchService: return "Switch Provider"
            }
        }

        var difficulty: ActionDifficulty {
            switch self {
            case .cancel:        return .easy
            case .negotiate:     return .medium
            case .invest:        return .easy
            case .claim:         return .medium
            case .review:        return .easy
            case .switchService: return .hard
            }
        }
    }

    enum ActionDifficulty: String, Codable {
        case easy, medium, hard

        /// Returns a semantic color name for use with SwiftUI Color initializer.
        var color: String {
            switch self {
            case .easy:   return "green"
            case .medium: return "orange"
            case .hard:   return "red"
            }
        }

        var displayName: String { rawValue.capitalized }
    }
}

// MARK: - ETF Price
struct ETFPrice: Codable, Identifiable {
    var id: String { ticker }
    var ticker: String
    var name: String
    var currentPrice: Double
    var tenYearReturnRate: Double // as decimal, e.g. 0.112 for 11.2%
    var description: String
    var category: ETFCategory
    var lastUpdated: Date

    enum ETFCategory: String, Codable {
        case broadMarket = "broad_market"
        case growth
        case dividend
        case bond

        var displayName: String {
            switch self {
            case .broadMarket: return "Broad Market"
            case .growth:      return "Growth"
            case .dividend:    return "Dividend"
            case .bond:        return "Bonds"
            }
        }
    }

    static let defaults: [ETFPrice] = [
        ETFPrice(
            ticker: "VTI",
            name: "Vanguard Total Stock Market",
            currentPrice: 245.30,
            tenYearReturnRate: 0.112,
            description: "Total US market exposure",
            category: .broadMarket,
            lastUpdated: Date()
        ),
        ETFPrice(
            ticker: "VOO",
            name: "Vanguard S&P 500 ETF",
            currentPrice: 498.45,
            tenYearReturnRate: 0.128,
            description: "S&P 500 index tracking",
            category: .broadMarket,
            lastUpdated: Date()
        ),
        ETFPrice(
            ticker: "QQQ",
            name: "Invesco NASDAQ-100",
            currentPrice: 445.20,
            tenYearReturnRate: 0.183,
            description: "Tech-heavy growth ETF",
            category: .growth,
            lastUpdated: Date()
        ),
        ETFPrice(
            ticker: "SCHD",
            name: "Schwab US Dividend Equity",
            currentPrice: 82.30,
            tenYearReturnRate: 0.128,
            description: "High-quality dividend stocks",
            category: .dividend,
            lastUpdated: Date()
        ),
        ETFPrice(
            ticker: "VYM",
            name: "Vanguard High Dividend Yield",
            currentPrice: 128.90,
            tenYearReturnRate: 0.108,
            description: "High dividend yield focus",
            category: .dividend,
            lastUpdated: Date()
        ),
        ETFPrice(
            ticker: "BND",
            name: "Vanguard Total Bond Market",
            currentPrice: 72.50,
            tenYearReturnRate: 0.034,
            description: "Bond market stability",
            category: .bond,
            lastUpdated: Date()
        ),
    ]
}

// MARK: - Investment Scenario
struct InvestmentScenario: Identifiable {
    let id = UUID()
    var name: String
    var description: String
    var monthlyAmount: Double
    var etfs: [ETFPrice]
    var averageReturnRate: Double

    /// Projected portfolio values keyed by years (5, 10, 20, 30).
    var projectedValues: [Int: Double] {
        var results: [Int: Double] = [:]
        for years in [5, 10, 20, 30] {
            results[years] = compoundMonthly(months: years * 12)
        }
        return results
    }

    private func compoundMonthly(months: Int) -> Double {
        let monthlyRate = averageReturnRate / 12
        guard monthlyRate != 0 else { return monthlyAmount * Double(months) }
        return monthlyAmount * (pow(1 + monthlyRate, Double(months)) - 1) / monthlyRate
    }

    func projectedValue(years: Int) -> Double {
        compoundMonthly(months: years * 12)
    }

    static func scenarios(monthlyAmount: Double, etfs: [ETFPrice]) -> [InvestmentScenario] {
        let vti  = etfs.first { $0.ticker == "VTI"  } ?? ETFPrice.defaults[0]
        let voo  = etfs.first { $0.ticker == "VOO"  } ?? ETFPrice.defaults[1]
        let qqq  = etfs.first { $0.ticker == "QQQ"  } ?? ETFPrice.defaults[2]
        let schd = etfs.first { $0.ticker == "SCHD" } ?? ETFPrice.defaults[3]
        let vym  = etfs.first { $0.ticker == "VYM"  } ?? ETFPrice.defaults[4]

        return [
            InvestmentScenario(
                name: "The Foundation",
                description: "Broad market exposure. Set it and forget it.",
                monthlyAmount: monthlyAmount,
                etfs: [vti, voo],
                averageReturnRate: (vti.tenYearReturnRate + voo.tenYearReturnRate) / 2
            ),
            InvestmentScenario(
                name: "Growth-Focused",
                description: "Higher potential returns, more volatility.",
                monthlyAmount: monthlyAmount,
                etfs: [qqq, voo],
                averageReturnRate: (qqq.tenYearReturnRate + voo.tenYearReturnRate) / 2
            ),
            InvestmentScenario(
                name: "Income & Dividends",
                description: "Regular dividend payments plus growth.",
                monthlyAmount: monthlyAmount,
                etfs: [schd, vym],
                averageReturnRate: (schd.tenYearReturnRate + vym.tenYearReturnRate) / 2
            ),
        ]
    }
}

// MARK: - Chat Message
struct ChatMessage: Identifiable {
    let id = UUID()
    var role: MessageRole
    var content: String
    var createdAt: Date
    var isStreaming: Bool

    enum MessageRole: String, Codable {
        case user, assistant
    }
}

// MARK: - Weekly Report
struct WeeklyReport: Codable, Identifiable {
    let id: UUID
    var userId: UUID
    var weekStartDate: Date
    var newSavingsFound: Double
    var topAction: String
    var alertMessage: String?
    var savingsRate: Double
    var investmentOpportunity: String
    var claudeSummary: String
}

// MARK: - Alpha Vantage Response
struct AlphaVantageQuoteResponse: Codable {
    let globalQuote: GlobalQuote

    enum CodingKeys: String, CodingKey {
        case globalQuote = "Global Quote"
    }

    struct GlobalQuote: Codable {
        let symbol: String
        let price: String
        let changePercent: String

        enum CodingKeys: String, CodingKey {
            case symbol        = "01. symbol"
            case price         = "05. price"
            case changePercent = "10. change percent"
        }
    }
}

// MARK: - Claude Analysis Response
struct ClaudeAnalysisResult: Codable {
    var issues: [ClaudeIssue]
    var totalPotentialSavings: Double
    var investableSurplus: Double
    var monthlyIncomeEstimate: Double
    var summary: String
    var transactionsAnalyzed: Int

    struct ClaudeIssue: Codable {
        var issueType: String
        var merchantName: String
        var monthlyCost: Double
        var annualCost: Double
        var confidenceScore: Double
        var actionType: String
        var explanation: String
        var negotiationScript: String?
    }
}
