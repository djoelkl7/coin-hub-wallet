import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import {
  PieChart as PieChartIcon,
  ShieldCheck,
  TrendingUp,
  Percent,
  DollarSign,
  Layers,
  ArrowUpRight,
  Info,
  Sparkles,
} from 'lucide-react';

export interface AssetAllocationItem {
  id: string;
  name: string;
  symbol: string;
  value: number;
  percentage: number;
  holding: string;
  unitPrice: string;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  icon: string;
  change24h: string;
  isPositive: boolean;
  category: string;
  network: string;
}

export const ASSET_ALLOCATION_DATA: AssetAllocationItem[] = [
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    value: 47578.12,
    percentage: 42.86,
    holding: '14.82 ETH',
    unitPrice: '$3,210.40',
    color: '#627EEA',
    gradientStart: '#627EEA',
    gradientEnd: '#465ec4',
    icon: 'Ξ',
    change24h: '+2.4%',
    isPositive: true,
    category: 'Layer 1 Smart Contracts',
    network: 'Ethereum Mainnet',
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    value: 44982.00,
    percentage: 40.52,
    holding: '0.68 BTC',
    unitPrice: '$66,150.00',
    color: '#F7931A',
    gradientStart: '#F7931A',
    gradientEnd: '#d47909',
    icon: '₿',
    change24h: '+1.2%',
    isPositive: true,
    category: 'Digital Gold Reserve',
    network: 'Native SegWit',
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    value: 12940.67,
    percentage: 11.66,
    holding: '12,940.67 USDC',
    unitPrice: '$1.00',
    color: '#2775CA',
    gradientStart: '#2775CA',
    gradientEnd: '#1b5ca3',
    icon: '$',
    change24h: '0.00%',
    isPositive: true,
    category: 'Stable Liquidity',
    network: 'Base / ERC20',
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    value: 5509.00,
    percentage: 4.96,
    holding: '34.2 SOL',
    unitPrice: '$161.08',
    color: '#14F195',
    gradientStart: '#14F195',
    gradientEnd: '#0ebb73',
    icon: 'S',
    change24h: '+3.1%',
    isPositive: true,
    category: 'High-Throughput L1',
    network: 'Solana Cluster',
  },
];

const TOTAL_PORTFOLIO_VALUE = 111009.79;

interface CustomDonutTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: AssetAllocationItem }>;
}

const CustomDonutTooltip: React.FC<CustomDonutTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const asset = payload[0].payload;

  return (
    <div className="bg-[#0b0f19]/95 border border-[#1e2a40] backdrop-blur-md p-3.5 rounded-xl shadow-2xl min-w-[210px] text-xs">
      <div className="flex items-center justify-between border-b border-[#1b2538] pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px]"
            style={{ backgroundColor: `${asset.color}25`, color: asset.color }}
          >
            {asset.icon}
          </div>
          <span className="font-bold text-white">{asset.name}</span>
          <span className="text-[10px] font-mono text-gray-400">({asset.symbol})</span>
        </div>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${asset.color}20`, color: asset.color }}
        >
          {asset.percentage.toFixed(1)}%
        </span>
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between items-center text-gray-400">
          <span>Allocation Value:</span>
          <span className="font-mono font-bold text-white">
            ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center text-gray-400">
          <span>On-Chain Holdings:</span>
          <span className="font-mono text-gray-200">{asset.holding}</span>
        </div>
        <div className="flex justify-between items-center text-gray-400">
          <span>Spot Price:</span>
          <span className="font-mono text-gray-300">{asset.unitPrice}</span>
        </div>
        <div className="flex justify-between items-center text-gray-400 pt-1 border-t border-[#162033]">
          <span>24h Performance:</span>
          <span className="font-mono text-emerald-400 font-semibold">{asset.change24h}</span>
        </div>
      </div>
    </div>
  );
};

export const AssetAllocationDonutChart: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [displayMode, setDisplayMode] = useState<'percentage' | 'usd'>('percentage');

  const activeAsset = activeIndex !== null ? ASSET_ALLOCATION_DATA[activeIndex] : null;

  return (
    <div className="bg-[#0b0f19]/90 border border-[#1e2536] rounded-2xl overflow-hidden mb-8 shadow-xl shadow-black/40 backdrop-blur-md">
      {/* Header Bar */}
      <div className="p-4 sm:p-6 border-b border-[#1b2336] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00C076] bg-[#00C076]/10 px-2 py-0.5 rounded border border-[#00C076]/30">
              ASSET DIVERSIFICATION
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-400 font-mono">Institutional Allocation</span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-[#00C076]" />
            <span>Portfolio Asset Allocation</span>
          </h3>

          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Breakdown across Layer-1 smart contract protocols, store-of-value reserves, and liquid stable reserves.
          </p>
        </div>

        {/* Action Controls & Metrics Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#070b13] border border-[#1a2336] rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setDisplayMode('percentage')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                displayMode === 'percentage'
                  ? 'bg-[#00C076] text-[#07090e] shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Percentage</span>
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('usd')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                displayMode === 'usd'
                  ? 'bg-[#00C076] text-[#07090e] shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>USD Value</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080d17] border border-[#1c273e] text-xs text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-400">Dominant:</span>
            <span className="font-bold text-white font-mono">ETH 42.9%</span>
          </div>
        </div>
      </div>

      {/* Main Content: Donut Chart on Left, Interactive Breakdown on Right */}
      <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
        {/* Left: Recharts Donut Visualizer with Center Stats Enclave */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {ASSET_ALLOCATION_DATA.map((asset) => (
                    <linearGradient
                      key={asset.id}
                      id={`gradient-${asset.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={asset.gradientStart} stopOpacity={1} />
                      <stop offset="100%" stopColor={asset.gradientEnd} stopOpacity={0.85} />
                    </linearGradient>
                  ))}
                </defs>

                <Pie
                  data={ASSET_ALLOCATION_DATA}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={76}
                  outerRadius={112}
                  paddingAngle={4}
                  cornerRadius={6}
                  stroke="#080c14"
                  strokeWidth={3}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {ASSET_ALLOCATION_DATA.map((entry, index) => {
                    const isSelected = activeIndex === index;
                    return (
                      <Cell
                        key={`cell-${entry.id}`}
                        fill={`url(#gradient-${entry.id})`}
                        stroke={isSelected ? '#ffffff' : '#080c14'}
                        strokeWidth={isSelected ? 3 : 2}
                        className="transition-all duration-200 cursor-pointer"
                        style={{
                          filter: isSelected
                            ? `drop-shadow(0 0 12px ${entry.color}80)`
                            : 'none',
                        }}
                      />
                    );
                  })}
                </Pie>

                <Tooltip content={<CustomDonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Enclave Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
              {activeAsset ? (
                <div className="space-y-0.5 animate-in fade-in zoom-in duration-150">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-1"
                    style={{ backgroundColor: `${activeAsset.color}25`, color: activeAsset.color }}
                  >
                    {activeAsset.icon}
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    {activeAsset.name}
                  </div>
                  <div
                    className="text-xl sm:text-2xl font-black font-mono tracking-tight"
                    style={{ color: activeAsset.color }}
                  >
                    {displayMode === 'percentage'
                      ? `${activeAsset.percentage.toFixed(1)}%`
                      : `$${(activeAsset.value / 1000).toFixed(1)}k`}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    ${activeAsset.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Total Portfolio
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                    ${TOTAL_PORTFOLIO_VALUE.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-[#00C076] font-semibold flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>4 Core Assets</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <span className="text-[11px] text-gray-400 mt-2 text-center">
            Hover or tap segments to inspect individual asset weighting
          </span>
        </div>

        {/* Right: Detailed 4-Asset Breakdown Grid */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-3.5">
          {ASSET_ALLOCATION_DATA.map((asset, index) => {
            const isHovered = activeIndex === index;

            return (
              <div
                key={asset.id}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? 'bg-[#121929] border-gray-400/50 shadow-lg shadow-black/40 scale-[1.01]'
                    : 'bg-[#090d16] border-[#1a2336] hover:border-[#283652] hover:bg-[#0e1424]'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Asset Icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border transition-transform duration-200"
                      style={{
                        backgroundColor: `${asset.color}15`,
                        color: asset.color,
                        borderColor: `${asset.color}35`,
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      {asset.icon}
                    </div>

                    {/* Asset Name & Category */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate">{asset.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#141a29] text-gray-300 border border-[#222d42]">
                          {asset.symbol}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-400 truncate mt-0.5">
                        {asset.holding} · {asset.category}
                      </div>
                    </div>
                  </div>

                  {/* Allocation Value & Percentage */}
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-white text-sm">
                      ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span
                        className="text-xs font-mono font-extrabold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${asset.color}20`,
                          color: asset.color,
                        }}
                      >
                        {asset.percentage.toFixed(1)}%
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400">
                        {asset.change24h}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Relative Allocation Visual Progress Bar */}
                <div className="w-full bg-[#05080f] h-2 rounded-full overflow-hidden p-0.5 border border-[#162033]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${asset.percentage}%`,
                      backgroundColor: asset.color,
                      boxShadow: isHovered ? `0 0 8px ${asset.color}80` : 'none',
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Quick Summary Pill Track */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-[#172033] text-gray-400">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#00C076]" />
              <span>Multi-Asset Custody Ratio:</span>
              <span className="font-mono text-gray-200 font-semibold">88.3% Crypto / 11.7% USDC</span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-gray-400">Total Valuation:</span>
              <span className="text-[#00C076] font-bold">$111,009.79 USD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
