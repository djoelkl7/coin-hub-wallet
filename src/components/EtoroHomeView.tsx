import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Users,
  Shield,
  Zap,
  Award,
  ChevronRight,
  Sliders,
  DollarSign,
  BarChart3,
  Globe,
  PieChart,
  ArrowRight,
  Layers,
  Sparkles,
  Lock,
  CheckCircle2,
  X,
  RefreshCw,
  Clock,
  Eye,
  Percent,
  Check
} from 'lucide-react';

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  marketCap: string;
  volume24h: string;
  category: 'layer1' | 'defi' | 'ai' | 'meme' | 'staking';
  sentimentBuy: number; // e.g. 84 for 84% buyers
  sparkline: number[];
  icon: string;
  color: string;
}

export interface PopularInvestor {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  gain12m: number;
  riskScore: number;
  copiers: number;
  profitableWeeks: number;
  strategy: string;
  topHoldings: string[];
}

export interface SmartPortfolio {
  id: string;
  name: string;
  category: string;
  return1y: number;
  riskScore: number;
  assets: { symbol: string; allocation: number; color: string }[];
  description: string;
}

const INITIAL_ASSETS: CryptoAsset[] = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 66420.50,
    change24h: 2.84,
    high24h: 67150.00,
    low24h: 64890.00,
    marketCap: '$1.31T',
    volume24h: '$32.4B',
    category: 'layer1',
    sentimentBuy: 88,
    sparkline: [64800, 65200, 65100, 65800, 65400, 66100, 66420],
    icon: '₿',
    color: '#F7931A'
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3245.80,
    change24h: 3.42,
    high24h: 3280.00,
    low24h: 3120.00,
    marketCap: '$389.2B',
    volume24h: '$18.7B',
    category: 'layer1',
    sentimentBuy: 84,
    sparkline: [3120, 3150, 3180, 3160, 3210, 3230, 3245],
    icon: 'Ξ',
    color: '#627EEA'
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    price: 164.30,
    change24h: 5.18,
    high24h: 168.00,
    low24h: 154.50,
    marketCap: '$76.8B',
    volume24h: '$6.2B',
    category: 'layer1',
    sentimentBuy: 91,
    sparkline: [154, 157, 159, 158, 161, 163, 164.3],
    icon: 'S',
    color: '#14F195'
  },
  {
    id: 'xrp',
    symbol: 'XRP',
    name: 'XRP Ledger',
    price: 0.589,
    change24h: -0.85,
    high24h: 0.602,
    low24h: 0.578,
    marketCap: '$33.1B',
    volume24h: '$1.4B',
    category: 'layer1',
    sentimentBuy: 69,
    sparkline: [0.598, 0.595, 0.592, 0.588, 0.591, 0.586, 0.589],
    icon: '✕',
    color: '#23292F'
  },
  {
    id: 'doge',
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: 0.144,
    change24h: 7.25,
    high24h: 0.149,
    low24h: 0.132,
    marketCap: '$20.8B',
    volume24h: '$2.1B',
    category: 'meme',
    sentimentBuy: 78,
    sparkline: [0.133, 0.135, 0.138, 0.137, 0.141, 0.143, 0.144],
    icon: 'Ð',
    color: '#C2A633'
  },
  {
    id: 'avax',
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 28.75,
    change24h: 4.12,
    high24h: 29.40,
    low24h: 27.20,
    marketCap: '$11.4B',
    volume24h: '$840M',
    category: 'layer1',
    sentimentBuy: 82,
    sparkline: [27.2, 27.8, 27.6, 28.1, 28.3, 28.5, 28.75],
    icon: 'A',
    color: '#E84142'
  },
  {
    id: 'link',
    symbol: 'LINK',
    name: 'Chainlink',
    price: 13.15,
    change24h: 1.82,
    high24h: 13.40,
    low24h: 12.80,
    marketCap: '$7.9B',
    volume24h: '$490M',
    category: 'defi',
    sentimentBuy: 77,
    sparkline: [12.8, 12.9, 13.0, 12.95, 13.1, 13.12, 13.15],
    icon: '⬡',
    color: '#375BD2'
  },
  {
    id: 'tao',
    symbol: 'TAO',
    name: 'Bittensor',
    price: 542.20,
    change24h: 8.94,
    high24h: 558.00,
    low24h: 492.00,
    marketCap: '$4.1B',
    volume24h: '$310M',
    category: 'ai',
    sentimentBuy: 94,
    sparkline: [495, 510, 505, 525, 532, 538, 542.2],
    icon: 'τ',
    color: '#2DD4BF'
  },
  {
    id: 'aave',
    symbol: 'AAVE',
    name: 'Aave',
    price: 158.40,
    change24h: 6.31,
    high24h: 162.00,
    low24h: 147.50,
    marketCap: '$2.3B',
    volume24h: '$280M',
    category: 'defi',
    sentimentBuy: 86,
    sparkline: [148, 151, 153, 152, 156, 157, 158.4],
    icon: '👻',
    color: '#B6509E'
  },
  {
    id: 'sui',
    symbol: 'SUI',
    name: 'Sui Network',
    price: 1.96,
    change24h: 11.45,
    high24h: 2.04,
    low24h: 1.72,
    marketCap: '$5.4B',
    volume24h: '$920M',
    category: 'layer1',
    sentimentBuy: 92,
    sparkline: [1.74, 1.79, 1.82, 1.85, 1.91, 1.94, 1.96],
    icon: '💧',
    color: '#4CA2FF'
  },
  {
    id: 'near',
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    price: 5.12,
    change24h: 4.80,
    high24h: 5.30,
    low24h: 4.85,
    marketCap: '$6.2B',
    volume24h: '$410M',
    category: 'ai',
    sentimentBuy: 81,
    sparkline: [4.88, 4.95, 4.98, 5.02, 5.08, 5.10, 5.12],
    icon: 'N',
    color: '#000000'
  },
  {
    id: 'rndr',
    symbol: 'RENDER',
    name: 'Render Network',
    price: 6.45,
    change24h: 5.90,
    high24h: 6.70,
    low24h: 6.05,
    marketCap: '$3.3B',
    volume24h: '$290M',
    category: 'ai',
    sentimentBuy: 89,
    sparkline: [6.08, 6.18, 6.22, 6.30, 6.38, 6.42, 6.45],
    icon: 'R',
    color: '#E53E3E'
  }
];

const POPULAR_INVESTORS: PopularInvestor[] = [
  {
    id: 'inv-1',
    name: 'Alex Vance',
    handle: '@CryptoQuantAlpha',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    gain12m: 84.6,
    riskScore: 3,
    copiers: 18450,
    profitableWeeks: 89.2,
    strategy: 'Quantitative momentum across Tier-1 Layer-1s and DeFi liquidity staking.',
    topHoldings: ['BTC', 'ETH', 'SOL']
  },
  {
    id: 'inv-2',
    name: 'Elena Rostova',
    handle: '@DeFiMomentum',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    gain12m: 112.4,
    riskScore: 4,
    copiers: 14210,
    profitableWeeks: 86.5,
    strategy: 'Decentralized lending yield optimization, automated rebalancing, and Aave/Link alpha.',
    topHoldings: ['ETH', 'AAVE', 'LINK']
  },
  {
    id: 'inv-3',
    name: 'Marcus Chen',
    handle: '@Layer1Macro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    gain12m: 68.9,
    riskScore: 2,
    copiers: 9840,
    profitableWeeks: 92.1,
    strategy: 'Macro institutional crypto allocation with low volatility drawdowns.',
    topHoldings: ['BTC', 'ETH', 'SOL']
  },
  {
    id: 'inv-4',
    name: 'Sarah Jenkins',
    handle: '@AIWeb3Yields',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    gain12m: 95.3,
    riskScore: 4,
    copiers: 12690,
    profitableWeeks: 84.8,
    strategy: 'Decentralized AI compute tokens (Bittensor, Render) coupled with high-speed L1 networks.',
    topHoldings: ['TAO', 'RENDER', 'SOL']
  }
];

const SMART_PORTFOLIOS: SmartPortfolio[] = [
  {
    id: 'sp-1',
    name: 'CryptoEqual Top 10',
    category: 'Core Multi-Asset',
    return1y: 72.4,
    riskScore: 3,
    assets: [
      { symbol: 'BTC', allocation: 35, color: '#F7931A' },
      { symbol: 'ETH', allocation: 30, color: '#627EEA' },
      { symbol: 'SOL', allocation: 20, color: '#14F195' },
      { symbol: 'Others', allocation: 15, color: '#00C076' }
    ],
    description: 'Equally weighted algorithmic bundle tracking the largest blue-chip cryptocurrency networks.'
  },
  {
    id: 'sp-2',
    name: 'DeFi Pioneers',
    category: 'Decentralized Finance',
    return1y: 58.2,
    riskScore: 4,
    assets: [
      { symbol: 'AAVE', allocation: 35, color: '#B6509E' },
      { symbol: 'LINK', allocation: 35, color: '#375BD2' },
      { symbol: 'UNI', allocation: 30, color: '#FF007A' }
    ],
    description: 'Direct exposure to dominant liquidity protocols, automated market makers, and oracle networks.'
  },
  {
    id: 'sp-3',
    name: 'AI & Web3 Compute',
    category: 'High-Growth Tech',
    return1y: 124.8,
    riskScore: 5,
    assets: [
      { symbol: 'TAO', allocation: 40, color: '#2DD4BF' },
      { symbol: 'RENDER', allocation: 35, color: '#E53E3E' },
      { symbol: 'NEAR', allocation: 25, color: '#6366F1' }
    ],
    description: 'Next-generation machine intelligence protocols, decentralized GPU compute, and data layers.'
  }
];

interface EtoroHomeViewProps {
  onOpenPortal: () => void;
  onTradeAsset?: (asset: CryptoAsset, action: 'buy' | 'sell') => void;
}

export const EtoroHomeView: React.FC<EtoroHomeViewProps> = ({
  onOpenPortal,
}) => {
  const [assets, setAssets] = useState<CryptoAsset[]>(INITIAL_ASSETS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Interactive Trade Modal State
  const [tradeModalAsset, setTradeModalAsset] = useState<CryptoAsset | null>(null);
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [tradeAmountUsd, setTradeAmountUsd] = useState<string>('500');
  const [tradeOrderType, setTradeOrderType] = useState<'market' | 'limit'>('market');
  const [tradeLeverage, setTradeLeverage] = useState<number>(1);
  const [isExecutingTrade, setIsExecutingTrade] = useState<boolean>(false);
  const [tradeSuccessToast, setTradeSuccessToast] = useState<{
    show: boolean;
    asset: string;
    amount: string;
    action: string;
  } | null>(null);

  // Interactive CopyTrader Modal State
  const [copyingInvestor, setCopyingInvestor] = useState<PopularInvestor | null>(null);
  const [copyAllocationUsd, setCopyAllocationUsd] = useState<string>('2000');
  const [copyStopLossPercent, setCopyStopLossPercent] = useState<number>(15);
  const [copySuccessToast, setCopySuccessToast] = useState<string | null>(null);

  // Market Sentiment Vote
  const [userVote, setUserVote] = useState<'bullish' | 'bearish' | null>(null);
  const [sentimentStats, setSentimentStats] = useState({ bullish: 74, bearish: 26 });

  // Simulate subtle real-time price ticks for financial realism
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prev) =>
        prev.map((asset) => {
          // 30% chance each coin ticks slightly
          if (Math.random() > 0.4) return asset;
          const deltaPct = (Math.random() * 0.4 - 0.18) / 100;
          const newPrice = Math.max(0.01, asset.price * (1 + deltaPct));
          const newChange = Number((asset.change24h + deltaPct * 10).toFixed(2));
          return {
            ...asset,
            price: Number(newPrice.toFixed(asset.price < 1 ? 4 : 2)),
            change24h: newChange
          };
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'gainers') return asset.change24h > 4;
      if (selectedCategory === 'trending') return ['btc', 'eth', 'sol', 'sui', 'tao'].includes(asset.id);
      return asset.category === selectedCategory;
    });
  }, [assets, searchQuery, selectedCategory]);

  const handleOpenTrade = (asset: CryptoAsset, action: 'buy' | 'sell') => {
    setTradeModalAsset(asset);
    setTradeAction(action);
    setTradeAmountUsd('500');
    setTradeLeverage(1);
    setTradeOrderType('market');
  };

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeModalAsset) return;
    setIsExecutingTrade(true);

    setTimeout(() => {
      setIsExecutingTrade(false);
      const executedAsset = tradeModalAsset.symbol;
      const executedAmount = `$${parseFloat(tradeAmountUsd).toLocaleString()}`;
      const executedAction = tradeAction.toUpperCase();
      setTradeModalAsset(null);

      setTradeSuccessToast({
        show: true,
        asset: executedAsset,
        amount: executedAmount,
        action: executedAction,
      });

      setTimeout(() => {
        setTradeSuccessToast(null);
      }, 4000);
    }, 800);
  };

  const handleExecuteCopy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copyingInvestor) return;

    setCopySuccessToast(`Successfully mirroring ${copyingInvestor.name} with $${parseFloat(copyAllocationUsd).toLocaleString()} allocation!`);
    setCopyingInvestor(null);

    setTimeout(() => {
      setCopySuccessToast(null);
    }, 4000);
  };

  const handleVoteSentiment = (vote: 'bullish' | 'bearish') => {
    if (userVote) return;
    setUserVote(vote);
    if (vote === 'bullish') {
      setSentimentStats((prev) => ({
        bullish: prev.bullish + 1,
        bearish: Math.max(1, prev.bearish - 1)
      }));
    } else {
      setSentimentStats((prev) => ({
        bullish: Math.max(1, prev.bullish - 1),
        bearish: prev.bearish + 1
      }));
    }
  };

  // Sparkline mini SVG renderer
  const renderSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 28;

    const pathD = points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * (height - 4) - 2;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    const strokeColor = isPositive ? '#00C076' : '#FF4A68';

    return (
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-12 sm:space-y-16 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {tradeSuccessToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#10141f] border border-[#00C076]/40 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <div className="w-8 h-8 rounded-full bg-[#00C076]/20 flex items-center justify-center text-[#00C076]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Order Executed Successfully</div>
            <div className="text-xs text-gray-300">
              {tradeSuccessToast.action} {tradeSuccessToast.amount} of {tradeSuccessToast.asset} on Zephyr Ledger
            </div>
          </div>
        </div>
      )}

      {copySuccessToast && (
        <div className="fixed top-20 right-4 z-50 bg-[#10141f] border border-[#00C076]/40 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <div className="w-8 h-8 rounded-full bg-[#00C076]/20 flex items-center justify-center text-[#00C076]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">CopyTrader™ Activated</div>
            <div className="text-xs text-gray-300">{copySuccessToast}</div>
          </div>
        </div>
      )}

      {/* 1. HERO SECTION (eToro Style) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0c101a] via-[#090c14] to-[#07090e] border border-[#1a2233] rounded-3xl p-6 sm:p-10 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-[#00C076]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          {/* Eyebrow kicker */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#00C076] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#00C076] animate-pulse"></span>
            <span>NEXT-GEN CRYPTO & SOCIAL INVESTING</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-400">ZEPHYR LEDGER ECOSYSTEM</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Invest in Crypto with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C076] via-emerald-300 to-teal-200">Confidence</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-gray-300 mt-4 max-w-2xl leading-relaxed">
            Trade 100+ cryptocurrencies with transparent pricing, mirror top crypto strategists with CopyTrader™, and manage your portfolio with institutional cold storage security.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-8">
            <button
              type="button"
              onClick={() => {
                const tableElem = document.getElementById('markets-table');
                tableElem?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-[#00C076] hover:bg-[#00a868] text-[#07090e] font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#00C076]/25 flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Crypto Markets</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                const copyElem = document.getElementById('copytrader-section');
                copyElem?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3.5 bg-[#141926] hover:bg-[#1a2233] text-gray-200 hover:text-white font-semibold text-sm rounded-xl border border-[#232d42] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#00C076]" />
              <span>Explore CopyTrader™</span>
            </button>

            <button
              type="button"
              onClick={onOpenPortal}
              className="px-4 py-3.5 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Access settlement portal and portfolio dashboard"
            >
              <span>Enter Settlement Dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* eToro Key Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 mt-10 border-t border-[#1b2436] text-xs">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">30M+</div>
              <div className="text-gray-400 mt-0.5">Registered Global Traders</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">$14.8B+</div>
              <div className="text-gray-400 mt-0.5">Quarterly Crypto Volume</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-[#00C076]">0%</div>
              <div className="text-gray-400 mt-0.5">Deposit Fees on Crypto</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white">98%</div>
              <div className="text-gray-400 mt-0.5">Air-Gapped Cold Storage</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME CRYPTO TICKER CARDS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Popular Cryptocurrencies</h2>
            <p className="text-xs text-gray-400">Live prices, 24h trends, and instant buy/sell access</p>
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse"></span>
            <span>Live Ticker Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {assets.slice(0, 4).map((coin) => {
            const isPositive = coin.change24h >= 0;
            return (
              <div
                key={coin.id}
                className="bg-[#0e121c] border border-[#1a2336] hover:border-[#00C076]/40 rounded-2xl p-5 transition-all duration-200 group relative overflow-hidden shadow-lg shadow-black/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-white/10"
                      style={{ backgroundColor: `${coin.color}20`, color: coin.color }}
                    >
                      {coin.icon}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm leading-tight group-hover:text-[#00C076] transition-colors">
                        {coin.name}
                      </div>
                      <div className="text-[11px] text-gray-400">{coin.symbol}</div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-[#00C076]' : 'text-red-400'}`}>
                    {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    <span>{isPositive ? `+${coin.change24h}%` : `${coin.change24h}%`}</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <div className="text-2xl font-extrabold text-white tracking-tight">
                    ${coin.price >= 1 ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : coin.price}
                  </div>
                  <div>
                    {renderSparkline(coin.sparkline, isPositive)}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#171f30] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenTrade(coin, 'buy')}
                    className="flex-1 py-1.5 bg-[#00C076]/15 hover:bg-[#00C076] text-[#00C076] hover:text-[#07090e] font-semibold text-xs rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenTrade(coin, 'sell')}
                    className="flex-1 py-1.5 bg-[#171f30] hover:bg-[#202b40] text-gray-300 hover:text-white font-medium text-xs rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Sell
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. EXPLORE CRYPTO MARKETS TABLE (eToro Core Scanner) */}
      <section id="markets-table" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Explore Crypto Markets</h2>
            <p className="text-xs text-gray-400 mt-0.5">Real-time quotes, 24h market ranges, and community sentiments</p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crypto or symbol..."
              className="w-full pl-9 pr-4 py-2 bg-[#0e121c] border border-[#1a2336] focus:border-[#00C076] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-hidden transition-colors"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All Crypto' },
            { id: 'gainers', label: 'Top Gainers' },
            { id: 'trending', label: 'Trending' },
            { id: 'layer1', label: 'Layer 1 & 2' },
            { id: 'defi', label: 'DeFi' },
            { id: 'ai', label: 'AI & Big Data' },
            { id: 'meme', label: 'Meme' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#00C076] text-[#07090e] font-bold'
                  : 'bg-[#101420] text-gray-400 hover:text-white hover:bg-[#161c2c]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Markets Table */}
        <div className="bg-[#0e121c] border border-[#1a2336] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b0e17] text-gray-400 border-b border-[#171f30] font-medium">
                <tr>
                  <th className="py-3.5 px-4">Asset</th>
                  <th className="py-3.5 px-4 text-right">Price</th>
                  <th className="py-3.5 px-4 text-right">24h Change</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">24h Range</th>
                  <th className="py-3.5 px-4 text-right hidden lg:table-cell">Market Cap</th>
                  <th className="py-3.5 px-4 text-right hidden sm:table-cell">Volume (24h)</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Sentiment</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151c2c]">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      No cryptocurrency found matching "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => {
                    const isPositive = asset.change24h >= 0;
                    const rangePercent = Math.min(
                      100,
                      Math.max(
                        0,
                        ((asset.price - asset.low24h) / (asset.high24h - asset.low24h || 1)) * 100
                      )
                    );

                    return (
                      <tr key={asset.id} className="hover:bg-[#121724] transition-colors group">
                        {/* Asset Name & Icon */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                              style={{ backgroundColor: `${asset.color}20`, color: asset.color }}
                            >
                              {asset.icon}
                            </div>
                            <div>
                              <div className="font-semibold text-white group-hover:text-[#00C076] transition-colors">
                                {asset.name}
                              </div>
                              <div className="text-[11px] text-gray-400">{asset.symbol}</div>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 text-right font-semibold text-white font-mono">
                          ${asset.price >= 1 ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : asset.price}
                        </td>

                        {/* 24h Change */}
                        <td className="py-3.5 px-4 text-right font-semibold font-mono">
                          <span className={isPositive ? 'text-[#00C076]' : 'text-red-400'}>
                            {isPositive ? `+${asset.change24h}%` : `${asset.change24h}%`}
                          </span>
                        </td>

                        {/* 24h Range Bar */}
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <div className="w-32 space-y-1">
                            <div className="flex justify-between text-[10px] text-gray-500">
                              <span>${asset.low24h >= 1 ? asset.low24h.toLocaleString() : asset.low24h}</span>
                              <span>${asset.high24h >= 1 ? asset.high24h.toLocaleString() : asset.high24h}</span>
                            </div>
                            <div className="h-1.5 bg-[#171f30] rounded-full overflow-hidden relative">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-[#00C076] rounded-full"
                                style={{ width: `${rangePercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Market Cap */}
                        <td className="py-3.5 px-4 text-right text-gray-300 font-mono hidden lg:table-cell">
                          {asset.marketCap}
                        </td>

                        {/* Volume */}
                        <td className="py-3.5 px-4 text-right text-gray-300 font-mono hidden sm:table-cell">
                          {asset.volume24h}
                        </td>

                        {/* Market Sentiment */}
                        <td className="py-3.5 px-4 hidden lg:table-cell">
                          <div className="w-24">
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-[#00C076] font-medium">{asset.sentimentBuy}% Buy</span>
                              <span className="text-gray-400">{100 - asset.sentimentBuy}% Sell</span>
                            </div>
                            <div className="h-1.5 w-full bg-red-500/50 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#00C076]"
                                style={{ width: `${asset.sentimentBuy}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenTrade(asset, 'buy')}
                              className="px-2.5 py-1 bg-[#00C076] hover:bg-[#00a868] text-[#07090e] font-bold rounded-md transition-colors cursor-pointer text-[11px]"
                            >
                              Buy
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenTrade(asset, 'sell')}
                              className="px-2.5 py-1 bg-[#171f30] hover:bg-[#222c42] text-gray-300 hover:text-white rounded-md transition-colors cursor-pointer text-[11px]"
                            >
                              Sell
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. eTORO SIGNATURE COPYTRADER™ SHOWCASE */}
      <section id="copytrader-section" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-mono text-[#00C076] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>CopyTrader™ Technology</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Copy Top Crypto Investors Automatically
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
              No management fees. When verified pro investors trade Bitcoin, Ethereum, or high-conviction altcoins, your account mirrors their positions in real time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_INVESTORS.map((inv) => (
            <div
              key={inv.id}
              className="bg-[#0e121c] border border-[#1a2336] hover:border-[#00C076]/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-lg shadow-black/20"
            >
              <div>
                {/* Investor Header */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={inv.avatar}
                    alt={inv.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#00C076]/30 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm">{inv.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00C076]" />
                    </div>
                    <div className="text-[11px] text-gray-400">{inv.handle}</div>
                  </div>
                </div>

                {/* 12M Return & Risk */}
                <div className="bg-[#080b12] rounded-xl p-3 mb-4 border border-[#161d2d] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">12M Return</div>
                    <div className="text-xl font-extrabold text-[#00C076] font-mono">
                      +{inv.gain12m}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Risk Score</div>
                    <div className="text-sm font-bold text-amber-400 font-mono">
                      {inv.riskScore} / 10
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-4 line-clamp-2">
                  {inv.strategy}
                </p>

                {/* Copiers & Holdings */}
                <div className="text-[11px] text-gray-400 space-y-1.5 mb-4">
                  <div className="flex justify-between">
                    <span>Active Copiers:</span>
                    <span className="text-white font-medium">{inv.copiers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profitable Weeks:</span>
                    <span className="text-emerald-400 font-medium">{inv.profitableWeeks}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Top Holdings:</span>
                    <span className="text-gray-300 font-mono">{inv.topHoldings.join(' · ')}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCopyingInvestor(inv)}
                className="w-full py-2.5 bg-[#00C076] hover:bg-[#00a868] text-[#07090e] font-bold text-xs rounded-xl transition-all shadow-md shadow-[#00C076]/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Copy Trader</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SMART CRYPTO PORTFOLIOS (Curated Thematic Baskets) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono text-[#00C076] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5" />
              <span>Smart Portfolios</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Thematic Crypto Baskets
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Curated collections of cryptocurrencies balanced for long-term growth and sector focus.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SMART_PORTFOLIOS.map((portfolio) => (
            <div
              key={portfolio.id}
              className="bg-[#0e121c] border border-[#1a2336] hover:border-[#00C076]/30 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400 font-medium">{portfolio.category}</span>
                  <span className="text-xs font-mono text-[#00C076] font-bold">+{portfolio.return1y}% 1Y</span>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                  {portfolio.name}
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed mb-6">
                  {portfolio.description}
                </p>

                {/* Asset Allocation Breakdown Bar */}
                <div className="space-y-2 mb-6">
                  <div className="text-[11px] text-gray-400 flex justify-between">
                    <span>Portfolio Weighting</span>
                    <span>Risk: {portfolio.riskScore}/10</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#171f30] rounded-full overflow-hidden flex">
                    {portfolio.assets.map((ast, i) => (
                      <div
                        key={i}
                        className="h-full"
                        style={{ width: `${ast.allocation}%`, backgroundColor: ast.color }}
                        title={`${ast.symbol}: ${ast.allocation}%`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 pt-1">
                    {portfolio.assets.map((ast, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ast.color }} />
                        <span>{ast.symbol} ({ast.allocation}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenPortal()}
                className="w-full py-2.5 bg-[#141a29] hover:bg-[#1a2338] text-white font-semibold text-xs rounded-xl border border-[#242f47] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Allocate in Portfolio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 6. MARKET SENTIMENT & SOCIAL COMMUNITY GAUGE */}
      <section className="bg-gradient-to-r from-[#0c101a] to-[#0a0e17] border border-[#1a2336] rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="text-xs font-mono text-[#00C076] uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Real-Time Market Sentiment</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Zephyr Community Market Outlook: <span className="text-[#00C076]">Greed (Index 68)</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
              Based on on-chain volume, social sentiment algorithms, and millions of active Zephyr Ledger participant orders. Cast your vote below to see community consensus.
            </p>

            {/* Voting Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleVoteSentiment('bullish')}
                disabled={userVote !== null}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userVote === 'bullish'
                    ? 'bg-[#00C076] text-black shadow-lg shadow-[#00C076]/30'
                    : 'bg-[#00C076]/15 hover:bg-[#00C076]/30 text-[#00C076]'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Bullish ({sentimentStats.bullish}%)</span>
              </button>

              <button
                type="button"
                onClick={() => handleVoteSentiment('bearish')}
                disabled={userVote !== null}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  userVote === 'bearish'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                    : 'bg-red-500/15 hover:bg-red-500/30 text-red-400'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Bearish ({sentimentStats.bearish}%)</span>
              </button>

              {userVote && (
                <span className="text-xs text-gray-400">Vote registered!</span>
              )}
            </div>
          </div>

          <div className="bg-[#07090e] p-5 rounded-xl border border-[#171f30] space-y-3">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Global Metrics</div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Crypto Market Cap:</span>
              <span className="text-white font-mono font-bold">$2.48 Trillion</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Bitcoin Dominance:</span>
              <span className="text-white font-mono font-bold">54.8%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Ethereum Gas Rate:</span>
              <span className="text-emerald-400 font-mono font-bold">14 Gwei (Low)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">24h Global Volume:</span>
              <span className="text-white font-mono font-bold">$84.2B</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY TRADE ON ZEPHYR LEDGER (eToro Pillars) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Why Millions Choose Zephyr Ledger
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Engineered for high security, maximum execution transparency, and social investing power.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#0e121c] border border-[#1a2336] rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#00C076]/10 text-[#00C076] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Institutional Custody</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Assets are safeguarded in FIPS 140-2 Level 3 cryptographic enclaves and segregated multi-sig cold storage.
            </p>
          </div>

          <div className="bg-[#0e121c] border border-[#1a2336] rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Transparent Pricing</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              0% management fees on CopyTrader. Clear spreads without surprise markups or account dormancy penalties.
            </p>
          </div>

          <div className="bg-[#0e121c] border border-[#1a2336] rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Social Trading Network</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Connect with experienced traders, analyze live portfolios, and participate in community discussions.
            </p>
          </div>

          <div className="bg-[#0e121c] border border-[#1a2336] rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Instant Flash Clearance</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              High-throughput matching engine supporting sub-second transaction routing and cryptographic settlement.
            </p>
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE TRADE MODAL (eToro Order Window) */}
      {tradeModalAsset && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#10141f] border border-[#1d273a] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setTradeModalAsset(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0"
                style={{ backgroundColor: `${tradeModalAsset.color}25`, color: tradeModalAsset.color }}
              >
                {tradeModalAsset.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Trade {tradeModalAsset.name} ({tradeModalAsset.symbol})
                </h3>
                <div className="text-xs text-gray-400 font-mono">
                  Market Price: ${tradeModalAsset.price.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Buy / Sell Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#090c13] rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setTradeAction('buy')}
                className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  tradeAction === 'buy'
                    ? 'bg-[#00C076] text-[#07090e] shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Buy {tradeModalAsset.symbol}
              </button>
              <button
                type="button"
                onClick={() => setTradeAction('sell')}
                className={`py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  tradeAction === 'sell'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sell {tradeModalAsset.symbol}
              </button>
            </div>

            <form onSubmit={handleExecuteTrade} className="space-y-4">
              {/* Order Type */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">Order Execution</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTradeOrderType('market')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      tradeOrderType === 'market'
                        ? 'bg-[#1b2436] text-[#00C076] border border-[#00C076]/40'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Market Order
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeOrderType('limit')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      tradeOrderType === 'limit'
                        ? 'bg-[#1b2436] text-[#00C076] border border-[#00C076]/40'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Limit Order
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Investment Amount</span>
                  <span>Units: {tradeModalAsset.price > 0 ? (parseFloat(tradeAmountUsd || '0') / tradeModalAsset.price).toFixed(4) : '0'} {tradeModalAsset.symbol}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    value={tradeAmountUsd}
                    onChange={(e) => setTradeAmountUsd(e.target.value)}
                    min="10"
                    step="10"
                    className="w-full pl-8 pr-4 py-3 bg-[#0a0d14] border border-[#1e2638] focus:border-[#00C076] rounded-xl text-sm font-bold text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2 text-xs">
                {['100', '250', '500', '1000', '2500'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTradeAmountUsd(amt)}
                    className="flex-1 py-1 bg-[#141a26] hover:bg-[#1c2436] text-gray-300 rounded-md text-[11px] transition-colors"
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Leverage Selector (eToro Feature) */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Leverage Multiplier</span>
                  <span className="text-[#00C076] font-bold">X{tradeLeverage} ({tradeLeverage === 1 ? 'Non-leveraged' : 'CFD Exposure'})</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 5].map((lev) => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setTradeLeverage(lev)}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        tradeLeverage === lev
                          ? 'bg-[#00C076]/20 border border-[#00C076] text-[#00C076]'
                          : 'bg-[#141a26] text-gray-400 hover:text-white'
                      }`}
                    >
                      X{lev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-[#090c13] rounded-xl p-3.5 border border-[#161d2b] space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Estimated Total Exposure:</span>
                  <span className="text-white font-mono font-semibold">
                    ${(parseFloat(tradeAmountUsd || '0') * tradeLeverage).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Commission:</span>
                  <span className="text-[#00C076] font-semibold">0.00 USD (Transparent Spread)</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Execution Route:</span>
                  <span className="text-gray-300">Zephyr Ledger Flash Router</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isExecutingTrade || !tradeAmountUsd || parseFloat(tradeAmountUsd) <= 0}
                className={`w-full py-3.5 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                  tradeAction === 'buy'
                    ? 'bg-[#00C076] hover:bg-[#00a868] text-[#07090e] shadow-[#00C076]/20'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
                }`}
              >
                {isExecutingTrade ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transmitting to Ledger...</span>
                  </>
                ) : (
                  <span>
                    Open {tradeAction.toUpperCase()} Order (${parseFloat(tradeAmountUsd || '0').toLocaleString()})
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 9. INTERACTIVE COPYTRADER MODAL */}
      {copyingInvestor && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#10141f] border border-[#1d273a] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setCopyingInvestor(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src={copyingInvestor.avatar}
                alt={copyingInvestor.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#00C076]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg font-bold text-white">{copyingInvestor.name}</h3>
                  <CheckCircle2 className="w-4 h-4 text-[#00C076]" />
                </div>
                <div className="text-xs text-gray-400">{copyingInvestor.handle}</div>
              </div>
            </div>

            <div className="bg-[#090c13] rounded-xl p-3 border border-[#161d2d] mb-4 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">12M Track Record:</span>
                <div className="text-base font-bold text-[#00C076] font-mono">+{copyingInvestor.gain12m}%</div>
              </div>
              <div>
                <span className="text-gray-400">Risk Profile:</span>
                <div className="text-base font-bold text-amber-400 font-mono">{copyingInvestor.riskScore}/10</div>
              </div>
            </div>

            <form onSubmit={handleExecuteCopy} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-300">
                  Amount to Allocate (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    value={copyAllocationUsd}
                    onChange={(e) => setCopyAllocationUsd(e.target.value)}
                    min="200"
                    step="100"
                    className="w-full pl-8 pr-4 py-3 bg-[#0a0d14] border border-[#1e2638] focus:border-[#00C076] rounded-xl text-sm font-bold text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Stop Loss Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Copy Stop-Loss Protection</span>
                  <span className="text-red-400 font-semibold">{copyStopLossPercent}% Drawdown</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={copyStopLossPercent}
                  onChange={(e) => setCopyStopLossPercent(parseInt(e.target.value))}
                  className="w-full accent-[#00C076] cursor-pointer"
                />
                <div className="text-[11px] text-gray-500">
                  Automatically stops copying if portfolio value drops by {copyStopLossPercent}%.
                </div>
              </div>

              <div className="p-3 bg-[#131b29] rounded-xl text-xs text-gray-300 flex items-start gap-2 border border-[#1d273a]">
                <Check className="w-4 h-4 text-[#00C076] shrink-0 mt-0.5" />
                <span>
                  All ongoing open positions of {copyingInvestor.name} will be mirrored proportionally at current market rates.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#00C076] hover:bg-[#00a868] text-[#07090e] font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#00C076]/20 cursor-pointer"
              >
                Confirm Copying ({copyAllocationUsd ? `$${parseFloat(copyAllocationUsd).toLocaleString()}` : '$0'})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
