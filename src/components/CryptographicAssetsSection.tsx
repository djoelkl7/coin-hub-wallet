import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  TrendingUp,
  ArrowUpDown,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';

export interface PortfolioAsset {
  id: string;
  name: string;
  symbol: string;
  holdings: number;
  holdingsFormatted: string;
  unitPrice: number;
  unitPriceFormatted: string;
  totalValue: number;
  totalValueFormatted: string;
  change24h: number;
  change24hFormatted: string;
  icon: string;
  color: string;
  network: string;
  categories: string[];
  riskTier: 'High Volatility' | 'Stablecoins' | 'Low Risk / Pegged' | 'Medium Volatility';
}

export const PORTFOLIO_ASSETS: PortfolioAsset[] = [
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    holdings: 14.82,
    holdingsFormatted: '14.82 ETH',
    unitPrice: 3210.40,
    unitPriceFormatted: '$3,210.40',
    totalValue: 47578.12,
    totalValueFormatted: '$47,578.12',
    change24h: 2.4,
    change24hFormatted: '+2.4%',
    icon: 'Ξ',
    color: '#627EEA',
    network: 'Ethereum Mainnet (PoS)',
    categories: ['High Volatility', 'Layer 1', 'Smart Contracts'],
    riskTier: 'High Volatility',
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    holdings: 0.68,
    holdingsFormatted: '0.68 BTC',
    unitPrice: 66150.00,
    unitPriceFormatted: '$66,150.00',
    totalValue: 44982.00,
    totalValueFormatted: '$44,982.00',
    change24h: 1.2,
    change24hFormatted: '+1.2%',
    icon: '₿',
    color: '#F7931A',
    network: 'Bitcoin Taproot Enclave',
    categories: ['High Volatility', 'Layer 1', 'Store of Value'],
    riskTier: 'High Volatility',
  },
  {
    id: 'usdc',
    name: 'USD Coin',
    symbol: 'USDC',
    holdings: 12940.67,
    holdingsFormatted: '12,940.67 USDC',
    unitPrice: 1.00,
    unitPriceFormatted: '$1.00',
    totalValue: 12940.67,
    totalValueFormatted: '$12,940.67',
    change24h: 0.0,
    change24hFormatted: '0.00%',
    icon: '$',
    color: '#2775CA',
    network: 'Base / ERC20 Verified',
    categories: ['Stablecoins', 'Liquidity Reserve'],
    riskTier: 'Stablecoins',
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: 'SOL',
    holdings: 34.2,
    holdingsFormatted: '34.2 SOL',
    unitPrice: 161.08,
    unitPriceFormatted: '$161.08',
    totalValue: 5509.00,
    totalValueFormatted: '$5,509.00',
    change24h: 3.1,
    change24hFormatted: '+3.1%',
    icon: 'S',
    color: '#14F195',
    network: 'Solana High-Speed Cluster',
    categories: ['High Volatility', 'Layer 1', 'Smart Contracts'],
    riskTier: 'High Volatility',
  },
];

type CategoryFilter = 'All' | 'High Volatility' | 'Stablecoins' | 'Layer 1' | 'Smart Contracts';
type SortOption = 'value_desc' | 'value_asc' | 'change_desc' | 'name_asc';

interface CryptographicAssetsSectionProps {
  onSelectAsset?: (asset: PortfolioAsset) => void;
}

export const CryptographicAssetsSection: React.FC<CryptographicAssetsSectionProps> = ({
  onSelectAsset,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('value_desc');

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      All: PORTFOLIO_ASSETS.length,
      'High Volatility': PORTFOLIO_ASSETS.filter((a) =>
        a.categories.includes('High Volatility')
      ).length,
      Stablecoins: PORTFOLIO_ASSETS.filter((a) =>
        a.categories.includes('Stablecoins')
      ).length,
      'Layer 1': PORTFOLIO_ASSETS.filter((a) =>
        a.categories.includes('Layer 1')
      ).length,
      'Smart Contracts': PORTFOLIO_ASSETS.filter((a) =>
        a.categories.includes('Smart Contracts')
      ).length,
    };
  }, []);

  // Filtered and sorted assets
  const filteredAssets = useMemo(() => {
    return PORTFOLIO_ASSETS.filter((asset) => {
      // 1. Category filter
      if (selectedCategory !== 'All' && !asset.categories.includes(selectedCategory)) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = asset.name.toLowerCase().includes(query);
        const matchesSymbol = asset.symbol.toLowerCase().includes(query);
        const matchesNetwork = asset.network.toLowerCase().includes(query);
        const matchesCategory = asset.categories.some((c) =>
          c.toLowerCase().includes(query)
        );
        return matchesName || matchesSymbol || matchesNetwork || matchesCategory;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'value_desc') return b.totalValue - a.totalValue;
      if (sortBy === 'value_asc') return a.totalValue - b.totalValue;
      if (sortBy === 'change_desc') return b.change24h - a.change24h;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [searchQuery, selectedCategory, sortBy]);

  // Aggregate stats of filtered assets
  const filteredTotalValue = useMemo(() => {
    return filteredAssets.reduce((sum, a) => sum + a.totalValue, 0);
  }, [filteredAssets]);

  const categoriesList: CategoryFilter[] = [
    'All',
    'High Volatility',
    'Stablecoins',
    'Layer 1',
    'Smart Contracts',
  ];

  return (
    <div className="bg-[#0e1119]/90 border border-[#1e2536] rounded-2xl overflow-hidden mb-8 shadow-xl shadow-black/40 backdrop-blur-md">
      {/* Header with Title and Quick Count */}
      <div className="p-4 sm:p-5 border-b border-[#1c1e24] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-white text-base">Your Cryptographic Assets</h3>
            <span className="text-[11px] font-mono text-[#00C076] bg-[#00C076]/10 px-2 py-0.5 rounded border border-[#00C076]/30">
              {filteredAssets.length} of {PORTFOLIO_ASSETS.length} Assets
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Real-time balance, spot pricing, and multi-network custody breakdown
          </p>
        </div>

        {/* Aggregate Value for current filter */}
        <div className="flex items-center gap-2 self-start md:self-auto text-xs bg-[#090d16] border border-[#1c273e] px-3.5 py-1.5 rounded-xl">
          <span className="text-gray-400">Filtered Valuation:</span>
          <span className="font-mono font-bold text-white">
            ${filteredTotalValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} USD
          </span>
        </div>
      </div>

      {/* Interactive Controls Bar: Search Input & Category Filters */}
      <div className="p-4 bg-[#090d16]/80 border-b border-[#1c1e24] space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by coin name, symbol (e.g. ETH, BTC, USDC) or network..."
              className="w-full bg-[#060910] border border-[#1e2a40] focus:border-[#00C076] focus:ring-1 focus:ring-[#00C076]/30 focus:outline-none rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-gray-500 font-mono transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                title="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-400 flex items-center gap-1 hidden sm:inline-flex">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-[#060910] border border-[#1e2a40] focus:border-[#00C076] rounded-xl px-3 py-2 text-xs text-gray-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="value_desc">Highest Valuation</option>
              <option value="value_asc">Lowest Valuation</option>
              <option value="change_desc">Top 24h Performers</option>
              <option value="name_asc">Asset Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-gray-400 flex items-center gap-1 shrink-0 mr-1 text-[11px] font-semibold uppercase tracking-wider">
            <Filter className="w-3 h-3 text-[#00C076]" />
            <span>Category:</span>
          </span>

          {categoriesList.map((category) => {
            const isSelected = selectedCategory === category;
            const count = categoryCounts[category];

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-[#00C076] text-[#07090e] shadow-sm shadow-[#00C076]/20 font-bold'
                    : 'bg-[#101522] text-gray-300 hover:text-white hover:bg-[#161d2e] border border-[#1c273e]'
                }`}
              >
                <span>{category}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-black/20 text-[#07090e]'
                      : 'bg-[#1b2336] text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {(searchQuery || selectedCategory !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 ml-auto shrink-0 cursor-pointer underline flex items-center gap-1"
            >
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Asset List Items */}
      {filteredAssets.length > 0 ? (
        <div className="divide-y divide-[#1c1e24]">
          {filteredAssets.map((asset) => {
            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset && onSelectAsset(asset)}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#131722] transition-colors cursor-pointer group"
              >
                {/* Left: Asset Icon, Symbol, Name & Category Badge */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 border transition-transform duration-200 group-hover:scale-105"
                    style={{
                      backgroundColor: `${asset.color}15`,
                      color: asset.color,
                      borderColor: `${asset.color}35`,
                    }}
                  >
                    {asset.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm truncate group-hover:text-emerald-300 transition-colors">
                        {asset.name}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">
                        {asset.symbol}
                      </span>
                      <span
                        className="hidden md:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor:
                            asset.riskTier === 'Stablecoins' || asset.riskTier === 'Low Risk / Pegged'
                              ? '#2775CA15'
                              : '#F7931A15',
                          color:
                            asset.riskTier === 'Stablecoins' || asset.riskTier === 'Low Risk / Pegged'
                              ? '#38bdf8'
                              : '#fbbf24',
                          borderColor:
                            asset.riskTier === 'Stablecoins' || asset.riskTier === 'Low Risk / Pegged'
                              ? '#2775CA40'
                              : '#F7931A40',
                        }}
                      >
                        {asset.riskTier}
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 mt-0.5 truncate flex items-center gap-1.5 font-mono">
                      <span>{asset.holdingsFormatted}</span>
                      <span>·</span>
                      <span className="text-gray-300">{asset.unitPriceFormatted}</span>
                      <span className="hidden sm:inline-block text-gray-600">·</span>
                      <span className="hidden sm:inline-block text-gray-500 font-sans text-[11px]">
                        {asset.network}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Total Value, 24h Change & Arrow */}
                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <div className="font-semibold text-white text-sm font-mono">
                      {asset.totalValueFormatted}
                    </div>
                    <div
                      className={`text-xs font-mono font-medium ${
                        asset.change24h > 0
                          ? 'text-emerald-400'
                          : asset.change24h < 0
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {asset.change24hFormatted}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 transition-colors hidden sm:block" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 px-4 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#141a29] border border-[#202b40] text-gray-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">No cryptographic assets match your search</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              No coin found for &ldquo;<span className="text-cyan-300 font-mono">{searchQuery}</span>&rdquo; in category &ldquo;<span className="text-white">{selectedCategory}</span>&rdquo;.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-[#121a2c] hover:bg-[#1a253e] text-[#00C076] hover:text-white border border-[#00C076]/30 rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Search & Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
