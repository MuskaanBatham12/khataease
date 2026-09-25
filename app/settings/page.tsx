"use client";

import { useEffect, useState } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { useToast } from "@/components/Toast";
import { LogOut, Save, Settings as SettingsIcon, Store, User, Phone, QrCode, Globe, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const i18n = {
  en: {
    title: "Settings",
    shopDetails: "Shop Details",
    shopName: "Shop Name",
    ownerName: "Owner Name",
    phone: "Phone Number",
    upiLabel: "UPI ID for Payments",
    upiPlaceholder: "yourname@upi",
    langLabel: "App Language",
    saveBtn: "Save Changes",
    logoutBtn: "Logout from KhataEase",
    savedMsg: "Settings saved successfully!",
  },
  hi: {
    title: "सेटिंग्स",
    shopDetails: "दुकान का विवरण",
    shopName: "दुकान का नाम",
    ownerName: "मालिक का नाम",
    phone: "फोन नंबर",
    upiLabel: "पेमेंट के लिए UPI ID",
    upiPlaceholder: "आपकानाम@upi",
    langLabel: "ऐप की भाषा",
    saveBtn: "सेव करें",
    logoutBtn: "खाताईज़ से लॉगआउट करें",
    savedMsg: "सेटिंग्स सफलतापूर्वक सेव हो गईं!",
  },
};

export default function SettingsPage() {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [upiId, setUpiId] = useState("");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.shop) {
          setShop(data.shop);
          setUpiId(data.shop.upiId || "");
          setLanguage(data.shop.language || "en");
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId, language }),
      });
      if (res.ok) {
        showToast(i18n[language].savedMsg, "success");
        router.refresh();
      } else {
        showToast("Failed to save settings", "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
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

  const t = i18n[language];

  return (
    <LayoutShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-emerald-500" />
          {t.title}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6"
        >
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
            {t.shopDetails}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm"><Store className="w-5 h-5 text-emerald-500" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.shopName}</p>
                <p className="font-semibold text-slate-900 dark:text-white">{shop.shopName}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm"><User className="w-5 h-5 text-blue-500" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.ownerName}</p>
                <p className="font-semibold text-slate-900 dark:text-white">{shop.ownerName}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm"><Phone className="w-5 h-5 text-slate-500" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.phone}</p>
              <p className="font-semibold text-slate-900 dark:text-white">{shop.phone}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                <QrCode className="w-4 h-4 text-emerald-500" />
                {t.upiLabel}
              </label>
              <input
                type="text"
                placeholder={t.upiPlaceholder}
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                <Globe className="w-4 h-4 text-blue-500" />
                {t.langLabel}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage("en")}
                  className={`flex-1 py-3 rounded-xl font-bold transition border ${
                    language === "en"
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={`flex-1 py-3 rounded-xl font-bold transition border ${
                    language === "hi"
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold shadow-md transition flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {t.saveBtn}
          </button>
        </motion.div>

        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-3xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          {t.logoutBtn}
        </button>
      </div>
    </LayoutShell>
  );
}
