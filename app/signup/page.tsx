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
  User,
  Store,
  Phone,
  Lock,
  QrCode,
  Globe,
  CheckCircle2,
} from "lucide-react";

interface FieldErrors {
  ownerName?: string[];
  shopName?: string[];
  phone?: string[];
  password?: string[];
  upiId?: string[];
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    ownerName: "",
    shopName: "",
    phone: "",
    password: "",
    upiId: "",
    language: "en",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    if (form.ownerName.trim().length < 2) {
      errors.ownerName = ["Owner name must be at least 2 characters"];
    }
    if (form.shopName.trim().length < 2) {
      errors.shopName = ["Shop name must be at least 2 characters"];
    }
    const cleanPhone = form.phone.trim();
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = ["Please enter a valid 10-digit Indian mobile number"];
    }
    if (form.password.length < 6) {
      errors.password = ["Password must be at least 6 characters"];
    }
    if (form.upiId.trim() && !form.upiId.includes("@")) {
      errors.upiId = ["Please enter a valid UPI ID (e.g., name@okaxis)"];
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (error) setError("");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    handleFieldChange("phone", numericOnly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      setLoading(true);
      const payload = {
        ownerName: form.ownerName.trim(),
        shopName: form.shopName.trim(),
        phone: form.phone.trim(),
        password: form.password,
        upiId: form.upiId.trim() || undefined,
        language: form.language,
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        }
        setError(data.error || "Signup failed. Please try again.");
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
      <div className="w-full max-w-md mx-auto mb-4">
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
        className="w-full max-w-md mx-auto"
      >
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30 flex items-center justify-center font-black text-white text-xl">
              K
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Start Free on KhataEase
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Digital Udhaar Diary & Quick Bills for your shop
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
          {/* Global Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs sm:text-sm mb-5"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Owner Name & Shop Name in 2 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Owner Name
                </label>
                <input
                  type="text"
                  placeholder="Ramesh Kumar"
                  value={form.ownerName}
                  onChange={(e) => handleFieldChange("ownerName", e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    fieldErrors.ownerName ? "border-red-500" : "border-slate-700 hover:border-slate-600"
                  }`}
                />
                {fieldErrors.ownerName && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.ownerName[0]}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  <Store className="w-3.5 h-3.5 text-emerald-400" />
                  Shop Name
                </label>
                <input
                  type="text"
                  placeholder="Ramesh Store"
                  value={form.shopName}
                  onChange={(e) => handleFieldChange("shopName", e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    fieldErrors.shopName ? "border-red-500" : "border-slate-700 hover:border-slate-600"
                  }`}
                />
                {fieldErrors.shopName && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.shopName[0]}</p>
                )}
              </div>
            </div>

            {/* Mobile Number */}
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
                  value={form.phone}
                  onChange={handlePhoneChange}
                  className={`w-full px-3.5 py-2.5 rounded-r-xl bg-slate-800/80 border text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    fieldErrors.phone ? "border-red-500" : "border-slate-700 hover:border-slate-600"
                  }`}
                />
              </div>
              {fieldErrors.phone ? (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.phone[0]}</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">This will be your login ID</p>
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
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) => handleFieldChange("password", e.target.value)}
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

            {/* UPI ID (Optional) */}
            <div>
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  UPI ID
                </span>
                <span className="text-[11px] text-slate-400 font-normal lowercase tracking-normal">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                placeholder="yourshop@upi or 9876543210@paytm"
                value={form.upiId}
                onChange={(e) => handleFieldChange("upiId", e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  fieldErrors.upiId ? "border-red-500" : "border-slate-700 hover:border-slate-600"
                }`}
              />
              {fieldErrors.upiId ? (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.upiId[0]}</p>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">Used on QR bills to receive direct bank payments</p>
              )}
            </div>

            {/* Preferred Language */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                App Language / भाषा
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { code: "en", label: "English" },
                  { code: "hi", label: "हिंदी (Hindi)" },
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleFieldChange("language", item.code)}
                    className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center justify-center gap-1.5 ${
                      form.language === item.code
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm"
                        : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                    }`}
                  >
                    {form.language === item.code && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Your Account...
                </>
              ) : (
                "Create Free Khata Account"
              )}
            </button>
          </form>

          {/* Login prompt */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-xs sm:text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-emerald-400 font-bold hover:text-emerald-300 transition underline-offset-2 hover:underline"
              >
                Login to Khata
              </Link>
            </p>
          </div>
        </div>

        {/* Guarantee footer note */}
        <p className="text-center text-[11px] text-slate-400 mt-5">
          🔒 100% Free · No credit card required · Instant setup
        </p>
      </motion.div>
    </div>
  );
}
