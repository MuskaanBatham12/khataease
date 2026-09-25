"use client";

import { useEffect, useState } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { useToast } from "@/components/Toast";
import { Sparkles, Check, Loader2, ShieldCheck, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Script from "next/script";

export default function BillingPage() {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.shop) setShop(data.shop);
        setLoading(false);
      });
  }, []);

  const handleUpgrade = async () => {
    setProcessing(true);
    try {
      const res = await fetch("/api/payments/create-order", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to initiate payment", "error");
        setProcessing(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: "KhataEase Pro",
        description: "Monthly Pro Subscription",
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            if (verifyRes.ok) {
              showToast("Upgrade successful! Welcome to Pro.", "success");
              router.refresh();
              setTimeout(() => window.location.reload(), 1500);
            } else {
              showToast("Payment verification failed", "error");
            }
          } catch {
            showToast("Network error verifying payment", "error");
          }
        },
        prefill: {
          name: shop.ownerName,
          contact: shop.phone,
        },
        theme: {
          color: "#10b981",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        showToast(response.error.description || "Payment failed", "error");
      });
      rzp.open();
    } catch (err) {
      showToast("Network error", "error");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </LayoutShell>
    );
  }

  const isPro = shop?.plan === "PRO";

  return (
    <LayoutShell>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Start for free, upgrade when you need to grow.
          </p>
        </div>

        {isPro ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 md:p-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl text-white shadow-2xl flex flex-col items-center text-center max-w-2xl mx-auto relative overflow-hidden"
          >
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 shadow-inner backdrop-blur-sm">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black mb-2">You are on KhataEase PRO</h2>
            <p className="text-emerald-50 text-lg mb-8 max-w-sm">
              Enjoy unlimited bills, customers, WhatsApp reminders, and priority features.
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 rounded-full text-sm font-bold backdrop-blur-md">
              <Sparkles className="w-4 h-4" /> Subscription Active
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 items-start">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Free Plan</h3>
              <div className="mb-6">
                <span className="text-4xl font-black text-slate-900 dark:text-white">₹0</span>
                <span className="text-slate-500"> / forever</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Up to 15 Customers", "Up to 30 Bills / month", "Standard UPI QR Generation", "Basic Dashboard Analytics"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <div className="w-full py-3 text-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-sm">
                Current Plan
              </div>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative p-6 md:p-8 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-emerald-500/30 text-white shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
                Recommended
              </div>
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />
              
              <h3 className="text-xl font-bold text-amber-400 mb-2 flex items-center gap-2">
                KhataEase Pro <Sparkles className="w-5 h-5" />
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-black">₹199</span>
                <span className="text-slate-400"> / month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Unlimited Customers", "Unlimited Bills", "1-Tap WhatsApp Payment Reminders", "Excel / CSV Data Export", "Priority Support"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                onClick={handleUpgrade}
                disabled={processing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                Upgrade Now
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
