import { jsPDF } from 'jspdf';
import type { Invoice, SellerProfile } from '../types/billing.ts';
import { amountInWordsINR } from './gstCalculator.ts';

function formatPdfCurrency(amount: number): string {
  return `INR ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function downloadInvoicePdf(invoice: Invoice, seller: SellerProfile): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 16;

  // Header band
  doc.setFillColor(11, 31, 58); // Navy #0B1F3A
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(seller.businessName, 14, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`GSTIN: ${seller.gstin}  |  State: ${seller.state} (${seller.stateCode})`, 14, 19);
  doc.text(`${seller.address}, ${seller.city} - ${seller.pincode}`, 14, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TAX INVOICE', pageWidth - 14, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`# ${invoice.invoiceNumber}`, pageWidth - 14, 20, { align: 'right' });
  doc.text(`Status: ${invoice.paymentStatus}`, pageWidth - 14, 25, { align: 'right' });

  y = 38;
  doc.setTextColor(15, 23, 42);

  // Bill To & Invoice Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BILL TO', 14, y);
  doc.text('INVOICE DETAILS', 120, y);

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(invoice.customerName, 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Issue Date: ${invoice.issueDate}`, 120, y);

  y += 5;
  doc.text(
    invoice.customerGstin ? `GSTIN: ${invoice.customerGstin}` : 'GSTIN: Unregistered (B2C)',
    14,
    y
  );
  doc.text(`Due Date: ${invoice.dueDate}`, 120, y);

  y += 5;
  const addressLines = doc.splitTextToSize(
    `${invoice.customerAddress}, ${invoice.customerState}`,
    92
  );
  doc.text(addressLines, 14, y);
  doc.text(
    `Supply: ${invoice.supplyType === 'INTRA_STATE' ? 'Intra-State (CGST+SGST)' : 'Inter-State (IGST)'}`,
    120,
    y
  );

  y += Math.max(addressLines.length * 4.5, 6) + 6;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('#', 16, y + 5.5);
  doc.text('Item & HSN', 24, y + 5.5);
  doc.text('Qty', 92, y + 5.5, { align: 'right' });
  doc.text('Rate', 114, y + 5.5, { align: 'right' });
  doc.text('Disc%', 128, y + 5.5, { align: 'right' });
  doc.text('Taxable', 150, y + 5.5, { align: 'right' });
  doc.text('GST', 168, y + 5.5, { align: 'right' });
  doc.text('Total', pageWidth - 16, y + 5.5, { align: 'right' });

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  invoice.items.forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}`, 16, y + 3);
    const nameStr = item.productName.length > 36 ? `${item.productName.slice(0, 33)}...` : item.productName;
    doc.text(nameStr, 24, y + 3);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`HSN: ${item.hsnCode} · ${item.category}`, 24, y + 7);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.text(`${item.quantity} ${item.unit}`, 92, y + 3, { align: 'right' });
    doc.text(item.unitPrice.toFixed(2), 114, y + 3, { align: 'right' });
    doc.text(`${item.discountPercent}%`, 128, y + 3, { align: 'right' });
    doc.text(item.taxableValue.toFixed(2), 150, y + 3, { align: 'right' });
    doc.text(`${item.gstRate}%`, 168, y + 3, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(item.lineTotal.toFixed(2), pageWidth - 16, y + 3, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    y += 10.5;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y - 1.5, pageWidth - 14, y - 1.5);
  });

  y += 6;
  // Totals summary box
  const summaryX = 118;
  doc.setFontSize(9);
  doc.text('Gross Subtotal:', summaryX, y);
  doc.text(formatPdfCurrency(invoice.subtotal), pageWidth - 14, y, { align: 'right' });
  y += 5;

  doc.text('Total Discount:', summaryX, y);
  doc.text(`- ${formatPdfCurrency(invoice.totalDiscount)}`, pageWidth - 14, y, { align: 'right' });
  y += 5;

  doc.text('Taxable Value:', summaryX, y);
  doc.text(formatPdfCurrency(invoice.taxableAmount), pageWidth - 14, y, { align: 'right' });
  y += 5;

  if (invoice.supplyType === 'INTRA_STATE') {
    doc.text('CGST:', summaryX, y);
    doc.text(formatPdfCurrency(invoice.cgstTotal), pageWidth - 14, y, { align: 'right' });
    y += 5;
    doc.text('SGST:', summaryX, y);
    doc.text(formatPdfCurrency(invoice.sgstTotal), pageWidth - 14, y, { align: 'right' });
    y += 5;
  } else {
    doc.text('IGST:', summaryX, y);
    doc.text(formatPdfCurrency(invoice.igstTotal), pageWidth - 14, y, { align: 'right' });
    y += 5;
  }

  doc.text('Round Off:', summaryX, y);
  doc.text(formatPdfCurrency(invoice.roundOff), pageWidth - 14, y, { align: 'right' });
  y += 6;

  doc.setFillColor(5, 150, 105); // Emerald #059669
  doc.rect(summaryX - 4, y - 4, pageWidth - 14 - (summaryX - 4), 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('GRAND TOTAL', summaryX, y + 2);
  doc.text(formatPdfCurrency(invoice.grandTotal), pageWidth - 16, y + 2, { align: 'right' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const words = amountInWordsINR(invoice.grandTotal);
  doc.text(`Amount in Words: ${words}`, 14, y - 12);

  y += 16;
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Details for Payment', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${seller.bankName}  |  A/C: ${seller.accountNumber}  |  IFSC: ${seller.ifscCode}`,
    14,
    y + 5
  );

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Generated by BillBook GST Billing Software (Synthetic Demo Dataset — Deterministic Tax Engine)',
    14,
    285
  );

  doc.save(`${invoice.invoiceNumber}.pdf`);
}

export function exportCsvFile(filename: string, headers: string[], rows: Array<Array<string | number>>): void {
  const escape = (val: string | number): string => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvContent = [
    headers.map(escape).join(','),
    ...rows.map((row) => row.map(escape).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
