import QRCode from "qrcode";

/**
 * Format paise (integer) to Indian Rupee string format
 * e.g. 12500000 -> "₹1,25,000"
 */
export function formatRupees(paise: number, showDecimals: boolean = false): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(rupees);
}

/**
 * Format date in Indian friendly format
 */
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Build standard UPI payment deep link
 */
export function buildUpiLink(params: {
  upiId: string;
  shopName: string;
  amountPaise: number;
  billNumber: string;
}): string {
  const amountRupees = (params.amountPaise / 100).toFixed(2);
  const pa = encodeURIComponent(params.upiId);
  const pn = encodeURIComponent(params.shopName);
  const am = encodeURIComponent(amountRupees);
  const tn = encodeURIComponent(`Bill ${params.billNumber}`);

  return `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=INR&tn=${tn}`;
}

/**
 * Generate Data URL string for QR Code
 */
export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 2,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("QR Code generation error:", err);
    return "";
  }
}
