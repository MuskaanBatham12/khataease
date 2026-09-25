"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  QrCode,
  Smartphone,
  Store,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Lock,
  Wallet,
  Users,
  Check,
} from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [demoAmount, setDemoAmount] = useState("447");
  const [isPaid, setIsPaid] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulatePayment = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setIsPaid(true);
    }, 600);
  };

  const handleResetDemo = () => {
    setIsPaid(false);
  };

  const quickAmounts = ["250", "447", "850", "1200"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-500/25 transition group-hover:scale-105">
              K
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white leading-tight">
                KhataEase
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider hidden sm:inline">
                Digital Udhaar Diary
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link
              href="/login"
              className="px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <span>Start Free</span>
              <ChevronRight className="w-4 h-4 hidden sm:inline" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 relative">
        {/* Background glow orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-40 right-10 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 sm:space-y-7 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-bold text-amber-400 uppercase tracking-widest shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Built for Indian Shopkeepers · भारत के व्यापारी</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.1] text-white tracking-tight">
              Diary band. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
                Khata shuru.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Replace your messy paper diary with a smart digital khata. Generate bills with instant UPI QR codes, track pending udhaar, and collect payments faster via WhatsApp.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2.5 text-base"
              >
                <span>Start Free, No Card Needed</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 font-bold transition flex items-center justify-center gap-2 text-base"
              >
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Login to Khata</span>
              </Link>
            </div>

            {/* Feature Highlights Pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Safe & Backed Up</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Gateway Charges</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mobile & Desktop Ready</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Right Visual (Interactive Simulator) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="lg:col-span-5 relative mx-auto w-full max-w-sm sm:max-w-md"
          >
            <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/25 via-teal-500/20 to-emerald-600/10 rounded-[2.8rem] blur-xl" />

            <div className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-5 sm:p-6 shadow-2xl overflow-hidden">
              {/* Phone Status Bar */}
              <div className="w-full h-5 mb-3 flex justify-between items-center px-2 text-slate-500">
                <span className="text-[11px] font-bold">9:41 AM</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-3.5 h-2 rounded-sm border border-slate-700" />
                </div>
              </div>

              {/* Shop Badge */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    RS
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-1">
                      Ramesh Kirana Store
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Customer: Rajesh Sharma (Sector 14)</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-800 px-2 py-0.5 rounded-md text-emerald-400 border border-slate-700">
                  #KH-1024
                </span>
              </div>

              {/* White Bill Card Inside Phone */}
              <div className="bg-white rounded-2xl p-5 shadow-lg text-slate-900 transition-all">
                {isPaid ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3 text-emerald-600 shadow-md shadow-emerald-500/20">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Payment Received
                    </span>
                    <h4 className="text-3xl font-black text-slate-900 mb-1">₹{demoAmount}.00</h4>
                    <p className="text-[11px] text-slate-500 font-mono mb-4">
                      UPI Ref: 62894109 · Bank Settled
                    </p>

                    <div className="w-full p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-semibold flex items-center justify-center gap-1.5 mb-2">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp receipt sent automatically!</span>
                    </div>
                  </motion.div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Amount Due
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Instant UPI
                      </span>
                    </div>

                    {/* Interactive editable amount */}
                    <div className="flex items-center justify-center gap-1 border-b-2 border-dashed border-slate-200 pb-2 mb-3">
                      <span className="text-2xl font-black text-slate-700">₹</span>
                      <input
                        type="text"
                        value={demoAmount}
                        onChange={(e) => setDemoAmount(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="text-3xl font-black text-slate-900 w-28 text-center focus:outline-none focus:bg-slate-50 rounded-lg py-0.5"
                        aria-label="Demo bill amount"
                      />
                    </div>

                    {/* Quick amount chips */}
                    <div className="flex items-center justify-center gap-1.5 mb-3">
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDemoAmount(amt)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition ${
                            demoAmount === amt
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>

                    {/* Crisp Vector QR Code Preview */}
                    <div className="w-36 h-36 mx-auto bg-slate-50 rounded-2xl border-2 border-slate-200 p-2 flex flex-col items-center justify-center relative shadow-inner">
                      <svg
                        viewBox="0 0 100 100"
                        className="w-full h-full text-slate-900"
                        fill="currentColor"
                      >
                        {/* Finder patterns */}
                        <rect x="5" y="5" width="26" height="26" rx="4" fill="currentColor" />
                        <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                        <rect x="13" y="13" width="10" height="10" fill="currentColor" />

                        <rect x="69" y="5" width="26" height="26" rx="4" fill="currentColor" />
                        <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                        <rect x="77" y="13" width="10" height="10" fill="currentColor" />

                        <rect x="5" y="69" width="26" height="26" rx="4" fill="currentColor" />
                        <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                        <rect x="13" y="77" width="10" height="10" fill="currentColor" />

                        {/* Data dots */}
                        <rect x="36" y="8" width="6" height="6" />
                        <rect x="48" y="14" width="6" height="6" />
                        <rect x="56" y="6" width="6" height="6" />
                        <rect x="12" y="38" width="6" height="6" />
                        <rect x="22" y="46" width="6" height="6" />
                        <rect x="36" y="36" width="28" height="28" rx="6" fill="#10b981" />
                        <rect x="70" y="42" width="6" height="6" />
                        <rect x="82" y="50" width="6" height="6" />
                        <rect x="40" y="72" width="6" height="6" />
                        <rect x="52" y="80" width="6" height="6" />
                        <rect x="64" y="68" width="6" height="6" />
                        <rect x="76" y="78" width="6" height="6" />
                        <rect x="86" y="86" width="6" height="6" />
                      </svg>
                      {/* Center UPI Mini Badge */}
                      <span className="absolute bg-white px-1.5 py-0.5 rounded text-[8px] font-black text-emerald-600 shadow-sm border border-emerald-200">
                        UPI
                      </span>
                    </div>

                    <p className="text-[10px] text-center text-slate-500 mt-2 font-medium">
                      Scan with GPay, PhonePe, Paytm or BHIM
                    </p>
                  </div>
                )}
              </div>

              {/* Action button inside phone */}
              {!isPaid ? (
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulating}
                  className="w-full mt-3.5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSimulating ? "Processing Payment..." : "Simulate Customer Scan & Pay"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetDemo}
                  className="w-full mt-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700"
                >
                  Reset Demo & Try Again
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 sm:py-24 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-full">
              Simple 3-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
              How KhataEase Works
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              No training required. Designed for busy shop counters and fast checkout.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                icon: Store,
                title: "Add Customer",
                desc: "Quickly save customer mobile number and past balance in seconds.",
                highlight: "Zero paperwork",
              },
              {
                step: "02",
                icon: BookOpen,
                title: "Generate Quick Bill",
                desc: "Add items or enter total. An instant UPI QR code with exact amount is generated.",
                highlight: "Dynamic QR",
              },
              {
                step: "03",
                icon: Smartphone,
                title: "Collect via WhatsApp",
                desc: "Send digital bill link on WhatsApp. Customer pays directly to your bank account.",
                highlight: "Instant receipt",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group relative p-7 sm:p-8 rounded-3xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center transition group-hover:scale-110 group-hover:bg-emerald-500/20">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <span className="text-3xl font-black text-slate-800 group-hover:text-slate-700 transition">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{item.desc}</p>
                <span className="inline-flex text-[11px] font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-900/50">
                  ✓ {item.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Why Indian Shopkeepers Choose KhataEase
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-2">
              Everything you need to recover udhaar 3x faster without awkward phone calls.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: QrCode,
                title: "Instant UPI Dynamic QR",
                desc: "Customers scan directly with GPay, PhonePe, or Paytm. Exact bill amount is pre-filled.",
              },
              {
                icon: MessageSquare,
                title: "WhatsApp Udhaar Reminders",
                desc: "Send polite automated reminder messages with a secure payment link in 1 tap.",
              },
              {
                icon: Wallet,
                title: "Clear Pending Balances",
                desc: "Never calculate by hand again. Real-time balance updates for each customer.",
              },
              {
                icon: TrendingUp,
                title: "Business Insights",
                desc: "Track daily sales, monthly collections, and your top udhaar customers on your dashboard.",
              },
              {
                icon: Users,
                title: "Customer Udhaar Profile",
                desc: "View full transaction history, past payments, and print PDF receipts anytime.",
              },
              {
                icon: ShieldCheck,
                title: "Bank-Grade Cloud Safety",
                desc: "Your data is automatically backed up. Even if your phone is lost, your khata is 100% safe.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400 mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pre-Footer Call to Action */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-800/40 p-8 sm:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Ready to stop losing money on udhaar?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Create your free account today. Start billing in under 2 minutes with no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold shadow-xl shadow-emerald-500/25 transition text-base flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold transition text-base"
            >
              Already Registered? Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800/80 bg-slate-950 text-center text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
              K
            </div>
            <span className="font-extrabold text-white text-sm">KhataEase</span>
          </div>

          <div className="flex gap-6 text-xs font-semibold">
            <Link href="/login" className="hover:text-emerald-400 transition">
              Login
            </Link>
            <Link href="/signup" className="hover:text-emerald-400 transition">
              Create Account
            </Link>
            <span className="text-slate-600">English & हिंदी</span>
          </div>

          <p className="text-xs text-slate-500">
            KhataEase © 2026. Built with pride for Indian Shopkeepers.
          </p>
        </div>
      </footer>
    </div>
  );
}
