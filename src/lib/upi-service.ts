// UPI Payment Service
// Generates UPI string and QR code for payments

export interface UPIPaymentDetails {
  upiId: string;
  payeeName: string;
  amount: number;
  transactionRef: string;
  description?: string;
}

/**
 * Generate UPI string for QR code
 * Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&tr=REF&tn=DESC
 */
export function generateUPIString(details: UPIPaymentDetails): string {
  const params = new URLSearchParams({
    pa: details.upiId,
    pn: encodeURIComponent(details.payeeName),
    am: details.amount.toString(),
    tr: details.transactionRef,
    tn: details.description || "BizFlow POS Payment",
  });

  return `upi://pay?${params.toString()}`;
}

/**
 * Generate transaction reference ID
 */
export function generateTransactionRef(invoiceNumber: string): string {
  const timestamp = new Date().getTime().toString().slice(-6);
  return `${invoiceNumber}-${timestamp}`;
}

/**
 * Format amount for UPI (maximum 2 decimal places)
 */
export function formatUPIAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Validate UPI ID format
 */
export function isValidUPIId(upiId: string): boolean {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return upiRegex.test(upiId);
}
