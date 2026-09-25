"use client";

import { useEffect, useState, use } from "react";
import { LayoutShell } from "@/components/LayoutShell";
import { Modal } from "@/components/Modal";
import { UpgradeModal } from "@/components/UpgradeModal";
import { useToast } from "@/components/Toast";
import { formatRupees, formatDate } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  MapPin,
  PlusCircle,
  IndianRupee,
  Share2,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TimelineEntry {
  id: string;
  type: "BILL" | "PAYMENT";
  amount: number;
  note?: string;
  createdAt: string;
  runningBalance: number;
  bill?: {
    id: string;
    number: string;
    status: string;
    publicToken: string;
  };
}

interface CustomerData {
  customer: {
    id: string;
    name: string;
    phone: string;
    address?: string;
  };
  timeline: TimelineEntry[];
  summary: {
    totalBilled: number;
    totalPaid: number;
    currentBalance: number;
  };
}

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [data, setData] = useState<CustomerData | null>(null);
  const [shop, setShop] = useState<{ shopName: string; plan: string; upiId?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Record Payment modal state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [payAmountRupees, setPayAmountRupees] = useState("");
  const [payNote, setPayNote] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [lastPaymentAmount, setLastPaymentAmount] = useState(0);

  // Edit Customer modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Upgrade Modal state
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers/${id}`);
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
        setEditName(resData.customer.name);
        setEditPhone(resData.customer.phone);
        setEditAddress(resData.customer.address || "");
      } else {
        showToast(resData.error || "Customer not found", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetails();

    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((meData) => {
        if (meData.shop) setShop(meData.shop);
      });
  }, [id]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const rupees = parseFloat(payAmountRupees);
    if (isNaN(rupees) || rupees <= 0) {
      showToast("Please enter a valid payment amount", "error");
      return;
    }

    const paise = Math.round(rupees * 100);

    try {
      setRecordingPayment(true);
      const res = await fetch(`/api/customers/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paise,
          note: payNote,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        showToast(resData.error || "Failed to record payment", "error");
        return;
      }

      setLastPaymentAmount(paise);
      setIsPaymentOpen(false);
      setShowPaymentSuccess(true);
      setPayAmountRupees("");
      setPayNote("");
      fetchCustomerDetails();

      setTimeout(() => {
        setShowPaymentSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      showToast("Error recording payment", "error");
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          address: editAddress,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        showToast(resData.error || "Failed to update customer", "error");
        return;
      }

      showToast("Customer updated successfully", "success");
      setIsEditOpen(false);
      fetchCustomerDetails();
    } catch (err) {
      console.error(err);
      showToast("Failed to update customer", "error");
    }
  };

  const handleDeleteCustomer = async () => {
    if (!confirm("Are you sure you want to delete this customer? All bills and ledger history will be permanently deleted.")) {
      return;
    }

    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Customer deleted", "success");
        router.push("/customers");
      } else {
        showToast("Failed to delete customer", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting customer", "error");
    }
  };

  const handleWhatsAppReminder = () => {
    if (shop?.plan !== "PRO") {
      setUpgradeMessage("WhatsApp reminders are exclusive to KhataEase Pro. Upgrade to send 1-tap payment reminders with public bill links!");
      setIsUpgradeOpen(true);
      return;
    }

    if (!data) return;

    const pendingFormatted = formatRupees(data.summary.currentBalance);
    const text = `Namaste ${data.customer.name} ji 🙏\nThis is a friendly reminder from *${shop.shopName}*.\nYour total pending balance is *${pendingFormatted}*.\n\nPlease clear the payment at your earliest. Thank you!`;
    const cleanPhone = data.customer.phone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </LayoutShell>
    );
  }

  if (!data) return null;

  return (
    <LayoutShell>
      <div className="space-y-6">
        {/* Animated Payment Success Stamp */}
        <AnimatePresence>
          {showPaymentSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="p-4 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-between shadow-xl shadow-emerald-500/30"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-white animate-bounce" />
                <div>
                  <h4 className="text-lg font-black">{formatRupees(lastPaymentAmount)} Received!</h4>
                  <p className="text-xs text-emerald-100 font-medium">Payment successfully recorded in Khata</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Customer Header & Summary Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-black text-2xl flex items-center justify-center">
                {data.customer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {data.customer.name}
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Edit Customer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeleteCustomer}
                    className="p-1 text-slate-400 hover:text-red-500"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </h1>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {data.customer.phone}
                  </span>
                  {data.customer.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {data.customer.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/bills/new?customerId=${data.customer.id}`}
                className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                New Bill
              </Link>
              <button
                onClick={() => setIsPaymentOpen(true)}
                className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
              >
                <IndianRupee className="w-4 h-4" />
                Record Payment
              </button>
              <button
                onClick={handleWhatsAppReminder}
                className="py-2.5 px-3 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 font-bold text-xs border border-green-500/30 transition flex items-center justify-center gap-1.5"
                title="Send WhatsApp Reminder"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp
              </button>
            </div>
          </div>

          {/* Ledger Summary Stats */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Billed</p>
              <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {formatRupees(data.summary.totalBilled)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Paid</p>
              <p className="text-base sm:text-lg font-black text-emerald-500 mt-0.5">
                {formatRupees(data.summary.totalPaid)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Net Udhaar</p>
              <p
                className={`text-base sm:text-lg font-black mt-0.5 ${
                  data.summary.currentBalance > 0
                    ? "text-red-500"
                    : data.summary.currentBalance < 0
                    ? "text-emerald-500"
                    : "text-slate-400"
                }`}
              >
                {data.summary.currentBalance > 0
                  ? formatRupees(data.summary.currentBalance)
                  : data.summary.currentBalance < 0
                  ? `${formatRupees(Math.abs(data.summary.currentBalance))} (Advance)`
                  : "₹0 Clear"}
              </p>
            </div>
          </div>
        </div>

        {/* Khata Diary Timeline */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 px-1">
            <FileText className="w-5 h-5 text-emerald-500" />
            Khata Diary Timeline
          </h2>

          {data.timeline.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                No transactions recorded yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Create a bill or record a payment to update this khata diary.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.timeline.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        entry.type === "BILL"
                          ? "bg-red-50 dark:bg-red-950/40 text-red-500"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500"
                      }`}
                    >
                      {entry.type === "BILL" ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {entry.type === "BILL" ? "Bill Given (Gave)" : "Payment Received (Got)"}
                        </span>
                        {entry.bill && (
                          <Link
                            href={`/bills/${entry.bill.id}`}
                            className="text-xs text-emerald-500 hover:underline font-semibold"
                          >
                            #{entry.bill.number}
                          </Link>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatDate(entry.createdAt)} {entry.note ? `• ${entry.note}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`font-black text-sm sm:text-base ${
                        entry.type === "BILL" ? "text-red-500" : "text-emerald-500"
                      }`}
                    >
                      {entry.type === "BILL" ? "+" : "-"} {formatRupees(entry.amount)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Bal: {formatRupees(entry.runningBalance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title={`Record Payment from ${data.customer.name}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Payment Amount (₹) *
            </label>
            <input
              type="number"
              step="any"
              required
              inputMode="numeric"
              placeholder="e.g. 500"
              value={payAmountRupees}
              onChange={(e) => setPayAmountRupees(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-black text-slate-900 dark:text-white"
            />
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[100, 200, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setPayAmountRupees(amt.toString())}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-xs font-bold transition"
              >
                +₹{amt}
              </button>
            ))}
            {data.summary.currentBalance > 0 && (
              <button
                type="button"
                onClick={() => setPayAmountRupees((data.summary.currentBalance / 100).toString())}
                className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition"
              >
                Full (₹{data.summary.currentBalance / 100})
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. UPI payment / Cash received"
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={recordingPayment}
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center justify-center gap-2 text-sm mt-6"
          >
            {recordingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Payment Received"}
          </button>
        </form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Customer Details"
      >
        <form onSubmit={handleUpdateCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Address
            </label>
            <input
              type="text"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md"
          >
            Save Changes
          </button>
        </form>
      </Modal>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        message={upgradeMessage}
        limitType="WHATSAPP"
      />
    </LayoutShell>
  );
}
