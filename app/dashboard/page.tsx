"use client";

import { useEffect, useState } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { formatRupees } from "@/lib/format";
import { motion } from "framer-motion";
import { TrendingUp, Wallet, ArrowDownRight, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Simple count up animation component
function CountUp({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1000;
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      // ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <>{formatRupees(count)}</>;
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  return (
    <LayoutShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          Dashboard
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="p-6 rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30"
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-bold uppercase tracking-wider opacity-80">Total Udhaar</p>
                  <div className="p-2 bg-white/20 rounded-xl"><Wallet className="w-5 h-5" /></div>
                </div>
                <h3 className="text-3xl font-black"><CountUp value={data.totalPending} /></h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Today's Sales</p>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-xl"><TrendingUp className="w-5 h-5" /></div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white"><CountUp value={data.todaySales} /></h3>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Month's Collection</p>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-xl"><ArrowDownRight className="w-5 h-5" /></div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white"><CountUp value={data.monthCollection} /></h3>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Sales vs Collection (6 Months)</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `,1${v}`} />
                      <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(val: number) => [`,1${val}`, undefined]}
                      />
                      <Legend iconType="circle" />
                      <Bar dataKey="sales" name="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="collection" name="Collection" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Top Customers */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Udhaar</h3>
                  <Users className="w-5 h-5 text-slate-400" />
                </div>

                <div className="flex-1 space-y-4">
                  {data.topCustomers.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <p className="text-sm font-medium">No pending udhaar.</p>
                    </div>
                  ) : (
                    data.topCustomers.map((c: any, i: number) => (
                      <Link
                        href={`/customers/${c.id}`}
                        key={c.id}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                            #{i + 1}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</p>
                            <p className="text-xs text-slate-500">{c.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-red-500 text-sm">{formatRupees(c.balance)}</span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition" />
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </LayoutShell>
  );
}
