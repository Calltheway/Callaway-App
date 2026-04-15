'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

interface Scenario {
  id:          string;
  name:        string;
  description: string;
  returnRate:  number;
  etfs:        string[];
  color:       string;
  borderColor: string;
}

interface ETF {
  ticker:        string;
  name:          string;
  price:         number;
  tenYearReturn: number;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'conservative',
    name: 'Conservative',
    description: "Low volatility, steady growth. Ideal if you're within 5 years of a goal.",
    returnRate: 0.06,
    etfs: ['BND', 'VTI'],
    color: 'text-blue-400',
    borderColor: 'hover:border-blue-400/30',
  },
  {
    id: 'moderate',
    name: 'Moderate',
    description: 'Balanced mix of stocks and bonds. Most popular for long-term saving.',
    returnRate: 0.08,
    etfs: ['VTI', 'VXUS', 'BND'],
    color: 'text-keeper-green',
    borderColor: 'hover:border-keeper-green/30',
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Higher stock exposure for long-term compounding. Best for 10+ year horizons.',
    returnRate: 0.10,
    etfs: ['QQQ', 'VTI', 'VGT'],
    color: 'text-amber-400',
    borderColor: 'hover:border-amber-400/30',
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    description: 'Maximum growth potential with higher short-term volatility.',
    returnRate: 0.12,
    etfs: ['QQQ', 'ARKK', 'SOXX'],
    color: 'text-keeper-red',
    borderColor: 'hover:border-keeper-red/30',
  },
];

const ETFS: ETF[] = [
  { ticker: 'VTI',  name: 'Vanguard Total Market',    price: 238.42, tenYearReturn: 0.128  },
  { ticker: 'QQQ',  name: 'Invesco NASDAQ 100',        price: 471.88, tenYearReturn: 0.181  },
  { ticker: 'BND',  name: 'Vanguard Total Bond',       price:  73.21, tenYearReturn: 0.024  },
  { ticker: 'VXUS', name: 'Vanguard Total Intl Stock', price:  60.14, tenYearReturn: 0.054  },
  { ticker: 'VGT',  name: 'Vanguard Info Technology',  price: 561.30, tenYearReturn: 0.196  },
  { ticker: 'ARKK', name: 'ARK Innovation',            price:  48.72, tenYearReturn: -0.032 },
  { ticker: 'SOXX', name: 'iShares Semiconductor',     price: 204.50, tenYearReturn: 0.221  },
];

function project(monthly: number, rate: number, years: number): number {
  const r = rate / 12;
  return monthly * (((1 + r) ** (years * 12) - 1) / r) * (1 + r);
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function InvestPage() {
  const [monthly,   setMonthly]  = useState(200);
  const [useCustom, setCustom]   = useState(false);
  const [slider,    setSlider]   = useState(200);
  const [expanded,  setExpanded] = useState<string | null>(null);

  const amount = useCustom ? slider : monthly;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="mono-label mb-1">Keeper · Invest</p>
        <h1 className="text-2xl font-bold text-keeper-bright">Invest</h1>
        <p className="text-keeper-text text-sm mt-0.5">See how your savings could grow over time</p>
      </div>

      {/* Amount picker */}
      <div className="glass-card-glow relative overflow-hidden p-6">
        <div className="orb w-48 h-48 bg-keeper-green/8 -top-12 -right-12" />
        <div className="relative">
          <h2 className="font-semibold text-keeper-bright mb-4">Monthly Investment Amount</h2>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="mono-label mb-1">Investing</p>
              <p className="text-4xl font-black">
                <span className="glow-text">${amount.toLocaleString()}</span>
                <span className="text-base font-normal text-keeper-muted">/mo</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-keeper-text text-sm">Custom</span>
              <button
                onClick={() => setCustom(!useCustom)}
                className={`relative w-11 h-6 rounded-full transition-all border-2 border-transparent ${useCustom ? 'bg-keeper-green shadow-glow-sm' : 'bg-keeper-border'}`}
              >
                <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform ${useCustom ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {useCustom && (
            <div>
              <input
                type="range"
                min={50} max={2000} step={25}
                value={slider}
                onChange={(e) => setSlider(Number(e.target.value))}
                className="w-full accent-keeper-green"
              />
              <div className="flex justify-between text-keeper-muted text-xs mt-1">
                <span>$50</span><span>$2,000</span>
              </div>
            </div>
          )}

          {!useCustom && (
            <p className="text-keeper-muted text-xs flex items-center gap-1.5">
              <span className="text-keeper-green">💡</span>
              Based on your investable surplus after covering open issues
            </p>
          )}
        </div>
      </div>

      {/* Scenarios */}
      <div>
        <h2 className="font-semibold text-keeper-bright mb-3">Investment Scenarios</h2>
        <div className="space-y-3">
          {SCENARIOS.map((s) => {
            const open = expanded === s.id;
            return (
              <div key={s.id} className={`glass-card overflow-hidden transition-all ${s.borderColor}`}>
                <button
                  onClick={() => setExpanded(open ? null : s.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className={`font-bold text-base ${s.color}`}>{s.name}</p>
                      <p className="text-keeper-text text-sm mt-0.5">{s.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-2xl font-black ${s.color}`}>{(s.returnRate * 100).toFixed(0)}%</p>
                      <p className="mono-label">avg/yr</p>
                    </div>
                  </div>

                  {/* ETF tags */}
                  <div className="flex gap-2 mb-3">
                    {s.etfs.map((etf) => (
                      <span key={etf} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-keeper-surface/80 border border-keeper-border/60 text-keeper-text">
                        {etf}
                      </span>
                    ))}
                  </div>

                  {/* 10/20/30yr projections */}
                  <div className="grid grid-cols-3 gap-0 border border-keeper-border/60 rounded-xl overflow-hidden">
                    {[10, 20, 30].map((yr, i) => (
                      <div key={yr} className={`p-3 text-center bg-keeper-surface/60 ${i < 2 ? 'border-r border-keeper-border/60' : ''}`}>
                        <p className={`font-black text-base ${s.color}`}>{fmt(project(amount, s.returnRate, yr))}</p>
                        <p className="mono-label">{yr}yr</p>
                      </div>
                    ))}
                  </div>
                </button>

                {open && (
                  <div className="px-5 pb-5 border-t border-keeper-border/50">
                    <div className="pt-4 space-y-2">
                      <h3 className="mono-label mb-3">Full Projection</h3>
                      {[1, 3, 5, 10, 20, 30].map((yr) => (
                        <div key={yr} className="flex items-center justify-between py-2 border-b border-keeper-border/40 last:border-0">
                          <span className="text-keeper-text text-sm">{yr} year{yr !== 1 ? 's' : ''}</span>
                          <span className={`font-bold text-sm ${yr >= 10 ? s.color : 'text-keeper-bright'}`}>
                            {fmt(project(amount, s.returnRate, yr))}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-keeper-muted text-xs mt-4 leading-relaxed">
                      Past performance does not guarantee future results. Educational purposes only — not financial advice.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live ETF prices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-keeper-bright">ETF Prices</h2>
          <span className="mono-label">Demo data</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {ETFS.map((etf) => (
            <div key={etf.ticker} className="glass-card card-hover p-4 shrink-0 w-40">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-keeper-bright text-sm">{etf.ticker}</span>
                <span className={`text-xs font-semibold ${etf.tenYearReturn >= 0 ? 'text-keeper-green' : 'text-keeper-red'}`}>
                  {etf.tenYearReturn >= 0 ? '+' : ''}{(etf.tenYearReturn * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-keeper-muted text-xs mb-2 truncate">{etf.name}</p>
              <p className="font-semibold text-keeper-bright">${etf.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass-card flex items-start gap-3 p-4">
        <Info size={14} className="text-keeper-muted mt-0.5 shrink-0" />
        <p className="text-keeper-muted text-xs leading-relaxed">
          Investment projections use compound monthly growth and are for educational purposes only. Past performance does not guarantee future results. Consult a financial advisor before investing.
        </p>
      </div>
    </div>
  );
}
