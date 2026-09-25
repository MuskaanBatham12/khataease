"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Sparkles, Sun, Moon } from "lucide-react";
import Link from "next/link";

interface Shop {
  id: string;
  shopName: string;
  ownerName: string;
  plan: string;
  language: string;
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.shop) setShop(data.shop);
      })
      .catch((err) => console.error(err));
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navigation shop={shop} />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="md:hidden text-lg font-black tracking-tight text-emerald-500">
              KhataEase
            </span>
            {shop && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {shop.shopName}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    shop.plan === "PRO"
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {shop.plan === "PRO" ? "PRO ⚡" : "FREE"}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {shop?.plan === "FREE" && (
              <Link
                href="/billing"
                className="sm:hidden text-xs font-bold px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                PRO
              </Link>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
