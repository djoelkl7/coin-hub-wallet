import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  LogOut,
  Wallet,
  TrendingUp,
  FileText,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Info,
  Layers,
  ArrowLeft,
  Sparkles,
  KeyRound,
  Copy,
  Check,
  HelpCircle,
  Fingerprint,
  Code2,
  Cpu
} from 'lucide-react';
import { TransactionHistory } from './components/TransactionHistory.tsx';
import { SupportModal } from './components/SupportModal.tsx';

type Page = 'login' | 'dashboard' | 'paytowithdraw';

export interface AureonAuthToken {
  protocol: string;
  username: string;
  userId: string;
  name: string;
  timestamp: number;
  nonce: string;
  checksum: string;
}

export const CURRENT_AUREON_AUTH: AureonAuthToken = {
  protocol: "AUREON-AUTH-V1",
  username: "Berginjoshua1@gmail.com",
  userId: "2",
  name: "Joshua-James-Bergin",
  timestamp: 1790174583025,
  nonce: "woukped9",
  checksum: "2497753e"
};

interface UserData {
  name: string;
  email: string;
  walletAddress: string;
  totalPortfolio: string;
  availableBalance: string;
  todayProfitLoss: string;
  todayPercentage: string;
  clearanceFee: string;
}

const DEFAULT_USER: UserData = {
  name: 'Joshua James Bergin',
  email: 'Berginjoshua1@gmail.com',
  walletAddress: '0x71C890c309855B614917C5Bdf6479b182E45f491',
  totalPortfolio: '$111,009.79',
  availableBalance: '$47,986.00',
  todayProfitLoss: '+$1,973.74',
  todayPercentage: '+1.81%',
  clearanceFee: '$5,960.00',
};

export default function App() {
  // Navigation & session state
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeSession, setActiveSession] = useState<AureonAuthToken | null>(CURRENT_AUREON_AUTH);
  const [showSessionModal, setShowSessionModal] = useState<boolean>(false);

  // Copy Address notification state
  const [copyNotification, setCopyNotification] = useState<{
    show: boolean;
    source: string;
  } | null>(null);
  const [recentCopiedTarget, setRecentCopiedTarget] = useState<string | null>(null);

  const handleCopyAddress = (targetKey: string = 'profile') => {
    const address = DEFAULT_USER.walletAddress;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = address;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch {
      // Ignore copy error
    }

    setRecentCopiedTarget(targetKey);
    setCopyNotification({
      show: true,
      source:
        targetKey === 'profile'
          ? 'Profile Name'
          : targetKey === 'total_portfolio'
          ? 'Total Portfolio'
          : targetKey === 'available_balance'
          ? 'Available Balance'
          : 'Wallet Header'
    });

    setTimeout(() => {
      setRecentCopiedTarget(null);
    }, 2000);

    setTimeout(() => {
      setCopyNotification(null);
    }, 3200);
  };

  // Login form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);

  // Withdrawal simulation state
  const [isSimulatingFee, setIsSimulatingFee] = useState<boolean>(false);
  const [simulationComplete, setSimulationComplete] = useState<boolean>(false);
  const [simulationTxId, setSimulationTxId] = useState<string>('');

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as Page;
      if (hash === 'dashboard' || hash === 'paytowithdraw') {
        if (isAuthenticated) {
          setCurrentPage(hash);
        } else {
          setCurrentPage('login');
        }
      } else if (hash === 'login' || !hash) {
        setCurrentPage('login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.location.hash = page;
  };

  // Token-based authentication handler
  const handleTokenLogin = (rawToken?: string) => {
    const input = rawToken || JSON.stringify(CURRENT_AUREON_AUTH);
    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const parsed = JSON.parse(input.trim());
        if (
          parsed.protocol?.toUpperCase() === 'AUREON-AUTH-V1' &&
          (parsed.username?.toLowerCase() === 'berginjoshua1@gmail.com' || parsed.userId === '2')
        ) {
          setActiveSession(parsed as AureonAuthToken);
          setIsAuthenticated(true);
          setIsSubmitting(false);
          navigateTo('dashboard');
          return;
        }
        throw new Error('Unrecognized protocol or unauthorized user');
      } catch {
        setIsSubmitting(false);
        setErrorMessage('Invalid AUREON-AUTH-V1 token format or invalid checksum.');
      }
    }, 450);
  };

  // Login submission handler with specified credentials check
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    // Auto-detect pasted JSON / AUREON token in either field
    if (trimmedEmail.startsWith('{') && trimmedEmail.includes('AUREON')) {
      handleTokenLogin(trimmedEmail);
      return;
    }
    if (trimmedPass.startsWith('{') && trimmedPass.includes('AUREON')) {
      handleTokenLogin(trimmedPass);
      return;
    }

    setIsSubmitting(true);

    // Simulation delay for realistic crypto auth check
    setTimeout(() => {
      const normalizedEmail = trimmedEmail.toLowerCase();
      const targetEmail = 'berginjoshua1@gmail.com';
      const targetPassword = 'Thatguy@12';

      if (normalizedEmail === targetEmail && password === targetPassword) {
        setIsAuthenticated(true);
        setIsSubmitting(false);
        navigateTo('dashboard');
      } else {
        setIsSubmitting(false);
        setErrorMessage('Invalid credentials. Please check your email and password.');
      }
    }, 600);
  };

  // Demo credential autofill helper
  const handleAutofill = () => {
    setEmail('Berginjoshua1@gmail.com');
    setPassword('Thatguy@12');
    setErrorMessage('');
  };

  // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setErrorMessage('');
    setSimulationComplete(false);
    navigateTo('login');
  };

  // Simulated Clearance Fee payment
  const handleSimulatePayment = () => {
    setIsSimulatingFee(true);
    setTimeout(() => {
      setIsSimulatingFee(false);
      setSimulationComplete(true);
      setSimulationTxId('0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-white flex flex-col selection:bg-[#0052FF] selection:text-white relative">
      {/* Luminous Ambient Background Glows */}
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,102,255,0.18),transparent_70%)] pointer-events-none"></div>
      <div className="absolute top-32 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#0052FF]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="border-b border-[#1b2230] bg-[#080a0f]/80 backdrop-blur-xl sticky top-0 z-40 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative z-10">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0052FF] via-[#2563eb] to-[#06b6d4] p-[1.5px] shadow-lg shadow-[#0052FF]/25">
              <div className="w-full h-full bg-[#0a0d14] rounded-[10px] flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-tr from-[#0052FF] to-cyan-400 rounded-sm transform rotate-45 shadow-sm"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-lg text-white">Crypto Trade</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#0052FF] to-cyan-500 text-white tracking-wider shadow-sm shadow-cyan-500/20">
                  HUB
                </span>
              </div>
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#11141d] border border-[#1e2535] text-xs font-medium text-gray-300 shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400/50"></div>
                  <span className="text-gray-200 font-medium">Base Mainnet</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyAddress('header_user')}
                  className="hidden md:flex items-center gap-2 pl-2 pr-3 py-1 bg-[#11141d] hover:bg-[#181d2a] border border-[#1e2535] hover:border-[#0052FF]/50 rounded-full transition-all cursor-pointer group shadow-xs"
                  title="Click to copy wallet address"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#0052FF] via-indigo-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                    JB
                  </div>
                  <span className="text-xs text-gray-200 group-hover:text-white font-medium">{DEFAULT_USER.name}</span>
                  {recentCopiedTarget === 'header_user' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-500 group-hover:text-gray-300 transition-colors" />
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white bg-[#11141d] hover:bg-[#1c2230] border border-[#1e2535] hover:border-red-500/40 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                  title="Sign out of account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-[#11141d]/80 px-3 py-1.5 rounded-lg border border-[#1e2535]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline font-medium text-gray-300">256-Bit Encrypted Vault</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentPage === 'login' && (
          <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
            <div className="w-full max-w-md">
              {/* Login Card */}
              <div className="bg-[#14151a] border border-[#23262f] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                {/* Glow accent */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0052FF]/15 rounded-full blur-3xl pointer-events-none"></div>

                {/* Card Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0052FF]/20 to-cyan-500/20 text-[#0052FF] mb-4 border border-[#0052FF]/30 shadow-lg shadow-[#0052FF]/10">
                    <KeyRound className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Sign in to Crypto Trade Hub</h1>
                  <p className="text-sm text-gray-400 mt-2">
                    Access your decentralized portfolio, active trading orders, and instant settlement.
                  </p>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                    <div className="flex-1 leading-relaxed">
                      <p className="font-semibold text-red-300">Authentication Failed</p>
                      <p>{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-3 bg-[#0a0b0d] border border-[#23262f] focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/30 rounded-xl text-sm text-white placeholder-gray-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-[#0052FF] hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-11 py-3 bg-[#0a0b0d] border border-[#23262f] focus:border-[#0052FF] focus:ring-2 focus:ring-[#0052FF]/30 rounded-xl text-sm text-white placeholder-gray-500 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#23262f] bg-[#0a0b0d] text-[#0052FF] focus:ring-[#0052FF]/40 accent-[#0052FF]"
                      />
                      <span className="text-xs text-gray-300">Remember this device</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-[#0052FF] hover:bg-[#0045d8] disabled:bg-[#0052FF]/50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#0052FF]/25 hover:shadow-[#0052FF]/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Security Protocol...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </form>

                {/* Account Navigation & Assistance */}
                <div className="mt-6 pt-5 border-t border-[#1c1e24] text-center space-y-2.5">
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                    <span>Don't have an account?</span>
                    <button
                      type="button"
                      onClick={handleAutofill}
                      className="text-[#0052FF] hover:text-blue-400 font-semibold transition-colors cursor-pointer"
                    >
                      Sign up
                    </button>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom security assurance */}
              <div className="mt-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <span>Non-custodial cryptographic signature verification</span>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'dashboard' && (
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* User welcome header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#1c1e24]">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-1.5">
                  <span>Authorized Account</span>
                  <span>·</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Identity Confirmed
                  </span>
                  {activeSession && (
                    <>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => setShowSessionModal(true)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-mono transition-all cursor-pointer shadow-xs"
                        title="View AUREON-AUTH-V1 Handshake Certificate"
                      >
                        <Cpu className="w-3 h-3 text-cyan-300" />
                        <span>{activeSession.protocol}</span>
                        <span className="text-gray-400">UID:{activeSession.userId}</span>
                      </button>
                    </>
                  )}
                </div>
                
                {/* Clickable User Profile Name for Copy Address */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleCopyAddress('profile')}
                    className="group inline-flex items-center gap-2.5 text-left cursor-pointer transition-all"
                    title="Click user name to copy wallet address"
                  >
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                      {DEFAULT_USER.name}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[#1c1e24] group-hover:bg-[#0052FF]/20 text-gray-300 group-hover:text-white border border-[#2b2f3a] group-hover:border-[#0052FF]/50 transition-all font-mono">
                      {recentCopiedTarget === 'profile' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300 font-sans font-medium text-[11px]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-400" />
                          <span className="text-[11px]">
                            {DEFAULT_USER.walletAddress.slice(0, 6)}...{DEFAULT_USER.walletAddress.slice(-4)}
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                </div>

                <p className="text-sm text-gray-400 font-mono mt-1">{DEFAULT_USER.email}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigateTo('paytowithdraw')}
                  className="px-5 py-2.5 bg-[#0052FF] hover:bg-[#0045d8] text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-[#0052FF]/20 flex items-center gap-2 cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Process Withdrawal</span>
                </button>

                <button
                  onClick={() => navigateTo('paytowithdraw')}
                  className="px-4 py-2.5 bg-[#14151a] hover:bg-[#1c1e24] border border-[#23262f] text-gray-200 font-medium text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>Review Investment Rules Notice</span>
                </button>
              </div>
            </div>

            {/* Portfolio Summary Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
              {/* Total Portfolio - Clickable to copy address */}
              <div
                onClick={() => handleCopyAddress('total_portfolio')}
                className="bg-gradient-to-br from-[#121624] via-[#0d1018] to-[#090b11] border border-[#1f283d] hover:border-[#0052FF]/70 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 cursor-pointer group shadow-xl shadow-black/40 hover:shadow-[#0052FF]/10"
                title="Click portfolio balance to copy wallet address"
              >
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#0052FF]/10 rounded-full blur-2xl pointer-events-none group-hover:bg-[#0052FF]/20 transition-all"></div>
                <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 relative z-10">
                  <span className="text-gray-300">Total Portfolio</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-normal normal-case text-gray-400 group-hover:text-blue-400 flex items-center gap-1 transition-colors">
                      {recentCopiedTarget === 'total_portfolio' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Address</span>
                        </>
                      )}
                    </span>
                    <Wallet className="w-4 h-4 text-[#0052FF] ml-1" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight group-hover:text-blue-50 transition-colors relative z-10">
                  {DEFAULT_USER.totalPortfolio}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-medium relative z-10">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{DEFAULT_USER.todayPercentage} past 24 hours</span>
                </div>
              </div>

              {/* Available Balance - Clickable to copy address */}
              <div
                onClick={() => handleCopyAddress('available_balance')}
                className="bg-gradient-to-br from-[#0e1724] via-[#0c121c] to-[#090b11] border border-[#1a293d] hover:border-cyan-500/70 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 cursor-pointer group shadow-xl shadow-black/40 hover:shadow-cyan-500/10"
                title="Click available balance to copy wallet address"
              >
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all"></div>
                <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 relative z-10">
                  <span className="text-gray-300">Available Balance</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-normal normal-case text-gray-400 group-hover:text-cyan-400 flex items-center gap-1 transition-colors">
                      {recentCopiedTarget === 'available_balance' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Address</span>
                        </>
                      )}
                    </span>
                    <Layers className="w-4 h-4 text-cyan-400 ml-1" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight relative z-10">
                  {DEFAULT_USER.availableBalance}
                </div>
                <div className="mt-3 text-xs text-gray-400 relative z-10">
                  Ready for clearance and liquidity distribution
                </div>
              </div>

              {/* Today's P/L */}
              <div className="bg-gradient-to-br from-[#0c1a17] via-[#091512] to-[#090b11] border border-emerald-500/30 hover:border-emerald-400/50 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 shadow-xl shadow-black/40">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 relative z-10">
                  <span className="text-gray-300">Today's Profit / Loss</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400"></div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight relative z-10">
                  {DEFAULT_USER.todayProfitLoss}
                </div>
                <div className="mt-3 text-xs text-gray-400 relative z-10">
                  Net 24h market performance gain
                </div>
              </div>
            </div>

            {/* Assets Breakdown */}
            <div className="bg-[#0e1119]/90 border border-[#1e2536] rounded-2xl overflow-hidden mb-8 shadow-xl shadow-black/40 backdrop-blur-md">
              <div className="p-5 border-b border-[#1c1e24] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">Your Cryptographic Assets</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Asset distribution across integrated networks</p>
                </div>
                <span className="text-xs text-gray-400">4 Assets</span>
              </div>

              <div className="divide-y divide-[#1c1e24]">
                {/* Ethereum */}
                <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#181a20] transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#627EEA]/15 border border-[#627EEA]/30 flex items-center justify-center font-bold text-[#627EEA]">
                      Ξ
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">Ethereum</div>
                      <div className="text-xs text-gray-400">14.82 ETH · $3,210.40</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white text-sm">$47,578.12</div>
                    <div className="text-xs text-emerald-400">+2.4%</div>
                  </div>
                </div>

                {/* Bitcoin */}
                <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#181a20] transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#F7931A]/15 border border-[#F7931A]/30 flex items-center justify-center font-bold text-[#F7931A]">
                      ₿
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">Bitcoin</div>
                      <div className="text-xs text-gray-400">0.68 BTC · $66,150.00</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white text-sm">$44,982.00</div>
                    <div className="text-xs text-emerald-400">+1.2%</div>
                  </div>
                </div>

                {/* USD Coin */}
                <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#181a20] transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#2775CA]/15 border border-[#2775CA]/30 flex items-center justify-center font-bold text-[#2775CA]">
                      $
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">USD Coin</div>
                      <div className="text-xs text-gray-400">Stablecoin (1.00 USD)</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white text-sm">$12,940.67</div>
                    <div className="text-xs text-gray-400">0.00%</div>
                  </div>
                </div>

                {/* Solana */}
                <div className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#181a20] transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#14F195]/15 border border-[#14F195]/30 flex items-center justify-center font-bold text-[#14F195]">
                      S
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">Solana</div>
                      <div className="text-xs text-gray-400">34.2 SOL · $161.08</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white text-sm">$5,509.00</div>
                    <div className="text-xs text-emerald-400">+3.1%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History Component */}
            <TransactionHistory />
          </div>
        )}

        {currentPage === 'paytowithdraw' && (
          <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
            {/* Back to dashboard breadcrumb button */}
            <div className="mb-6">
              <button
                onClick={() => navigateTo('dashboard')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer py-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
            </div>

            {/* Authorization Notice Main Card */}
            <div className="bg-[#14151a] border border-[#23262f] rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#1c1e24]">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#0052FF]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Withdrawal Authorization Notice
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Settlement & Security Clearance Verification
                  </p>
                </div>
              </div>

              {/* Account details ledger */}
              <div className="bg-[#0a0b0d] border border-[#23262f] rounded-xl p-5 mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1c1e24] text-sm">
                  <span className="text-gray-400">Account Holder:</span>
                  <span className="text-white font-semibold">{DEFAULT_USER.name}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1c1e24] text-sm">
                  <span className="text-gray-400">Registered Email:</span>
                  <span className="text-white font-mono">{DEFAULT_USER.email}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1c1e24] text-sm">
                  <span className="text-gray-400">Available Balance:</span>
                  <span className="text-emerald-400 font-bold text-base">{DEFAULT_USER.availableBalance}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm">
                  <span className="text-gray-400">Required Clearance Fee:</span>
                  <span className="text-amber-400 font-bold text-base">{DEFAULT_USER.clearanceFee}</span>
                </div>
              </div>

              {/* Simulation Notice Disclaimer */}
              <div className="p-4 rounded-xl bg-[#1c1e24]/60 border border-[#2b2f3a] text-xs text-gray-300 mb-8 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-white">Notice & Simulation Environment:</span> This interface
                  demonstrates the requested client-side layout, wallet statistics, and security authorization workflow.
                  All payment actions here are local mock simulations for UI validation.
                </div>
              </div>

              {/* Simulation Complete Banner */}
              {simulationComplete && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs mb-6 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2 font-semibold text-emerald-300 text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Clearance Fee Authorized (Simulation)</span>
                  </div>
                  <p className="text-gray-300">
                    Settlement simulation completed. Mock Transaction Hash:
                  </p>
                  <div className="font-mono text-[11px] bg-[#0a0b0d] p-2 rounded mt-1.5 border border-[#23262f] break-all text-emerald-300">
                    {simulationTxId}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulatingFee}
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSimulatingFee ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Clearance Simulation...</span>
                    </>
                  ) : (
                    <span>Pay Clearance Fee (Simulation)</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('dashboard')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-[#1c1e24] hover:bg-[#23262f] text-gray-200 hover:text-white font-semibold text-sm rounded-xl border border-[#2b2f3a] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Back to Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#14151a] border border-[#23262f] rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[#0052FF] flex items-center justify-center mb-4">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Account Credentials Help</h3>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              In this Crypto Trade Hub prototype, your authorized credentials for client-side validation are:
            </p>
            <div className="bg-[#0a0b0d] border border-[#23262f] rounded-lg p-3 my-4 space-y-1.5 text-xs">
              <div>
                <span className="text-gray-500">Email: </span>
                <span className="text-gray-200 font-mono">Berginjoshua1@gmail.com</span>
              </div>
              <div>
                <span className="text-gray-500">Password: </span>
                <span className="text-gray-200 font-mono">Thatguy@12</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleAutofill();
                  setShowForgotModal(false);
                }}
                className="flex-1 py-2.5 bg-[#0052FF] hover:bg-[#0045d8] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Apply Credentials
              </button>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2.5 bg-[#1c1e24] hover:bg-[#23262f] text-gray-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUREON-AUTH-V1 Handshake Certificate Modal */}
      {showSessionModal && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#121622] border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    AUREON-AUTH-V1 Certificate
                  </h3>
                  <p className="text-[11px] text-cyan-400/80 font-mono">
                    Cryptographic Handshake Verified
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <div className="bg-[#090c12] border border-[#1e2638] rounded-xl p-4 my-4 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center py-1 border-b border-[#161c2b]">
                <span className="text-gray-400">Protocol:</span>
                <span className="text-cyan-300 font-semibold">{activeSession.protocol}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#161c2b]">
                <span className="text-gray-400">User ID:</span>
                <span className="text-white font-semibold">#{activeSession.userId}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#161c2b]">
                <span className="text-gray-400">Authorized Name:</span>
                <span className="text-gray-200">{activeSession.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#161c2b]">
                <span className="text-gray-400">Username / Email:</span>
                <span className="text-gray-300">{activeSession.username}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#161c2b]">
                <span className="text-gray-400">Session Nonce:</span>
                <span className="text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  {activeSession.nonce}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#161c2b]">
                <span className="text-gray-400">Checksum (CRC32/SHA):</span>
                <span className="text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {activeSession.checksum}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-400">Timestamp:</span>
                <span className="text-gray-300">{activeSession.timestamp}</span>
              </div>
            </div>

            <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl mb-4 text-[11px] text-gray-300 leading-relaxed">
              <span className="text-cyan-400 font-semibold">Session Authority: </span>
              This session was authorized via the AUREON decentralized identity and auth protocol. Session signature and nonce integrity have been verified for user clearance.
            </div>

            <button
              type="button"
              onClick={() => setShowSessionModal(false)}
              className="w-full py-2.5 bg-[#1b2233] hover:bg-[#232d42] border border-[#2b3852] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Dismiss Handshake Certificate
            </button>
          </div>
        </div>
      )}

      {/* Floating Support Ticket Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsSupportModalOpen(true)}
          className="group flex items-center gap-2.5 bg-[#14151a] hover:bg-[#1a1c23] border border-[#23262f] hover:border-[#0052FF]/60 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-2xl shadow-black/80 backdrop-blur-md transition-all duration-200 cursor-pointer hover:scale-105"
          title="Open Support Ticket"
        >
          <div className="relative flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-[#0052FF] text-white flex items-center justify-center shadow-md shadow-[#0052FF]/30">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#14151a]"></span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white tracking-tight leading-none group-hover:text-blue-400 transition-colors">
              Help & Support
            </span>
            <span className="text-[10px] text-gray-400 leading-tight mt-0.5">
              24/7 Concierge
            </span>
          </div>
        </button>
      </div>

      {/* Support Ticket Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        defaultEmail={isAuthenticated ? DEFAULT_USER.email : ''}
        defaultName={isAuthenticated ? DEFAULT_USER.name : ''}
      />

      {/* Floating Clipboard Success Toast Notification */}
      {copyNotification?.show && (
        <div className="fixed bottom-20 right-6 z-50 flex items-center gap-3.5 bg-[#14151a] border border-emerald-500/50 text-white px-4 py-3.5 rounded-2xl shadow-2xl shadow-emerald-500/20 backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Check className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">Address Copied!</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                {copyNotification.source}
              </span>
            </div>
            <p className="text-[11px] font-mono text-gray-300 mt-1 truncate select-all">
              {DEFAULT_USER.walletAddress}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCopyNotification(null)}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1c1e24] transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#1b2230] bg-[#080a0f] py-6 px-4 text-center text-xs text-gray-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50"></span>
            <span className="text-gray-300 font-medium">Crypto Trade Hub Web Client</span>
            <span>·</span>
            <span className="text-gray-400">Institutional Security</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <span className="hover:text-gray-200 transition-colors cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-gray-200 transition-colors cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-gray-200 transition-colors cursor-pointer">Help Center</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
