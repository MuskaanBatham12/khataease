"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, X, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  limitType?: "CUSTOMERS" | "BILLS" | "WHATSAPP" | "EXPORT";
}

export function UpgradeModal({ isOpen, onClose, message, limitType }: UpgradeModalProps) {
  const router = useRouter();

  const handleUpgradeClick = () => {
    onClose();
    router.push("/billing");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-6 border border-emerald-500/30 text-white shadow-2xl overflow-hidden"
          >
            {/* Glowing Accent */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/50 hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6 pt-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-400 text-slate-950 font-bold mb-4 shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <span className="block text-xs uppercase tracking-widest font-semibold text-amber-400 mb-1">
                Unlock KhataEase Pro
              </span>
              <h2 className="text-2xl font-black text-white">Upgrade to Pro Plan</h2>
              <p className="text-sm text-slate-300 mt-2">
                {message || "You have reached your Free plan limit. Upgrade to Pro for unlimited growth!"}
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-3 bg-slate-800/60 backdrop-blur rounded-2xl p-4 border border-slate-700/50 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Unlimited Customers & Bills</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>1-Tap WhatsApp Payment Reminders</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Excel / CSV Data Export</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="font-semibold text-amber-300">Just ₹199 / month (Cancel anytime)</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleUpgradeClick}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/25 transition transform active:scale-98 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 fill-current" />
                Upgrade to Pro (₹199/mo)
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition font-medium"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
