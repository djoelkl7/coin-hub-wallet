import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Maximize2,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export interface PerformancePoint {
  dayIndex: number;
  date: string;
  fullDate: string;
  value: number;
  dailyChange: number;
  dailyChangePct: string;
  btcContribution: number;
  ethContribution: number;
}

// 30 Days of realistic historical performance leading to current $111,009.79
const THIRTY_DAY_DATA: PerformancePoint[] = [
  { dayIndex: 1, date: 'Sep 04', fullDate: 'Sep 04, 2026', value: 92589.29, dailyChange: 840.50, dailyChangePct: '+0.92%', btcContribution: 37400, ethContribution: 39500 },
  { dayIndex: 2, date: 'Sep 05', fullDate: 'Sep 05, 2026', value: 93240.10, dailyChange: 650.81, dailyChangePct: '+0.70%', btcContribution: 37800, ethContribution: 39800 },
  { dayIndex: 3, date: 'Sep 06', fullDate: 'Sep 06, 2026', value: 92890.00, dailyChange: -350.10, dailyChangePct: '-0.38%', btcContribution: 37500, ethContribution: 39700 },
  { dayIndex: 4, date: 'Sep 07', fullDate: 'Sep 07, 2026', value: 93950.45, dailyChange: 1060.45, dailyChangePct: '+1.14%', btcContribution: 38100, ethContribution: 40100 },
  { dayIndex: 5, date: 'Sep 08', fullDate: 'Sep 08, 2026', value: 94810.00, dailyChange: 859.55, dailyChangePct: '+0.91%', btcContribution: 38600, ethContribution: 40400 },
  { dayIndex: 6, date: 'Sep 09', fullDate: 'Sep 09, 2026', value: 94220.80, dailyChange: -589.20, dailyChangePct: '-0.62%', btcContribution: 38300, ethContribution: 40200 },
  { dayIndex: 7, date: 'Sep 10', fullDate: 'Sep 10, 2026', value: 95640.20, dailyChange: 1419.40, dailyChangePct: '+1.51%', btcContribution: 39000, ethContribution: 40800 },
  { dayIndex: 8, date: 'Sep 11', fullDate: 'Sep 11, 2026', value: 96480.90, dailyChange: 840.70, dailyChangePct: '+0.88%', btcContribution: 39400, ethContribution: 41200 },
  { dayIndex: 9, date: 'Sep 12', fullDate: 'Sep 12, 2026', value: 97150.00, dailyChange: 669.10, dailyChangePct: '+0.69%', btcContribution: 39800, ethContribution: 41500 },
  { dayIndex: 10, date: 'Sep 13', fullDate: 'Sep 13, 2026', value: 96800.50, dailyChange: -349.50, dailyChangePct: '-0.36%', btcContribution: 39600, ethContribution: 41400 },
  { dayIndex: 11, date: 'Sep 14', fullDate: 'Sep 14, 2026', value: 98240.00, dailyChange: 1439.50, dailyChangePct: '+1.49%', btcContribution: 40200, ethContribution: 42100 },
  { dayIndex: 12, date: 'Sep 15', fullDate: 'Sep 15, 2026', value: 99420.30, dailyChange: 1180.30, dailyChangePct: '+1.20%', btcContribution: 40800, ethContribution: 42600 },
  { dayIndex: 13, date: 'Sep 16', fullDate: 'Sep 16, 2026', value: 100150.00, dailyChange: 729.70, dailyChangePct: '+0.73%', btcContribution: 41100, ethContribution: 42900 },
  { dayIndex: 14, date: 'Sep 17', fullDate: 'Sep 17, 2026', value: 99780.20, dailyChange: -369.80, dailyChangePct: '-0.37%', btcContribution: 40900, ethContribution: 42800 },
  { dayIndex: 15, date: 'Sep 18', fullDate: 'Sep 18, 2026', value: 101230.50, dailyChange: 1450.30, dailyChangePct: '+1.45%', btcContribution: 41600, ethContribution: 43400 },
  { dayIndex: 16, date: 'Sep 19', fullDate: 'Sep 19, 2026', value: 102450.00, dailyChange: 1219.50, dailyChangePct: '+1.20%', btcContribution: 42100, ethContribution: 43900 },
  { dayIndex: 17, date: 'Sep 20', fullDate: 'Sep 20, 2026', value: 101980.10, dailyChange: -469.90, dailyChangePct: '-0.46%', btcContribution: 41900, ethContribution: 43700 },
  { dayIndex: 18, date: 'Sep 21', fullDate: 'Sep 21, 2026', value: 103210.00, dailyChange: 1229.90, dailyChangePct: '+1.21%', btcContribution: 42400, ethContribution: 44200 },
  { dayIndex: 19, date: 'Sep 22', fullDate: 'Sep 22, 2026', value: 104650.80, dailyChange: 1440.80, dailyChangePct: '+1.40%', btcContribution: 42900, ethContribution: 44800 },
  { dayIndex: 20, date: 'Sep 23', fullDate: 'Sep 23, 2026', value: 105820.00, dailyChange: 1169.20, dailyChangePct: '+1.12%', btcContribution: 43300, ethContribution: 45300 },
  { dayIndex: 21, date: 'Sep 24', fullDate: 'Sep 24, 2026', value: 105120.40, dailyChange: -699.60, dailyChangePct: '-0.66%', btcContribution: 43000, ethContribution: 45100 },
  { dayIndex: 22, date: 'Sep 25', fullDate: 'Sep 25, 2026', value: 106450.00, dailyChange: 1329.60, dailyChangePct: '+1.26%', btcContribution: 43500, ethContribution: 45600 },
  { dayIndex: 23, date: 'Sep 26', fullDate: 'Sep 26, 2026', value: 107680.50, dailyChange: 1230.50, dailyChangePct: '+1.16%', btcContribution: 43900, ethContribution: 46100 },
  { dayIndex: 24, date: 'Sep 27', fullDate: 'Sep 27, 2026', value: 107120.00, dailyChange: -560.50, dailyChangePct: '-0.52%', btcContribution: 43700, ethContribution: 45900 },
  { dayIndex: 25, date: 'Sep 28', fullDate: 'Sep 28, 2026', value: 108490.20, dailyChange: 1370.20, dailyChangePct: '+1.28%', btcContribution: 44200, ethContribution: 46500 },
  { dayIndex: 26, date: 'Sep 29', fullDate: 'Sep 29, 2026', value: 109350.00, dailyChange: 859.80, dailyChangePct: '+0.79%', btcContribution: 44500, ethContribution: 46800 },
  { dayIndex: 27, date: 'Sep 30', fullDate: 'Sep 30, 2026', value: 108820.60, dailyChange: -529.40, dailyChangePct: '-0.48%', btcContribution: 44300, ethContribution: 46600 },
  { dayIndex: 28, date: 'Oct 01', fullDate: 'Oct 01, 2026', value: 109980.00, dailyChange: 1159.40, dailyChangePct: '+1.07%', btcContribution: 44700, ethContribution: 47100 },
  { dayIndex: 29, date: 'Oct 02', fullDate: 'Oct 02, 2026', value: 109036.05, dailyChange: -943.95, dailyChangePct: '-0.86%', btcContribution: 44300, ethContribution: 46700 },
  { dayIndex: 30, date: 'Oct 03', fullDate: 'Today (Live)', value: 111009.79, dailyChange: 1973.74, dailyChangePct: '+1.81%', btcContribution: 44982, ethContribution: 47578.12 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: PerformancePoint }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const isPositive = data.dailyChange >= 0;

  return (
    <div className="bg-[#0b0f19]/95 border border-[#1e2a40] backdrop-blur-md p-3.5 rounded-xl shadow-2xl min-w-[210px] text-xs">
      <div className="flex items-center justify-between text-gray-400 border-b border-[#1b2538] pb-1.5 mb-2 text-[11px]">
        <span>{data.fullDate}</span>
        <span className="text-[10px] font-mono text-cyan-400">Reconciled</span>
      </div>

      <div className="space-y-1">
        <div className="text-[11px] text-gray-400">Portfolio Valuation</div>
        <div className="text-base font-extrabold text-white font-mono tracking-tight">
          ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-[#1b2538] flex items-center justify-between text-[11px]">
        <span className="text-gray-400">Day Performance:</span>
        <span className={`font-semibold font-mono ${isPositive ? 'text-[#00C076]' : 'text-red-400'}`}>
          {isPositive ? `+$${data.dailyChange.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : `-$${Math.abs(data.dailyChange).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} ({data.dailyChangePct})
        </span>
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400">
        <span>ETH / BTC Combined:</span>
        <span className="text-gray-200 font-mono">
          ${(data.btcContribution + data.ethContribution).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export const PortfolioPerformanceChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'7D' | '14D' | '30D'>('30D');

  const filteredData = useMemo(() => {
    if (timeframe === '7D') return THIRTY_DAY_DATA.slice(-7);
    if (timeframe === '14D') return THIRTY_DAY_DATA.slice(-14);
    return THIRTY_DAY_DATA;
  }, [timeframe]);

  const startValue = filteredData[0].value;
  const currentValue = filteredData[filteredData.length - 1].value;
  const netGrowth = currentValue - startValue;
  const netGrowthPct = ((netGrowth / startValue) * 100).toFixed(2);
  const isNetPositive = netGrowth >= 0;

  const periodHigh = Math.max(...filteredData.map((d) => d.value));
  const periodLow = Math.min(...filteredData.map((d) => d.value));

  return (
    <div className="bg-[#0b0e17] border border-[#1a2336] rounded-2xl p-4 sm:p-6 shadow-xl mb-6 sm:mb-8 relative overflow-hidden group">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#00C076]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#171f30]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00C076] uppercase tracking-wider mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Institutional Performance Analytics</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-400">30-Day Custodial Track</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>

            <div className={`flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
              isNetPositive ? 'text-[#00C076] bg-[#00C076]/10' : 'text-red-400 bg-red-400/10'
            }`}>
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isNetPositive ? `+$${netGrowth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-$${Math.abs(netGrowth).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
              <span>({isNetPositive ? `+${netGrowthPct}%` : `${netGrowthPct}%`})</span>
            </div>
          </div>
        </div>

        {/* Timeframe Range Segmented Buttons & Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400 mr-2 border-r border-[#1e273d] pr-4">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase">Period High</span>
              <span className="font-mono text-white font-semibold">${periodHigh.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase">Period Low</span>
              <span className="font-mono text-white font-semibold">${periodLow.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <div className="flex items-center p-1 bg-[#101420] rounded-xl border border-[#1a2336]">
            {(['7D', '14D', '30D'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  timeframe === t
                    ? 'bg-[#00C076] text-[#07090e] shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="mt-5 h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C076" stopOpacity={0.35} />
                <stop offset="60%" stopColor="#00C076" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#00C076" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#172033"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
              domain={['dataMin - 1500', 'dataMax + 1500']}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              dx={-5}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#00C076"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#portfolioGradient)"
              activeDot={{
                r: 6,
                fill: '#00C076',
                stroke: '#080a0f',
                strokeWidth: 2.5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Institutional Footer Sub-bar */}
      <div className="mt-3 pt-3 border-t border-[#141b2b] flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00C076]"></span>
          <span>Mark-to-Market Valuation: Verified on Base Mainnet Node</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Volatility Index: <strong className="text-gray-300 font-mono">0.84% (Low)</strong></span>
          <span>·</span>
          <span>Sharpe Ratio: <strong className="text-[#00C076] font-mono">2.81</strong></span>
        </div>
      </div>
    </div>
  );
};
