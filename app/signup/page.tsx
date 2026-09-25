"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, BookOpen, AlertCircle } from "lucide-react";

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
    if (form.ownerName.trim().length < 2) errors.ownerName = ["Owner name must be at least 2 characters"];
    if (form.shopName.trim().length < 2) errors.shopName = ["Shop name must be at least 2 characters"];
    if (!/^[6-9]\d{9}$/.test(form.phone)) errors.phone = ["Please enter a valid 10-digit Indian phone number"];
    if (form.password.length < 6) errors.password = ["Password must be at least 6 characters"];
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setFieldErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        } else {
          setError(data.error || "Signup failed. Please try again.");
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    label,
    field,
    type = "text",
    placeholder,
    inputMode,
    hint,
  }: {
    label: string;
    field: keyof typeof form;
    type?: string;
    placeholder: string;
    inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
    hint?: string;
  }) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
      </label>
      <input
        type={type === "password" ? (showPassword ? "text" : "password") : type}
        inputMode={inputMode}
        placeholder={placeholder}
        value={form[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        className={`w-full px-4 py-3 rounded-xl bg-slate-800 border text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
          fieldErrors[field as keyof FieldErrors] ? "border-red-500" : "border-slate-700"
        }`}
      />
      {fieldErrors[field as keyof FieldErrors] && (
        <p className="text-xs text-red-400 mt-1">{fieldErrors[field as keyof FieldErrors]![0]}</p>
      )}
      {hint && !fieldErrors[field as keyof FieldErrors] && (
        <p className="text-xs text-slate-500 mt-1">{hint}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30 mb-3">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Start Free on KhataEase</h1>
          <p className="text-slate-400 text-xs mt-1">No card needed · Up to 15 customers free</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur rounded-3xl border border-slate-800 p-6 shadow-2xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-400 text-sm mb-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Owner Name" field="ownerName" placeholder="Ramesh Kumar" />
              <InputField label="Shop Name" field="shopName" placeholder="Ramesh Store" />
            </div>

            <InputField
              label="Phone Number"
              field="phone"
              type="tel"
              placeholder="9876543210"
              inputMode="numeric"
              hint="This will be your login ID"
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`w-full px-4 py-3 pr-12 rounded-xl bg-slate-800 border text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    fieldErrors.password ? "border-red-500" : "border-slate-700"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.password[0]}</p>
              )}
            </div>

            <InputField
              label="UPI ID (optional)"
              field="upiId"
              placeholder="yourshop@upi"
              hint="Add now or later in Settings"
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Preferred Language
              </label>
              <div className="flex gap-2">
                {["en", "hi"].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleChange("language", lang)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition ${
                      form.language === lang
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {lang === "en" ? "English" : "हिंदी"}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Free Khata Account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
