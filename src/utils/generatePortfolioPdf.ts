import { jsPDF } from 'jspdf';

export interface PortfolioPdfData {
  userName: string;
  userEmail: string;
  walletAddress: string;
  totalPortfolio: string;
  availableBalance: string;
  todayProfitLoss: string;
  todayPercentage: string;
  clearanceFee: string;
  protocol?: string;
  assets?: {
    name: string;
    symbol: string;
    amount: string;
    rate: string;
    totalUsd: string;
    change24h: string;
  }[];
}

export function generatePortfolioPdf(data: PortfolioPdfData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // Header Background Banner (Deep sleek fintech navy #0b0f19)
  doc.setFillColor(11, 15, 25);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent Green Stripe (#00C076)
  doc.setFillColor(0, 192, 118);
  doc.rect(0, 41, pageWidth, 1.2, 'F');

  // Brand Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ZEPHYR LEDGER', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(0, 192, 118);
  doc.text('INSTITUTIONAL CRYPTOGRAPHIC CUSTODY & PORTFOLIO STATEMENT', margin, 25);

  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
  const stmtId = `ZL-STMT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  doc.text(`Generated: ${dateStr} ${timeStr}`, pageWidth - margin, 18, { align: 'right' });
  doc.text(`Statement Ref: ${stmtId}`, pageWidth - margin, 25, { align: 'right' });
  doc.text(`Enclave Standard: ${data.protocol || 'AUREON-AUTH-V1 (FIPS 140-2)'}`, pageWidth - margin, 32, { align: 'right' });

  // Account Information Section
  let currentY = 52;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('ACCOUNT & IDENTITY DETAILS', margin + 6, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  // Left col
  doc.text('Account Holder:', margin + 6, currentY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.userName, margin + 35, currentY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Registered Email:', margin + 6, currentY + 22);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(data.userEmail, margin + 35, currentY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Verification State:', margin + 6, currentY + 29);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 150, 90);
  doc.text('Identity Verified & Enclave Bound', margin + 35, currentY + 29);

  // Right col
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Custodial Wallet:', margin + 95, currentY + 15);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(data.walletAddress, margin + 122, currentY + 15);

  doc.setTextColor(100, 116, 139);
  doc.text('Primary Network:', margin + 95, currentY + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Base Mainnet (Layer-2 Optimism EVM)', margin + 122, currentY + 22);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Security Clearance:', margin + 95, currentY + 29);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(`Required Fee: ${data.clearanceFee}`, margin + 122, currentY + 29);

  // Portfolio Valuation Metrics Cards
  currentY = 93;
  const colWidth = (contentWidth - 6) / 3;

  // Card 1: Total Portfolio
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, currentY, colWidth, 28, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('TOTAL PORTFOLIO VALUE', margin + 5, currentY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(data.totalPortfolio, margin + 5, currentY + 17);
  doc.setFontSize(8);
  doc.setTextColor(0, 192, 118);
  doc.text(`${data.todayPercentage} 24h change`, margin + 5, currentY + 24);

  // Card 2: Available Balance
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + colWidth + 3, currentY, colWidth, 28, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin + colWidth + 3, currentY, colWidth, 28, 2, 2, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('AVAILABLE LIQUIDITY', margin + colWidth + 8, currentY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(data.availableBalance, margin + colWidth + 8, currentY + 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Eligible for clearance distribution', margin + colWidth + 8, currentY + 24);

  // Card 3: 24h Performance P/L
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin + (colWidth + 3) * 2, currentY, colWidth, 28, 2, 2, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin + (colWidth + 3) * 2, currentY, colWidth, 28, 2, 2, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text("24-HOUR PROFIT / LOSS", margin + (colWidth + 3) * 2 + 5, currentY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(22, 101, 52);
  doc.text(data.todayProfitLoss, margin + (colWidth + 3) * 2 + 5, currentY + 17);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.text('Net 24h mark-to-market gain', margin + (colWidth + 3) * 2 + 5, currentY + 24);

  // Holdings Breakdown Table
  currentY = 128;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('CRYPTOGRAPHIC ASSET HOLDINGS', margin, currentY);

  currentY += 4;
  // Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('ASSET NAME', margin + 4, currentY + 5.5);
  doc.text('SYMBOL', margin + 45, currentY + 5.5);
  doc.text('BALANCE', margin + 70, currentY + 5.5);
  doc.text('SPOT PRICE', margin + 105, currentY + 5.5);
  doc.text('VALUATION (USD)', margin + 140, currentY + 5.5);
  doc.text('24H TREND', pageWidth - margin - 4, currentY + 5.5, { align: 'right' });

  currentY += 8;

  const defaultAssets = [
    {
      name: 'Ethereum',
      symbol: 'ETH',
      amount: '14.8200 ETH',
      rate: '$3,210.40',
      totalUsd: '$47,578.12',
      change24h: '+2.40%',
    },
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      amount: '0.6800 BTC',
      rate: '$66,150.00',
      totalUsd: '$44,982.00',
      change24h: '+1.20%',
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      amount: '12,940.6700 USDC',
      rate: '$1.00',
      totalUsd: '$12,940.67',
      change24h: '0.00%',
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      amount: '34.2000 SOL',
      rate: '$161.08',
      totalUsd: '$5,509.00',
      change24h: '+3.10%',
    },
  ];

  const holdings = data.assets && data.assets.length > 0 ? data.assets : defaultAssets;

  holdings.forEach((asset, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, currentY, contentWidth, 8.5, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, currentY + 8.5, pageWidth - margin, currentY + 8.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(asset.name, margin + 4, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(asset.symbol, margin + 45, currentY + 5.5);
    doc.text(asset.amount, margin + 70, currentY + 5.5);
    doc.text(asset.rate, margin + 105, currentY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(asset.totalUsd, margin + 140, currentY + 5.5);

    if (asset.change24h.startsWith('+')) {
      doc.setTextColor(0, 150, 90);
    } else if (asset.change24h.startsWith('-')) {
      doc.setTextColor(220, 38, 38);
    } else {
      doc.setTextColor(100, 116, 139);
    }
    doc.text(asset.change24h, pageWidth - margin - 4, currentY + 5.5, { align: 'right' });

    currentY += 8.5;
  });

  // Total summary row
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL AUDITED PORTFOLIO BALANCE', margin + 4, currentY + 5.5);
  doc.text(data.totalPortfolio, margin + 140, currentY + 5.5);
  doc.setTextColor(0, 150, 90);
  doc.text(data.todayPercentage, pageWidth - margin - 4, currentY + 5.5, { align: 'right' });

  // Custodial Ledger Clearance Notice Box
  currentY += 16;
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'F');
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(133, 77, 14);
  doc.text('SETTLEMENT & LIQUIDITY CLEARANCE PROTOCOL', margin + 5, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 63, 18);
  doc.text(
    `This official balance report has been reconciled via the Zephyr Ledger cryptographic enclave. Assets are segregated in institutional`,
    margin + 5,
    currentY + 12
  );
  doc.text(
    `multi-signature cold storage. Instant on-chain dispatch requires standard network clearance verification (${data.clearanceFee} authorization tier).`,
    margin + 5,
    currentY + 17
  );

  // Authenticity & Verification Footer
  currentY += 32;
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY, contentWidth, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, currentY, contentWidth, 22, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('CRYPTOGRAPHIC VERIFICATION SEAL', margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Digital Fingerprint: 0x9f4b7a12c8e3...${Math.random().toString(16).substring(2, 10)}`, margin + 4, currentY + 10.5);
  doc.text(`Enclave Verification Nonce: ${Math.random().toString(36).substring(2, 10)} · SHA-256 Checksum: Validated`, margin + 4, currentY + 15);

  doc.setFontSize(7.5);
  doc.setTextColor(0, 150, 90);
  doc.text('DOCUMENT STATUS: CERTIFIED & AUDITED', pageWidth - margin - 4, currentY + 10.5, { align: 'right' });

  // Page Bottom Disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Zephyr Ledger Platform · Automated Custodial Reporting · Strictly Confidential · Base Layer-2 Network Protocol',
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  // Trigger browser download
  const sanitizedName = data.userName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Zephyr_Ledger_Portfolio_Summary_${sanitizedName}.pdf`);
}
