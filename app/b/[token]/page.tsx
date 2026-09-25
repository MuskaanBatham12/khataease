"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { formatRupees, buildUpiLink, generateQrDataUrl, formatDate } from "@/lib/format";
import { Smartphone, CheckCircle2, Store, User, FileText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PublicBillPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    async function fetchBill() {
      try {
        const res = await fetch(`/api/b/${token}`);
        if (!res.ok) {
          setError("Bill not found or link expired");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setBill(data.bill);

        const remaining = data.bill.total - data.bill.paidAmount;
        
        // Generate QR code if there's a remaining amount and shop has UPI
        if (remaining > 0 && data.bill.shop.upiId) {
          const upiLink = buildUpiLink({
            upiId: data.bill.shop.upiId,
            shopName: data.bill.shop.shopName,
            amountPaise: remaining,
            billNumber: data.bill.number,
          });
          const qr = await generateQrDataUrl(upiLink);
          setQrDataUrl(qr);
        }
      } catch (err) {
        console.error("Error fetching bill:", err);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    fetchBill();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{error}</h2>
          <p className="text-slate-500 mt-2">Please ask the shopkeeper to share the link again.</p>
        </div>
      </div>
    );
  }

  const remaining = bill.total - bill.paidAmount;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-emerald-500 selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <div className="bg-emerald-500 p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black">{bill.shop.shopName}</h1>
          <p className="text-emerald-100 font-medium opacity-90">{bill.shop.phone}</p>
        </div>

        {/* Bill Info */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Billed To</p>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                <User className="w-4 h-4 text-emerald-500" />
                {bill.customer.name}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {formatDate(bill.createdAt)}
              </p>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Bill Items</h3>
            <div className="space-y-3">
              {bill.items.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.qty} x {formatRupees(item.price)}</p>
                  </div>
                  <p className="font-bold text-slate-900 dark:text-white">{formatRupees(item.qty * item.price)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Total Amount</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatRupees(bill.total)}</span>
            </div>
            {bill.paidAmount > 0 && (
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Paid Amount</span>
                <span className="font-semibold text-emerald-500">-{formatRupees(bill.paidAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Pending Balance</span>
              <span className={`text-xl font-black ${remaining > 0 ? "text-red-500" : "text-emerald-500"}`}>
                {formatRupees(remaining)}
              </span>
            </div>
          </div>

          {/* QR Code Section */}
          {remaining > 0 ? (
            qrDataUrl ? (
              <div className="mt-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Scan & Pay</p>
                <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                  <Image src={qrDataUrl} alt="Pay via UPI" width={200} height={200} className="block" />
                </div>
                <div className="flex items-center justify-center gap-2 mt-4 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-sm">Pay using any UPI App</span>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800/50">
                <p className="text-sm font-medium">Please pay at the shop counter.</p>
              </div>
            )
          ) : (
            <div className="mt-8 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
              <p className="font-black text-emerald-700 dark:text-emerald-400">Bill Fully Paid!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Thank you for your payment.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 text-center border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
            Powered by KhataEase <ArrowRight className="w-3 h-3" />
          </p>
        </div>
      </motion.div>
    </div>
  );
}
