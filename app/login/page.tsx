"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
  AlertCircle,
  ArrowLeft,
  Phone,
  Lock,
  Sparkles,
} from "lucide-react";

interface FieldErrors {
  phone?: string[];
  password?: string[];
}

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    const cleanPhone = phone.trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = ["Please enter a valid 10-digit Indian mobile number"];
    }
    if (!password) {
      errors.password = ["Password is required"];
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(numericOnly);
    if (fieldErrors.phone) {
      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
    }
    if (error) setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (error) setError("");
  };

  const handleFillDemo = () => {
    setPhone("9876543210");
    setPassword("password123");
    setFieldErrors({});
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        }
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top back navigation */}
      <div className="w-full max-w-sm mx-auto mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-sm mx-auto"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center font-black text-white text-xl">
              K
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">KhataEase</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Digital Udhaar Diary for Indian Shopkeepers
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-2xl">
          <div className="mb-5">
            <h2 className="text-lg sm:text-xl font-black text-white">Welcome back 👋</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Login to access your khata account</p>
          </div>

          {/* Global Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs sm:text-sm mb-4"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  Mobile Number
                </span>
                <span className="text-[11px] text-slate-400 font-normal lowercase tracking-normal">
                  (10 digits)
                </span>
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-700 bg-slate-800/60 text-slate-400 text-sm font-semibold select-none">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="9876543210"
                  value={phone}
                  onChange={handlePhoneChange}
                  autoFocus
                  className={`w-full px-3.5 py-2.5 rounded-r-xl bg-slate-800/80 border text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    fieldErrors.phone ? "border-red-500" : "border-slate-700 hover:border-slate-600"
                  }`}
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.phone[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full px-3.5 py-2.5 pr-11 rounded-xl bg-slate-800/80 border text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    fieldErrors.password ? "border-red-500" : "border-slate-700 hover:border-slate-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.password[0]}</p>
              )}
            </div>

            {/* Quick Demo Fill Pill */}
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300/90 flex items-center justify-between gap-2">
              <div className="truncate">
                <span className="font-bold text-emerald-400">Demo Shop: </span>
                <span className="text-slate-300 font-mono">9876543210</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition shrink-0 active:scale-95 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Auto-fill
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login to Khata"
              )}
            </button>
          </form>

          {/* Create account link */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs sm:text-sm text-slate-400">
              New shopkeeper?{" "}
              <Link
                href="/signup"
                className="text-emerald-400 font-bold hover:text-emerald-300 transition underline-offset-2 hover:underline"
              >
                Create Free Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <p className="text-center text-[11px] text-slate-400 mt-5">
          🔒 Encrypted & Secure · Bank-grade data protection
        </p>
      </motion.div>
    </div>
  );
}
