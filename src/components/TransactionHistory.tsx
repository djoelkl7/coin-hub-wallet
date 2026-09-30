import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';

export interface Transaction {
  id: string;
  txHash: string;
  type: 'incoming' | 'outgoing';
  asset: string;
  symbol: string;
  amountCrypto: string;
  amountUSD: string;
  senderOrRecipient: string;
  timestamp: string;
  network: string;
  networkFee: string;
  status: 'completed' | 'pending' | 'confirmed';
  confirmations: number;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    txHash: '0x8f3c72a1e94d8b5c21a4e69d72b0c13e54a9d70183b2e5f6',
    type: 'incoming',
    asset: 'Ethereum',
    symbol: 'ETH',
    amountCrypto: '+0.54 ETH',
    amountUSD: '+$1,733.62',
    senderOrRecipient: 'From 0x4838b1...0622',
    timestamp: 'Today, 08:42 AM',
    network: 'Ethereum Mainnet',
    networkFee: '$3.42 (0.001 ETH)',
    status: 'completed',
    confirmations: 64,
  },
  {
    id: 'tx-2',
    txHash: '0x1a9e4f728c3d0b5e612a439c71e80b2a34f5d6089c1e2b7a',
    type: 'incoming',
    asset: 'USD Coin',
    symbol: 'USDC',
    amountCrypto: '+2,500.00 USDC',
    amountUSD: '+$2,500.00',
    senderOrRecipient: 'From 0x71c890...4d91',
    timestamp: 'Today, 06:15 AM',
    network: 'Base Mainnet',
    networkFee: '$0.02 (<0.0001 ETH)',
    status: 'completed',
    confirmations: 182,
  },
  {
    id: 'tx-3',
    txHash: '0x5c72e90a1b3f4d8a2b5e601c79e83a2d45b6f7091c2e4a8b',
    type: 'outgoing',
    asset: 'Bitcoin',
    symbol: 'BTC',
    amountCrypto: '-0.024 BTC',
    amountUSD: '-$1,587.60',
    senderOrRecipient: 'To bc1qxy2k...8h3j',
    timestamp: 'Yesterday, 04:20 PM',
    network: 'Bitcoin Core',
    networkFee: '$2.15 (0.00003 BTC)',
    status: 'completed',
    confirmations: 12,
  },
  {
    id: 'tx-4',
    txHash: '0x3d8a1f6e2b4c5a9d0e7f8b1c2a3d4e5f60718293a4b5c6d7',
    type: 'incoming',
    asset: 'Solana',
    symbol: 'SOL',
    amountCrypto: '+12.50 SOL',
    amountUSD: '+$2,013.50',
    senderOrRecipient: 'Staking Distribution',
    timestamp: 'Sep 21, 2026, 11:30 PM',
    network: 'Solana Mainnet',
    networkFee: '$0.0002 (0.000005 SOL)',
    status: 'completed',
    confirmations: 430,
  },
  {
    id: 'tx-5',
    txHash: '0x9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    type: 'outgoing',
    asset: 'USD Coin',
    symbol: 'USDC',
    amountCrypto: '-1,200.00 USDC',
    amountUSD: '-$1,200.00',
    senderOrRecipient: 'To 0x82b49c...921a',
    timestamp: 'Sep 20, 2026, 02:45 PM',
    network: 'Base Mainnet',
    networkFee: '$0.03 (<0.0001 ETH)',
    status: 'completed',
    confirmations: 924,
  },
  {
    id: 'tx-6',
    txHash: '0x4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
    type: 'incoming',
    asset: 'Ethereum',
    symbol: 'ETH',
    amountCrypto: '+0.15 ETH',
    amountUSD: '+$481.56',
    senderOrRecipient: 'From 0x9021a8...339b',
    timestamp: 'Sep 19, 2026, 09:10 AM',
    network: 'Base Mainnet',
    networkFee: '$0.01 (<0.0001 ETH)',
    status: 'confirmed',
    confirmations: 1420,
  },
  {
    id: 'tx-7',
    txHash: '0x7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    type: 'outgoing',
    asset: 'Ethereum',
    symbol: 'ETH',
    amountCrypto: '-0.30 ETH',
    amountUSD: '-$963.12',
    senderOrRecipient: 'Liquidity Pool Deposit',
    timestamp: 'Sep 18, 2026, 07:05 PM',
    network: 'Ethereum Mainnet',
    networkFee: '$4.12 (0.0013 ETH)',
    status: 'completed',
    confirmations: 2100,
  }
];

export function TransactionHistory() {
  const [filterType, setFilterType] = useState<'all' | 'incoming' | 'outgoing'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Filter transactions based on category and search
  const filteredTransactions = MOCK_TRANSACTIONS.filter((tx) => {
    if (filterType === 'incoming' && tx.type !== 'incoming') return false;
    if (filterType === 'outgoing' && tx.type !== 'outgoing') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.asset.toLowerCase().includes(q) ||
        tx.symbol.toLowerCase().includes(q) ||
        tx.senderOrRecipient.toLowerCase().includes(q) ||
        tx.network.toLowerCase().includes(q) ||
        tx.txHash.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="bg-[#14151a] border border-[#23262f] rounded-2xl overflow-hidden mb-8 shadow-lg">
      {/* Header & Controls */}
      <div className="p-5 border-b border-[#1c1e24] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base">Transaction History</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#1f222a] text-gray-300 border border-[#2b2f3a]">
              Live Ledger
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Verified cryptographic transfers across your connected chains
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Filter Pills */}
          <div className="flex items-center bg-[#0a0b0d] p-1 rounded-xl border border-[#23262f]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#0052FF] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All ({MOCK_TRANSACTIONS.length})
            </button>
            <button
              onClick={() => setFilterType('incoming')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filterType === 'incoming'
                  ? 'bg-[#0052FF] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Received
            </button>
            <button
              onClick={() => setFilterType('outgoing')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filterType === 'outgoing'
                  ? 'bg-[#0052FF] text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sent
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search asset, hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-44 pl-8 pr-3 py-1.5 bg-[#0a0b0d] border border-[#23262f] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#0052FF] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-[#1c1e24]">
        {filteredTransactions.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#1c1e24] flex items-center justify-center mx-auto text-gray-500 mb-3">
              <Filter className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-gray-300">No transactions found</p>
            <p className="text-xs text-gray-500 mt-1">
              Try adjusting your filter or search criteria.
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncoming = tx.type === 'incoming';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#181a20] transition-colors cursor-pointer group"
              >
                {/* Left side: Icon, Type, Address & Timestamp */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                      isIncoming
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    }`}
                  >
                    {isIncoming ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm tracking-tight truncate">
                        {isIncoming ? 'Received' : 'Sent'} {tx.asset}
                      </span>
                      {/* Status Badge */}
                      <span
                        className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          tx.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : tx.status === 'confirmed'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {tx.status === 'completed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {tx.status === 'confirmed' && <Layers className="w-2.5 h-2.5" />}
                        {tx.status === 'pending' && <Clock className="w-2.5 h-2.5 animate-spin" />}
                        <span className="capitalize">{tx.status}</span>
                      </span>
                    </div>

                    <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5 truncate">
                      <span className="truncate">{tx.senderOrRecipient}</span>
                      <span>·</span>
                      <span className="text-gray-500 shrink-0">{tx.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Amount and chevron */}
                <div className="flex items-center gap-3 text-right shrink-0 pl-3">
                  <div>
                    <div
                      className={`font-semibold text-sm ${
                        isIncoming ? 'text-emerald-400' : 'text-gray-100'
                      }`}
                    >
                      {tx.amountCrypto}
                    </div>
                    <div className="text-xs text-gray-400">{tx.amountUSD}</div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 transition-colors hidden sm:block" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer summary info */}
      <div className="p-3.5 bg-[#0e1014] border-t border-[#1c1e24] flex items-center justify-between text-xs text-gray-500">
        <span>Showing {filteredTransactions.length} of {MOCK_TRANSACTIONS.length} transfers</span>
        <span className="font-mono text-[11px] text-gray-400">Node Sync: Block #20,841,924</span>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#14151a] border border-[#23262f] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1c1e24] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  selectedTx.type === 'incoming'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                }`}
              >
                {selectedTx.type === 'incoming' ? (
                  <ArrowDownLeft className="w-6 h-6" />
                ) : (
                  <ArrowUpRight className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  {selectedTx.type === 'incoming' ? 'Received' : 'Sent'} {selectedTx.asset}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      selectedTx.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="capitalize">{selectedTx.status}</span>
                  </span>
                  <span className="text-xs text-gray-400">{selectedTx.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Value block */}
            <div className="bg-[#0a0b0d] border border-[#23262f] rounded-xl p-4 mb-5 text-center">
              <div
                className={`text-2xl font-extrabold ${
                  selectedTx.type === 'incoming' ? 'text-emerald-400' : 'text-white'
                }`}
              >
                {selectedTx.amountCrypto}
              </div>
              <div className="text-sm text-gray-400 mt-1">{selectedTx.amountUSD}</div>
            </div>

            {/* Ledger breakdown */}
            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between py-2 border-b border-[#1c1e24]">
                <span className="text-gray-400">Network:</span>
                <span className="font-medium text-white">{selectedTx.network}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1c1e24]">
                <span className="text-gray-400">Counterparty:</span>
                <span className="font-mono text-gray-200">{selectedTx.senderOrRecipient}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1c1e24]">
                <span className="text-gray-400">Network Fee:</span>
                <span className="text-gray-200">{selectedTx.networkFee}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#1c1e24]">
                <span className="text-gray-400">Confirmations:</span>
                <span className="text-emerald-400 font-medium">
                  {selectedTx.confirmations} blocks (Finalized)
                </span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1.5">Transaction Hash:</span>
                <div className="flex items-center gap-2 bg-[#0a0b0d] p-2.5 rounded-lg border border-[#23262f]">
                  <span className="font-mono text-[11px] text-gray-300 truncate flex-1">
                    {selectedTx.txHash}
                  </span>
                  <button
                    onClick={() => handleCopy(selectedTx.txHash)}
                    className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#1c1e24] transition-colors cursor-pointer"
                    title="Copy hash"
                  >
                    {copiedHash ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 bg-[#1c1e24] hover:bg-[#23262f] text-white font-semibold text-xs rounded-xl border border-[#2b2f3a] transition-colors cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
