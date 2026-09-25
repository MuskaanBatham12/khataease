"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, CheckCircle2, ChevronRight, QrCode, Smartphone, Store, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";

export default function LandingPage() {
  const [demoAmount, setDemoAmount] = useState("450");
  const [showTick, setShowTick] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-white shadow-lg shadow-emerald-500/20">
              K
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">KhataEase</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/20 transition active:scale-95">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Zap className="w-4 h-4" /> Built for Indian Shopkeepers
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] text-white">
              Diary band. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Khata shuru.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
              Replace your messy paper diary with a smart digital khata. Generate bills with instant UPI QR codes, track pending udhaar, and collect payments faster via WhatsApp.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/signup" className="px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-xl shadow-emerald-500/20 transition active:scale-95 flex items-center gap-2">
                Start Free, No Card Needed <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-2 pt-2">
              <ShieldCheck className="w-4 h-4" /> 100% Secure & Data Backed Up
            </p>
          </motion.div>

          {/* Interactive Hero Visual */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="relative mx-auto w-full max-w-md perspective-1000">
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-[3rem] blur-2xl" />
            
            <div className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden">
              {/* Phone Status Bar */}
              <div className="w-full h-6 mb-4 flex justify-between items-center px-2">
                <span className="text-[10px] font-bold text-slate-500">9:41</span>
                <div className="flex gap-1.5"><div className="w-3 h-3 bg-slate-700 rounded-full"></div><div className="w-3 h-3 bg-slate-700 rounded-full"></div></div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white">Ramesh Store</h3>
                <p className="text-xs text-slate-400">Bill #KH-1024</p>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-inner text-center relative">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Amount Due</p>
                
                {showTick ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center justify-center h-48">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-2" />
                    <p className="font-black text-emerald-600 text-xl">₹{demoAmount} Received</p>
                  </motion.div>
                ) : (
                  <>
                    <input 
                      type="text" 
                      value={demoAmount} 
                      onChange={(e) => setDemoAmount(e.target.value)}
                      className="text-4xl font-black text-slate-900 w-full text-center focus:outline-none mb-6 border-b-2 border-dashed border-slate-200 pb-2"
                    />
                    <div className="w-40 h-40 mx-auto bg-slate-100 rounded-2xl border-4 border-slate-50 flex items-center justify-center p-2 mb-4">
                      {/* Fake QR */}
                      <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg')] bg-cover opacity-80" />
                    </div>
                  </>
                )}
              </div>

              {!showTick && (
                <button 
                  onClick={() => setShowTick(true)}
                  className="w-full mt-4 py-3 rounded-xl bg-slate-800 text-emerald-400 font-bold hover:bg-slate-700 transition border border-emerald-500/30"
                >
                  Simulate Payment
                </button>
              )}
              {showTick && (
                <button 
                  onClick={() => setShowTick(false)}
                  className="w-full mt-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
                >
                  Reset Demo
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-16">How KhataEase Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Store, title: "1. Add Customer", desc: "Quickly save customer details and their opening balance." },
              { icon: BookOpen, title: "2. Generate Bill", desc: "Add items, total amount, and a UPI QR is instantly generated." },
              { icon: Smartphone, title: "3. Collect via WhatsApp", desc: "Send the bill link via WhatsApp and get paid directly to your bank." }
            ].map((step, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-950 border border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 text-center text-slate-500">
        <p className="font-semibold text-slate-400 mb-2">KhataEase © 2026. Made for Bharat.</p>
        <p className="text-sm">Stop chasing payments. Start growing your business.</p>
      </footer>
    </div>
  );
}
