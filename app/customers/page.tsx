"use client";

import { useEffect, useState } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { Modal } from "@/components/Modal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useToast } from "@/components/Toast";
import { formatRupees } from "@/lib/format";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  UserPlus,
  Phone,
  MapPin,
  ChevronRight,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  balance: number; // in paise
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add Customer Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Upgrade Modal state
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  const { showToast } = useToast();

  const fetchCustomers = async (query = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.customers || []);
      } else {
        showToast(data.error || "Failed to load customers", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(search);
  }, [search]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          phone: formPhone,
          address: formAddress,
        }),
      });

      const data = await res.json();

      if (res.status === 403 && data.error === "PLAN_LIMIT_REACHED") {
        setIsAddOpen(false);
        setUpgradeMessage(data.message);
        setIsUpgradeOpen(true);
        return;
      }

      if (!res.ok) {
        showToast(data.error || "Failed to add customer", "error");
        return;
      }

      showToast(`Customer "${data.customer.name}" added successfully!`, "success");
      setIsAddOpen(false);
      setFormName("");
      setFormPhone("");
      setFormAddress("");
      fetchCustomers();
    } catch (err) {
      console.error(err);
      showToast("Failed to add customer", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPendingBalance = customers.reduce(
    (sum, c) => sum + (c.balance > 0 ? c.balance : 0),
    0
  );

  return (
    <LayoutShell>
      <div className="space-y-6">
        {/* Header & Stats Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-7 h-7 text-emerald-500" />
              Customer Khata Diary
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage accounts, view pending balances, and record payments
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/25 transition active:scale-95 text-sm"
          >
            <UserPlus className="w-5 h-5" />
            Add Customer
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Customers
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {customers.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Total Pending Udhaar
              </p>
              <p className="text-2xl font-black text-red-500 mt-1">
                {formatRupees(totalPendingBalance)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-500">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium shadow-sm"
          />
        </div>

        {/* Customer List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {search ? "No customers found" : "No customers added yet"}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {search
                ? "Try searching for another name or phone number."
                : "Add your first customer to start tracking udhaar and sending bills!"}
            </p>
            {!search && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition"
              >
                Add First Customer
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customers.map((customer) => (
              <motion.div
                key={customer.id}
                whileHover={{ y: -2 }}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex items-center justify-between group"
              >
                <Link
                  href={`/customers/${customer.id}`}
                  className="flex-1 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-500 transition">
                      {customer.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {customer.phone}
                      </span>
                      {customer.address && (
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {customer.address}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Balance
                      </p>
                      <p
                        className={`text-base font-black ${
                          customer.balance > 0
                            ? "text-red-500"
                            : customer.balance < 0
                            ? "text-emerald-500"
                            : "text-slate-400"
                        }`}
                      >
                        {customer.balance > 0
                          ? `${formatRupees(customer.balance)} Owed`
                          : customer.balance < 0
                          ? `${formatRupees(Math.abs(customer.balance))} Advance`
                          : "Clear"}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Customer"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Sharma"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              inputMode="numeric"
              placeholder="e.g. 9876543210"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Address (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Sector 14, Main Market"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2 text-sm mt-6"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Customer"}
          </button>
        </form>
      </Modal>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        message={upgradeMessage}
        limitType="CUSTOMERS"
      />
    </LayoutShell>
  );
}
