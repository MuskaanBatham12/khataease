"use client";
import { Suspense } from "react";

import { useEffect, useState, use } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { Modal } from "@/components/Modal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useToast } from "@/components/Toast";
import { formatRupees } from "@/lib/format";
import { motion } from "framer-motion";
import {
  Zap,
  User,
  Plus,
  Minus,
  Search,
  Check,
  PlusCircle,
  IndianRupee,
  ShoppingBag,
  Loader2,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface SavedItem {
  id: string;
  name: string;
  price: number; // in paise
}

interface SelectedItem {
  name: string;
  qty: number;
  price: number; // in paise
}

function QuickBillContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCustomerId = searchParams.get("customerId") || "";

  const { showToast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(defaultCustomerId);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Just Enter Total mode vs Itemized mode
  const [billMode, setBillMode] = useState<"ITEMS" | "TOTAL">("ITEMS");
  const [justEnterTotalRupees, setJustEnterTotalRupees] = useState("");

  // Custom Item inputs
  const [customName, setCustomName] = useState("");
  const [customPriceRupees, setCustomPriceRupees] = useState("");

  // Initial Payment
  const [initialPaymentRupees, setInitialPaymentRupees] = useState("0");
  const [note, setNote] = useState("");

  // Submit state
  const [submitting, setSubmitting] = useState(false);

  // Quick Add Customer modal
  const [isAddCustOpen, setIsAddCustOpen] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");

  // Upgrade modal
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cRes, iRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/items"),
        ]);
        const cData = await cRes.json();
        const iData = await iRes.json();

        if (cRes.ok) setCustomers(cData.customers || []);
        if (iRes.ok) setSavedItems(iData.items || []);
      } catch (err) {
        console.error(err);
        showToast("Error loading customer or item data", "error");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate totals
  const itemsTotalPaise = selectedItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  const finalTotalPaise =
    billMode === "TOTAL"
      ? Math.round((parseFloat(justEnterTotalRupees) || 0) * 100)
      : itemsTotalPaise;

  const initialPaymentPaise = Math.round((parseFloat(initialPaymentRupees) || 0) * 100);

  // Quantity change helpers for saved items
  const handleItemQtyChange = (item: SavedItem, delta: number) => {
    setSelectedItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.name === item.name);
      if (existingIndex > -1) {
        const newQty = prev[existingIndex].qty + delta;
        if (newQty <= 0) {
          return prev.filter((_, idx) => idx !== existingIndex);
        } else {
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], qty: newQty };
          return updated;
        }
      } else if (delta > 0) {
        return [...prev, { name: item.name, qty: 1, price: item.price }];
      }
      return prev;
    });
  };

  const getItemQty = (itemName: string) => {
    return selectedItems.find((i) => i.name === itemName)?.qty || 0;
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customPriceRupees) return;
    const pricePaise = Math.round(parseFloat(customPriceRupees) * 100);

    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.name === customName.trim());
      if (existing) {
        return prev.map((i) =>
          i.name === customName.trim() ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { name: customName.trim(), qty: 1, price: pricePaise }];
    });

    setCustomName("");
    setCustomPriceRupees("");
  };

  const handleQuickAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCustName, phone: newCustPhone }),
      });
      const data = await res.json();
      if (res.status === 403 && data.error === "PLAN_LIMIT_REACHED") {
        setIsAddCustOpen(false);
        setUpgradeMessage(data.message);
        setIsUpgradeOpen(true);
        return;
      }
      if (!res.ok) {
        showToast(data.error || "Failed to add customer", "error");
        return;
      }

      showToast(`Customer ${data.customer.name} created!`, "success");
      setCustomers((prev) => [data.customer, ...prev]);
      setSelectedCustomerId(data.customer.id);
      setIsAddCustOpen(false);
      setNewCustName("");
      setNewCustPhone("");
    } catch (err) {
      console.error(err);
      showToast("Error adding customer", "error");
    }
  };

  const handleCreateBill = async () => {
    if (!selectedCustomerId) {
      showToast("Please select a customer", "error");
      return;
    }
    if (finalTotalPaise < 100) {
      showToast("Bill total must be at least ₹1", "error");
      return;
    }

    try {
      setSubmitting(true);

      const itemsToSubmit =
        billMode === "TOTAL"
          ? [{ name: "General Purchase", qty: 1, price: finalTotalPaise }]
          : selectedItems;

      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          items: itemsToSubmit,
          total: finalTotalPaise,
          paidAmount: initialPaymentPaise,
          note,
        }),
      });

      const data = await res.json();

      if (res.status === 403 && data.error === "PLAN_LIMIT_REACHED") {
        setUpgradeMessage(data.message);
        setIsUpgradeOpen(true);
        return;
      }

      if (!res.ok) {
        showToast(data.error || "Failed to generate bill", "error");
        return;
      }

      showToast(`Bill #${data.bill.number} generated successfully!`, "success");
      router.push(`/bills/${data.bill.id}`);
    } catch (err) {
      console.error(err);
      showToast("Error generating bill", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  if (loading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-7 h-7 text-amber-500 fill-amber-500" />
              Quick Bill Generator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Create a bill in seconds with auto UPI QR payment link
            </p>
          </div>
        </div>

        {/* STEP 1: Select Customer */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-black">
                1
              </span>
              Select Customer
            </h3>
            <button
              onClick={() => setIsAddCustOpen(true)}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <UserPlus className="w-4 h-4" />
              + Quick Add
            </button>
          </div>

          {selectedCustomerObj ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-bold text-lg flex items-center justify-center">
                  {selectedCustomerObj.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedCustomerObj.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedCustomerObj.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerId("")}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white underline px-2 py-1"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Type customer name or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {filteredCustomers.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No matching customer found. Click "+ Quick Add" to create one.
                  </p>
                ) : (
                  filteredCustomers.map((cust) => (
                    <button
                      key={cust.id}
                      onClick={() => setSelectedCustomerId(cust.id)}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition flex items-center justify-between text-sm"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {cust.name}
                      </span>
                      <span className="text-xs text-slate-400">{cust.phone}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: Add Items / Total */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-black">
                2
              </span>
              Add Bill Items
            </h3>

            {/* Mode Switch Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setBillMode("ITEMS")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  billMode === "ITEMS"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Itemized
              </button>
              <button
                onClick={() => setBillMode("TOTAL")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  billMode === "TOTAL"
                    ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Just Enter Total
              </button>
            </div>
          </div>

          {billMode === "TOTAL" ? (
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Total Bill Amount (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  inputMode="numeric"
                  placeholder="e.g. 450"
                  value={justEnterTotalRupees}
                  onChange={(e) => setJustEnterTotalRupees(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-2xl font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-2">
                {[50, 100, 200, 500, 1000].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      const current = parseFloat(justEnterTotalRupees) || 0;
                      setJustEnterTotalRupees((current + chip).toString());
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white font-bold text-xs transition"
                  >
                    +₹{chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Saved Items Selector */}
              {savedItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Saved Inventory Items
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {savedItems.map((item) => {
                      const qty = getItemQty(item.name);
                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-xs text-emerald-500 font-semibold">
                              {formatRupees(item.price)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {qty > 0 && (
                              <button
                                onClick={() => handleItemQtyChange(item, -1)}
                                className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 hover:bg-red-500 hover:text-white transition"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {qty > 0 && (
                              <span className="font-bold text-sm text-slate-900 dark:text-white w-4 text-center">
                                {qty}
                              </span>
                            )}
                            <button
                              onClick={() => handleItemQtyChange(item, 1)}
                              className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold hover:bg-emerald-600 transition"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add Custom Item Row */}
              <form onSubmit={handleAddCustomItem} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Custom Item Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Milk packet"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                </div>
                <div className="w-28">
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="32"
                    value={customPriceRupees}
                    onChange={(e) => setCustomPriceRupees(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition"
                >
                  Add
                </button>
              </form>

              {/* Selected Bill Items Summary table */}
              {selectedItems.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Bill Items Summary
                  </p>
                  {selectedItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-medium">
                      <span>
                        {item.name} <span className="text-slate-400">x{item.qty}</span>
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatRupees(item.price * item.qty)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* STEP 3: Payment Options & Notes */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-black">
              3
            </span>
            Initial Payment & Notes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Paid Right Now (₹)
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={initialPaymentRupees}
                onChange={(e) => setInitialPaymentRupees(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Leave 0 for full Udhaar. Enter partial or total amount if customer pays now.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                Note / Remark (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Monthly ration"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Final Bill Total
            </span>
            <h2 className="text-3xl font-black text-emerald-400">
              {formatRupees(finalTotalPaise)}
            </h2>
          </div>

          <button
            onClick={handleCreateBill}
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black text-white shadow-lg shadow-emerald-500/30 transition transform active:scale-95 flex items-center justify-center gap-2 text-base"
          >
            {submitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                Generate Bill & UPI QR
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      <Modal
        isOpen={isAddCustOpen}
        onClose={() => setIsAddCustOpen(false)}
        title="Quick Add Customer"
      >
        <form onSubmit={handleQuickAddCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sunita Verma"
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 9822233344"
              value={newCustPhone}
              onChange={(e) => setNewCustPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md"
          >
            Save & Select Customer
          </button>
        </form>
      </Modal>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        message={upgradeMessage}
        limitType="BILLS"
      />
    </LayoutShell>
  );
}


export default function QuickBillPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuickBillContent />
    </Suspense>
  );
}


