import React, { useState } from 'react';
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sliders,
  Sparkles,
  ArrowUpRight,
  Check,
  Copy,
  Layers,
  FileCheck
} from 'lucide-react';

export interface SettlementPayload {
  asset: string;
  symbol: string;
  amount: number;
  usdEquivalent: number;
  recipientAddress: string;
  settlementTier: string;
  clearanceFeeUsd: number;
  timestamp: number;
  txHash: string;
  checksum: string;
}

interface HomeViewProps {
  walletAddress: string;
  availableBalance: string;
  totalPortfolio: string;
  todayPercentage: string;
  onGenerateResult: (payload: SettlementPayload) => void;
  onViewLatestResult: () => void;
  hasExistingResult: boolean;
  onNavigate: (page: string) => void;
}

const ASSET_OPTIONS = [
  { symbol: 'ETH', name: 'Ethereum', rate: 3210.40, available: 14.82, icon: 'Ξ', color: '#627EEA' },
  { symbol: 'BTC', name: 'Bitcoin', rate: 66150.00, available: 0.68, icon: '₿', color: '#F7931A' },
  { symbol: 'USDC', name: 'USD Coin', rate: 1.00, available: 12940.67, icon: '$', color: '#2775CA' },
  { symbol: 'SOL', name: 'Solana', rate: 161.08, available: 34.2, icon: 'S', color: '#14F195' },
];

const SETTLEMENT_TIERS = [
  { id: 'instant', name: 'Instant Flash Settlement', feeRate: 0.008, speed: '< 15 seconds', badge: 'Fastest' },
  { id: 'standard', name: 'Standard Clearance', feeRate: 0.003, speed: '~ 2 minutes', badge: 'Standard' },
  { id: 'audit', name: 'Tier-1 Priority Audit', feeRate: 0.012, speed: '< 45 seconds', badge: 'Insured' },
];

export const HomeView: React.FC<HomeViewProps> = ({
  walletAddress,
  availableBalance,
  totalPortfolio,
  todayPercentage,
  onGenerateResult,
  onViewLatestResult,
  hasExistingResult,
  onNavigate,
}) => {
  const [selectedAsset, setSelectedAsset] = useState(ASSET_OPTIONS[0]);
  const [amount, setAmount] = useState<string>('2.5');
  const [selectedTier, setSelectedTier] = useState(SETTLEMENT_TIERS[0]);
  const [recipient, setRecipient] = useState<string>(walletAddress);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const usdValue = numAmount * selectedAsset.rate;
  const clearanceFee = usdValue * selectedTier.feeRate;
  const netUsdValue = Math.max(0, usdValue - clearanceFee);

  const handleSetMax = () => {
    setAmount(selectedAsset.available.toString());
  };

  const handleSetPercent = (pct: number) => {
    const val = (selectedAsset.available * pct) / 100;
    setAmount(val.toFixed(4));
  };

  const handleCopyWallet = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    setIsCalculating(true);

    setTimeout(() => {
      // Generate unique hash & payload
      const txHash = '0x' + Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      const checksum = Math.random().toString(16).substring(2, 10);

      const payload: SettlementPayload = {
        asset: selectedAsset.name,
        symbol: selectedAsset.symbol,
        amount: numAmount,
        usdEquivalent: usdValue,
        recipientAddress: recipient || walletAddress,
        settlementTier: selectedTier.name,
        clearanceFeeUsd: clearanceFee,
        timestamp: Date.now(),
        txHash,
        checksum,
      };

      setIsCalculating(false);
      onGenerateResult(payload);
    }, 400);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Home Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0d1322] via-[#0f172a] to-[#0b101d] border border-[#1f293d] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>Home Route: / · Flask template: home.html</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Cryptographic Settlement & Liquidity Portal
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
              Initiate on-chain asset clearance or simulate execution to render real-time verification results.
              Form submissions transition seamlessly to the <code className="text-cyan-400 font-mono bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">/result</code> route.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#14151a] hover:bg-[#1d1f27] border border-[#2b3140] text-gray-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Full Portfolio (Dashboard)</span>
            </button>
            {hasExistingResult && (
              <button
                type="button"
                onClick={onViewLatestResult}
                className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#172033] hover:bg-[#1f2b45] text-cyan-300 border border-cyan-500/30 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>View Latest Result</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        <div className="bg-[#0c1017] border border-[#1b2234] rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 flex items-center justify-between">
            <span>Total Valuation</span>
            <Wallet className="w-4 h-4 text-[#0052FF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            {totalPortfolio}
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{todayPercentage} 24h market growth</span>
          </div>
        </div>

        <div className="bg-[#0c1017] border border-[#1b2234] rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 flex items-center justify-between">
            <span>Available for Settlement</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-cyan-300 tracking-tight mt-1">
            {availableBalance}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Ready for instant dispatch & liquidity verification
          </div>
        </div>

        <div className="bg-[#0c1017] border border-[#1b2234] rounded-2xl p-4 sm:p-5 shadow-lg sm:col-span-2 lg:col-span-1">
          <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 flex items-center justify-between">
            <span>Authorized Wallet</span>
            <button
              onClick={handleCopyWallet}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              title="Copy wallet address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-xs font-mono text-gray-200 mt-2 break-all bg-[#121622] p-2.5 rounded-lg border border-[#1e2536] select-all">
            {walletAddress}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AUREON-AUTH-V1 Handshake Validated</span>
          </div>
        </div>
      </div>

      {/* Main Form: Home Interactive Settlement Generator */}
      <div className="bg-[#0c1017] border border-[#1b2438] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 sm:pb-6 border-b border-[#1a2336] gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-400" />
              <span>Initiate Settlement / Clearance Simulation</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Configure parameters to generate an audited transaction result receipt at <span className="font-mono text-cyan-300">/result</span>
            </p>
          </div>
          <span className="text-xs font-mono text-gray-400 bg-[#141926] px-3 py-1.5 rounded-lg border border-[#20293d] self-start sm:self-auto">
            POST / → GET /result
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Asset Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              1. Select Digital Asset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ASSET_OPTIONS.map((asset) => {
                const isSelected = selectedAsset.symbol === asset.symbol;
                return (
                  <button
                    key={asset.symbol}
                    type="button"
                    onClick={() => {
                      setSelectedAsset(asset);
                      setAmount((asset.available * 0.25).toFixed(4));
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#131b2e] border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-[#101420] border-[#1f283d] hover:border-[#2f3d5c] text-gray-300'
                    }`}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ backgroundColor: `${asset.color}20`, color: asset.color, border: `1px solid ${asset.color}40` }}
                    >
                      {asset.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{asset.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono truncate">
                        {asset.available} {asset.symbol}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                2. Settlement Amount ({selectedAsset.symbol})
              </label>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleSetPercent(25)}
                  className="px-2 py-0.5 bg-[#171d2c] hover:bg-[#20293d] text-gray-300 rounded text-[11px] font-medium"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPercent(50)}
                  className="px-2 py-0.5 bg-[#171d2c] hover:bg-[#20293d] text-gray-300 rounded text-[11px] font-medium"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="px-2 py-0.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-[11px] font-semibold"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.0001"
                max={selectedAsset.available}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#20293d] focus:border-blue-500 focus:outline-none rounded-xl px-4 py-3.5 text-white font-mono text-base pr-20 sm:pr-36 transition-colors"
                placeholder="0.00"
                required
              />
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2 pointer-events-none">
                <span className="text-xs font-bold text-gray-300">{selectedAsset.symbol}</span>
                <span className="hidden sm:inline text-xs text-gray-500">·</span>
                <span className="hidden sm:inline text-xs font-mono text-emerald-400">
                  ≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="sm:hidden text-right text-[11px] font-mono text-emerald-400 mt-1">
              ≈ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </div>
          </div>

          {/* Settlement Speed Tier */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              3. Clearance Tier & Network Guarantee
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SETTLEMENT_TIERS.map((tier) => {
                const isSelected = selectedTier.id === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#121c33] border-blue-500 ring-1 ring-blue-500/50'
                        : 'bg-[#101420] border-[#1e273a] hover:border-[#2d3a54]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">{tier.name}</span>
                      <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        {tier.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center justify-between">
                      <span>Rate: {(tier.feeRate * 100).toFixed(2)}%</span>
                      <span className="font-mono text-gray-300">{tier.speed}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destination Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              4. Recipient Destination Wallet
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-[#0a0d14] border border-[#20293d] focus:border-blue-500 focus:outline-none rounded-xl px-4 py-3 text-xs font-mono text-gray-200 transition-colors"
              placeholder="0x..."
              required
            />
          </div>

          {/* Calculation Overview Box */}
          <div className="bg-[#080b11] border border-[#1a2336] rounded-xl p-4.5 space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-gray-400">
              <span>Gross Clearance Value:</span>
              <span className="font-mono text-white">
                ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>Estimated Clearance Fee ({(selectedTier.feeRate * 100).toFixed(2)}%):</span>
              <span className="font-mono text-cyan-400">
                -${clearanceFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
            <div className="pt-2 border-t border-[#182133] flex justify-between items-center font-bold">
              <span className="text-gray-200">Net Estimated Settlement:</span>
              <span className="font-mono text-emerald-400 text-sm">
                ${netUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isCalculating || numAmount <= 0}
              className="w-full sm:flex-1 py-3.5 px-6 bg-gradient-to-r from-[#0052FF] to-[#0066ff] hover:from-[#0047e0] hover:to-[#0055e0] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isCalculating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Clearance Calculation...</span>
                </>
              ) : (
                <>
                  <span>Process Clearance & View Result (/result)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate('paytowithdraw')}
              className="w-full sm:w-auto px-5 py-3.5 bg-[#141824] hover:bg-[#1b2133] border border-[#222d42] text-gray-300 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Clearance Rules Notice</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
