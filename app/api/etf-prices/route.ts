import { NextResponse } from 'next/server';

const TICKERS = ['VTI', 'QQQ', 'BND', 'VXUS', 'VGT', 'ARKK', 'SOXX'];

// Fallback prices if Alpha Vantage is unavailable / key not set
const FALLBACK: Record<string, { price: number; changePercent: number; name: string }> = {
  VTI:  { price: 238.42, changePercent:  0.52, name: 'Vanguard Total Market'    },
  QQQ:  { price: 471.88, changePercent:  0.87, name: 'Invesco NASDAQ 100'        },
  BND:  { price:  73.21, changePercent: -0.11, name: 'Vanguard Total Bond'       },
  VXUS: { price:  60.14, changePercent:  0.34, name: 'Vanguard Total Intl Stock' },
  VGT:  { price: 561.30, changePercent:  1.02, name: 'Vanguard Info Technology'  },
  ARKK: { price:  48.72, changePercent: -1.43, name: 'ARK Innovation'            },
  SOXX: { price: 204.50, changePercent:  1.18, name: 'iShares Semiconductor'     },
};

async function fetchQuote(ticker: string, apiKey: string) {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
  if (!res.ok) throw new Error(`AV ${ticker}: ${res.status}`);
  const json = await res.json() as Record<string, unknown>;
  const q = json['Global Quote'] as Record<string, string> | undefined;
  if (!q || !q['05. price']) throw new Error(`AV ${ticker}: no data`);
  return {
    ticker,
    name:          FALLBACK[ticker]?.name ?? ticker,
    price:         parseFloat(q['05. price']),
    changePercent: parseFloat(q['10. change percent']?.replace('%', '') ?? '0'),
    live:          true,
  };
}

export async function GET() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    // Demo mode — return fallback data
    const data = TICKERS.map((t) => ({ ticker: t, ...FALLBACK[t], live: false }));
    return NextResponse.json({ data, source: 'demo' });
  }

  // Fetch all tickers in parallel, fall back individually on failure
  const results = await Promise.all(
    TICKERS.map((ticker) =>
      fetchQuote(ticker, apiKey).catch(() => ({
        ticker,
        ...FALLBACK[ticker],
        live: false,
      }))
    )
  );

  return NextResponse.json({ data: results, source: 'alphavantage' });
}
