"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  Settings,
  CreditCard,
  LogOut,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface Shop {
  id: string;
  shopName: string;
  ownerName: string;
  plan: string;
  language: string;
}

interface NavigationProps {
  shop?: Shop | null;
}

export function Navigation({ shop }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Customers", href: "/customers", icon: Users },
    { label: "New Bill", href: "/bills/new", icon: PlusCircle, isHero: true },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Billing", href: "/billing", icon: CreditCard },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-screen shrink-0 sticky top-0 h-screen p-4 justify-between">
        <div className="space-y-6">
          {/* Logo & Shop Info */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20">
              K
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                KhataEase
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Digital Udhaar Diary</p>
            </div>
          </div>

          {/* Shop Card */}
          {shop && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                  {shop.shopName}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    shop.plan === "PRO"
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {shop.plan === "PRO" ? "PRO ⚡" : "FREE"}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{shop.ownerName}</p>
            </div>
          )}

          {/* Quick Action Button */}
          <Link
            href="/bills/new"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20 transition transform active:scale-95 text-sm"
          >
            <PlusCircle className="w-5 h-5" />
            Create Quick Bill
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-emerald-500" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Upgrade Banner & Logout */}
        <div className="space-y-3">
          {shop?.plan === "FREE" && (
            <Link
              href="/billing"
              className="block p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:opacity-90 transition"
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Upgrade to Pro
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Get unlimited bills & WhatsApp reminders
              </p>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          if (item.isHero) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-slate-50 dark:border-slate-950 transition active:scale-90">
                  <PlusCircle className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  New Bill
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
