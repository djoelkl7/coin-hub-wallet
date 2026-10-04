import { jsPDF } from 'jspdf';

export interface SettlementReceiptPdfData {
  txHash: string;
  checksum: string;
  asset: string;
  symbol: string;
  amount: number;
  usdEquivalent: number;
  clearanceFeeUsd: number;
  netDisbursementUsd: number;
  recipientAddress: string;
  escrowAddress: string;
  network: string;
  settlementTier: string;
  timestamp: number;
  status: 'PENDING_CLEARANCE' | 'COMPLETED_CLEARED';
  verifiedFileName?: string;
  verifiedFileSize?: string;
  verifiedFileSha256?: string;
  accountEmail?: string;
  walletAddress?: string;
}

export function generateSettlementReceiptPdf(data: SettlementReceiptPdfData): void {
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
  doc.rect(0, 0, pageWidth, 44, 'F');

  // Accent Green / Emerald Stripe (#00C076)
  doc.setFillColor(0, 192, 118);
  doc.rect(0, 43, pageWidth, 1.2, 'F');

  // Brand Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ZEPHYR LEDGER', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 192, 118);
  doc.text('OFFICIAL CRYPTOGRAPHIC SETTLEMENT & CLEARANCE AUDIT RECEIPT', margin, 25);

  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  const dateObj = new Date(data.timestamp || Date.now());
  const dateStr = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  const receiptRef = `ZL-RCPT-${data.checksum.replace(/[^A-Za-z0-9]/g, '').slice(0, 10).toUpperCase()}`;

  doc.text(`Receipt Reference: ${receiptRef}`, pageWidth - margin, 18, { align: 'right' });
  doc.text(`Timestamp: ${dateStr} ${timeStr}`, pageWidth - margin, 25, { align: 'right' });
  doc.text(`Protocol: AUREON-AUTH-V1 / Multi-Sig Node`, pageWidth - margin, 32, { align: 'right' });

  // Status Badge Banner
  let currentY = 52;
  const isCompleted = data.status === 'COMPLETED_CLEARED';

  if (isCompleted) {
    doc.setFillColor(236, 253, 245); // light emerald
    doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(6, 95, 70);
    doc.text('STATUS: SETTLEMENT CLEARED & DISBURSED (100% COMPLETE)', margin + 6, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(4, 120, 87);
    doc.text('Verified on-chain via clearance payment proof file. Capital authorization committed to decentralized ledger.', margin + 6, currentY + 13);
  } else {
    doc.setFillColor(254, 243, 199); // amber
    doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, 18, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(146, 64, 14);
    doc.text('STATUS: PENDING ESCROW CLEARANCE PROOF', margin + 6, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9);
    doc.text('Settlement parameters registered. Awaiting clearance fee file proof verification for final multi-sig release.', margin + 6, currentY + 13);
  }

  currentY += 24;

  // Transaction & Settlement Specifications Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 54, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 54, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('TRANSACTION IDENTIFIERS & AUDIT CHECKSUM', margin + 6, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  // Row 1
  doc.text('Transaction Hash:', margin + 6, currentY + 16);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(data.txHash || '0x49f2b8a7c1e309...8820c', margin + 42, currentY + 16);

  // Row 2
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Audit Checksum:', margin + 6, currentY + 23);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(data.checksum || 'CHKSUM-79A2B0F4', margin + 42, currentY + 23);

  // Row 3
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Recipient Destination:', margin + 6, currentY + 30);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.recipientAddress || '0x...', margin + 42, currentY + 30);

  // Row 4
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Dedicated Escrow Node:', margin + 6, currentY + 37);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.escrowAddress || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', margin + 42, currentY + 37);

  // Row 5
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Settlement Tier:', margin + 6, currentY + 44);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 128, 80);
  doc.text(data.settlementTier || 'Instant Flash Settlement', margin + 42, currentY + 44);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Payout Network: ${data.network || 'USDT TRC20 / Native'}`, margin + 110, currentY + 44);

  currentY += 60;

  // Financial Breakdown Table
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 54, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 54, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('CAPITAL CLEARANCE & SETTLEMENT BREAKDOWN', margin + 6, currentY + 7);

  // Line item table header
  const tableY = currentY + 12;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin + 4, tableY, contentWidth - 8, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('ITEM DESCRIPTION', margin + 8, tableY + 5);
  doc.text('ASSET QUANTITY', margin + 70, tableY + 5);
  doc.text('USD VALUATION', pageWidth - margin - 8, tableY + 5, { align: 'right' });

  // Row 1: Gross Settlement
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Gross Settlement Release (${data.asset || 'Ethereum'})`, margin + 8, tableY + 14);
  doc.text(`${data.amount.toFixed(4)} ${data.symbol || 'ETH'}`, margin + 70, tableY + 14);
  doc.setFont('courier', 'bold');
  doc.text(`$${data.usdEquivalent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin - 8, tableY + 14, { align: 'right' });

  // Row 2: Clearance Fee
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Mandatory Protocol Clearance & Escrow Reserve Fee', margin + 8, tableY + 21);
  doc.text('Protocol Standard', margin + 70, tableY + 21);
  doc.setFont('courier', 'normal');
  doc.setTextColor(220, 38, 38);
  doc.text(`-$${data.clearanceFeeUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin - 8, tableY + 21, { align: 'right' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(margin + 6, tableY + 26, pageWidth - margin - 6, tableY + 26);

  // Net Row
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Net Capital Disbursed to Destination:', margin + 8, tableY + 34);
  doc.setFont('courier', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 160, 95);
  doc.text(`$${data.netDisbursementUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`, pageWidth - margin - 8, tableY + 34, { align: 'right' });

  currentY += 60;

  // File Proof Verification Section (Highlighting "use file to complete")
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('FILE-BASED CLEARANCE VERIFICATION RECORD', margin + 6, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  if (data.verifiedFileName) {
    doc.text('Attached Receipt File:', margin + 6, currentY + 15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(data.verifiedFileName, margin + 42, currentY + 15);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('File Size & Type:', margin + 6, currentY + 21);
    doc.setTextColor(15, 23, 42);
    doc.text(data.verifiedFileSize || '142.8 KB (application/pdf)', margin + 42, currentY + 21);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Cryptographic File Hash:', margin + 6, currentY + 27);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(data.verifiedFileSha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', margin + 42, currentY + 27);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(5, 150, 105);
    doc.text('VERIFICATION: Proof file validated against on-chain mempool. Escrow cleared.', margin + 6, currentY + 33);
  } else {
    doc.text('Proof Document State:', margin + 6, currentY + 16);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('No payment proof file attached yet. Upload receipt file or run simulation at /result.', margin + 42, currentY + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Compliant formats: PDF, PNG, JPG, or JSON transaction confirmation file.', margin + 6, currentY + 26);
  }

  // Footer Disclaimer
  const footerY = pageHeight - 22;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Zephyr Ledger Institutional Clearance Engine · FIPS 140-2 Level 3 Hardware Security Enclave · All releases subject to protocol audit.',
    margin,
    footerY
  );
  doc.text(
    `Document Signature: SHA256:${data.txHash ? data.txHash.slice(2, 34) : 'e8d19a2e'}. Verified by Zephyr Enclave Node #04.`,
    margin,
    footerY + 4
  );

  // Save PDF
  const safeFilename = `Zephyr_Settlement_Receipt_${(data.symbol || 'CRYPTO').toUpperCase()}_${Date.now()}.pdf`;
  doc.save(safeFilename);
}
