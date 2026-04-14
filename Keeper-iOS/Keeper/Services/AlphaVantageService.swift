import Foundation

/// Alpha Vantage GLOBAL_QUOTE price fetcher for the six Keeper ETF tickers.
/// Results are cached in-memory for 60 minutes to respect the free-tier rate limit.
@MainActor
final class AlphaVantageService {
    static let shared = AlphaVantageService()
    private init() {}

    // MARK: - Configuration

    private var apiKey: String {
        KeychainManager.shared.retrieve(Constants.Keychain.alphaVantageKey) ?? "demo"
    }

    private let tickers: [String] = ["VTI", "VOO", "QQQ", "SCHD", "VYM", "BND"]

    // MARK: - Cache

    /// Maps ticker → (price, fetchTimestamp). In-memory only; invalidated on launch.
    private var priceCache: [String: (price: Double, timestamp: Date)] = [:]

    private var cacheTTL: TimeInterval {
        Constants.ETFCacheDuration.minutes60.rawValue
    }

    // MARK: - Public API

    /// Fetches live prices for all six tickers concurrently, merging them into
    /// `ETFPrice.defaults`. Returns defaults if every network call fails.
    func fetchAllETFPrices() async -> [ETFPrice] {
        // Fan out to concurrent tasks — one per ticker.
        let fetched: [(String, Double)] = await withTaskGroup(of: (String, Double?).self) { group in
            for ticker in tickers {
                group.addTask { [self] in
                    let price = await self.fetchPrice(for: ticker)
                    return (ticker, price)
                }
            }
            var pairs: [(String, Double)] = []
            for await (ticker, price) in group {
                if let p = price { pairs.append((ticker, p)) }
            }
            return pairs
        }

        guard !fetched.isEmpty else { return ETFPrice.defaults }

        // Merge live prices into the default catalogue so metadata (name, description, etc.) is preserved.
        let priceMap = Dictionary(uniqueKeysWithValues: fetched)

        return ETFPrice.defaults.map { etf in
            guard let livePrice = priceMap[etf.ticker] else { return etf }
            return ETFPrice(
                ticker:            etf.ticker,
                name:              etf.name,
                currentPrice:      livePrice,
                tenYearReturnRate: etf.tenYearReturnRate,
                description:       etf.description,
                category:          etf.category,
                lastUpdated:       Date()
            )
        }
    }

    /// Returns a live price for a single ticker, using the 60-minute in-memory cache.
    /// Returns nil if the network call fails or the response cannot be parsed.
    func fetchPrice(for ticker: String) async -> Double? {
        // Serve from cache when the entry is fresh.
        if let cached = priceCache[ticker],
           Date().timeIntervalSince(cached.timestamp) < cacheTTL {
            return cached.price
        }

        guard let url = URL(string:
            "\(Constants.API.alphaVantageBaseURL)?function=GLOBAL_QUOTE&symbol=\(ticker)&apikey=\(apiKey)"
        ) else { return nil }

        guard let (data, response) = try? await URLSession.shared.data(from: url) else { return nil }

        #if DEBUG
        if let http = response as? HTTPURLResponse, http.statusCode != 200 {
            print("[AlphaVantageService] fetchPrice(\(ticker)) HTTP \(http.statusCode)")
        }
        #endif

        let decoder = JSONDecoder()
        guard let parsed = try? decoder.decode(AlphaVantageQuoteResponse.self, from: data),
              let price  = Double(parsed.globalQuote.price),
              price > 0
        else {
            #if DEBUG
            let raw = String(data: data, encoding: .utf8) ?? "<binary>"
            print("[AlphaVantageService] fetchPrice(\(ticker)) parse failure: \(raw.prefix(200))")
            #endif
            return nil
        }

        priceCache[ticker] = (price, Date())
        return price
    }

    // MARK: - Cache Management

    /// Clears the price cache, forcing fresh network calls on the next fetch.
    func invalidateCache() {
        priceCache.removeAll()
    }

    /// Returns whether a cached entry for `ticker` is still considered fresh.
    func isCacheFresh(for ticker: String) -> Bool {
        guard let cached = priceCache[ticker] else { return false }
        return Date().timeIntervalSince(cached.timestamp) < cacheTTL
    }
}
