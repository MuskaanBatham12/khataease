"use client";

import { useEffect, useState, use } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { formatRupees, formatDate, buildUpiLink, generateQrDataUrl } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  IndianRupee,
  Share2,
  Printer,
  Loader2,
  ArrowLeft,
  Building2,
  User,
  Calendar,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BillData {
  id: string;
  number: string;
  total: number;
  paidAmount: number;
  status: "UNPAID" | "PARTIAL" | "PAID";
  publicToken: string;
  createdAt: string;
  shop: {
    shopName: string;
    ownerName: string;
    phone: string;
    upiId?: string;
  };
  customer: {
    id: string;
    name: string;
    phone: string;
    address?: string;
  };
  items: { id: string; name: string; qty: number; price: number }[];
  ledgers: { type: string; amount: number; createdAt: string; note?: string }[];
}

const UPI_ICONS = ["phonepe", "googlepay", "paytm", "bhim"];

export default function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { showToast } = useToast();

  const [bill, setBill] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [showPaidStamp, setShowPaidStamp] = useState(false);

  // Partial Payment modal
  const [isPartialOpen, setIsPartialOpen] = useState(false);
  const [partialAmount, setPartialAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const fetchBill = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bills/${id}`);
      const data = await res.json();
      if (res.ok) {
        setBill(data.bill);
        // Generate QR if shop has UPI ID
        if (data.bill.shop.upiId && data.bill.status !== "PAID") {
          const upiLink = buildUpiLink({
            upiId: data.bill.shop.upiId,
            shopName: data.bill.shop.shopName,
            amountPaise: data.bill.total - data.bill.paidAmount,
            billNumber: data.bill.number,
          });
          const qr = await generateQrDataUrl(upiLink);
          setQrDataUrl(qr);
        }
      } else {
        showToast(data.error || "Bill not found", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [id]);

  const handleMarkAsPaid = async () => {
    if (!bill) return;
    const remaining = bill.total - bill.paidAmount;
    if (remaining <= 0) {
      showToast("Bill is already fully paid", "info");
      return;
    }

    try {
      const res = await fetch(`/api/bills/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: bill.customer.id,
          amount: remaining,
          note: "Marked as fully paid",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to mark as paid", "error");
        return;
      }

      setShowPaidStamp(true);
      fetchBill();
      setTimeout(() => setShowPaidStamp(false), 4000);
    } catch {
      showToast("Error recording payment", "error");
    }
  };

  const handlePartialPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill) return;
    const paise = Math.round(parseFloat(partialAmount) * 100);
    if (isNaN(paise) || paise < 100) {
      showToast("Enter a valid amount (min ₹1)", "error");
      return;
    }

    try {
      setSubmittingPayment(true);
      const res = await fetch(`/api/bills/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: bill.customer.id,
          amount: paise,
          note: paymentNote || "Partial payment",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to record payment", "error");
        return;
      }

      showToast(`${formatRupees(paise)} payment recorded!`, "success");
      setIsPartialOpen(false);
      setPartialAmount("");
      setPaymentNote("");
      fetchBill();
    } catch {
      showToast("Error recording payment", "error");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleWhatsApp = () => {
    if (!bill) return;
    const remaining = bill.total - bill.paidAmount;
    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/b/${bill.publicToken}`;
    const text = `Namaste ${bill.customer.name} ji 🙏\nBill *#${bill.number}* from *${bill.shop.shopName}*\nTotal: *${formatRupees(bill.total)}*\nPending: *${formatRupees(remaining)}*\nView & Pay: ${publicUrl}\n\nThank you! 🙏`;
    const phone = `91${bill.customer.phone.replace(/\D/g, "").slice(-10)}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </LayoutShell>
    );
  }

  if (!bill) return null;

  const remaining = bill.total - bill.paidAmount;
  const statusColors = {
    PAID: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800",
    PARTIAL: "text-amber-500 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800",
    UNPAID: "text-red-500 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800",
  };

  return (
    <LayoutShell>
      {/* Print Styles */}
      <style global jsx>{`
        @media print {
          .no-print { display: none !important; }
          .print-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto space-y-5">
        {/* Back Navigation */}
        <div className="flex items-center gap-3 no-print">
          <Link
            href={`/customers/${bill.customer.id}`}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Khata
          </Link>
        </div>

        {/* Paid Success Stamp */}
        <AnimatePresence>
          {showPaidStamp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-5 rounded-3xl bg-emerald-500 text-white flex items-center gap-4 shadow-xl shadow-emerald-500/30"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", damping: 10 }}
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <div>
                <h3 className="text-xl font-black">{formatRupees(remaining)} Received! 🎉</h3>
                <p className="text-emerald-100 text-sm">Bill #{bill.number} is now fully paid</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bill Header Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm print-card">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-emerald-500" />
                <span className="font-black text-slate-900 dark:text-white text-lg">{bill.shop.shopName}</span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(bill.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-500 dark:text-slate-400">#{bill.number}</span>
              <div className={`mt-1 px-3 py-1 rounded-full text-xs font-black border ${statusColors[bill.status]}`}>
                {bill.status}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">{bill.customer.name}</p>
              <p className="text-xs text-slate-400">{bill.customer.phone}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Items</p>
            {bill.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <span className="text-slate-700 dark:text-slate-300">
                  {item.name} <span className="text-slate-400 text-xs">×{item.qty}</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatRupees(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>

          {/* Total Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Bill Total</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatRupees(bill.total)}</span>
            </div>
            {bill.paidAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Paid</span>
                <span className="font-bold text-emerald-500">-{formatRupees(bill.paidAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="font-black text-slate-900 dark:text-white">Remaining (Udhaar)</span>
              <span className={`font-black text-lg ${remaining > 0 ? "text-red-500" : "text-emerald-500"}`}>
                {formatRupees(remaining)}
              </span>
            </div>
          </div>
        </div>

        {/* QR Payment Screen (Hero) */}
        {bill.status !== "PAID" && bill.shop.upiId && qrDataUrl && (
          <div className="p-6 rounded-3xl bg-slate-900 dark:bg-slate-950 border border-slate-800 shadow-xl text-center space-y-4">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Amount to Pay</p>
              <p className="text-5xl font-black text-white">{formatRupees(remaining)}</p>
              <p className="text-slate-400 text-sm mt-1">For Bill #{bill.number} · {bill.shop.shopName}</p>
            </div>

            {/* QR Code */}
            <div className="relative inline-block">
              <div className="p-4 rounded-2xl bg-white shadow-2xl inline-block">
                <Image
                  src={qrDataUrl}
                  alt="UPI QR Code"
                  width={240}
                  height={240}
                  className="block"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
            </div>

            <p className="text-slate-400 text-sm font-medium">Scan with any UPI app to pay instantly</p>

            {/* UPI App Row */}
            <div className="flex items-center justify-center gap-3">
              {["PhonePe", "G Pay", "Paytm", "BHIM"].map((app) => (
                <div
                  key={app}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300"
                >
                  {app}
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500">
              UPI ID: <span className="text-slate-300 font-mono font-semibold">{bill.shop.upiId}</span>
            </p>
          </div>
        )}

        {/* No UPI ID warning */}
        {!bill.shop.upiId && bill.status !== "PAID" && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-medium">
            💡 Add your UPI ID in{" "}
            <Link href="/settings" className="underline font-bold">Settings</Link>{" "}
            to show a payment QR code here.
          </div>
        )}

        {/* Action Buttons */}
        {bill.status !== "PAID" && (
          <div className="grid grid-cols-2 gap-3 no-print">
            <button
              onClick={handleMarkAsPaid}
              className="col-span-2 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-6 h-6" />
              Mark as Fully Paid
            </button>

            <button
              onClick={() => setIsPartialOpen(true)}
              className="py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
            >
              <IndianRupee className="w-4 h-4" />
              Partial Payment
            </button>

            <button
              onClick={handleWhatsApp}
              className="py-3.5 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 font-bold text-sm hover:bg-green-500/20 transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </button>
          </div>
        )}

        {/* Print & Share Row */}
        <div className="flex gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Bill
          </button>
          <Link
            href={`/b/${bill.publicToken}`}
            target="_blank"
            className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Customer View
          </Link>
        </div>

        {/* Add to Udhaar note (for PAID bills) */}
        {bill.status === "PAID" && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p className="font-black text-emerald-700 dark:text-emerald-400">Bill Fully Paid!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500">
                {formatRupees(bill.total)} received from {bill.customer.name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Partial Payment Modal */}
      <Modal isOpen={isPartialOpen} onClose={() => setIsPartialOpen(false)} title="Record Partial Payment">
        <form onSubmit={handlePartialPayment} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between text-sm">
            <span className="text-slate-500">Remaining Balance</span>
            <span className="font-black text-red-500">{formatRupees(remaining)}</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Payment Amount (₹)
            </label>
            <input
              type="number"
              step="any"
              inputMode="numeric"
              placeholder="e.g. 200"
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[100, 200, 500].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setPartialAmount(chip.toString())}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-xs font-bold transition"
              >
                ₹{chip}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPartialAmount((remaining / 100).toString())}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-xs font-bold border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition"
            >
              Full ({formatRupees(remaining)})
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Note</label>
            <input
              type="text"
              placeholder="e.g. Cash / UPI payment"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={submittingPayment}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg transition flex items-center justify-center gap-2"
          >
            {submittingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Payment"}
          </button>
        </form>
      </Modal>
    </LayoutShell>
  );
}
