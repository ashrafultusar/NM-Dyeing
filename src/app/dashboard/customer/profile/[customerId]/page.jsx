"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, use, useCallback } from "react";
import { FaArrowLeft, FaChevronDown, FaLock, FaTimes, FaCheckCircle, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";

// openingBalance: carry-forward from previous closing (0 for first period)
// initialAmount/initialAmountType: manual opening entry stored on the entity
function buildLedger(billings, payments, openingBalance = 0, initialAmount = 0, initialAmountType = "charge") {
  // Effective starting balance = openingBalance +/- initialAmount
  let startBal = openingBalance;
  if (initialAmount > 0) {
    startBal += initialAmountType === "payment" ? initialAmount : -initialAmount;
  }

  const combined = [
    ...billings
      .filter((b) => b.summaryType === "client")
      .map((b) => ({
        date: b.createdAt,
        provider: "BILLING",
        description: `Invoice: ${b.invoiceNumber}`,
        qty: b.totalQty,
        price: b.price,
        charge: b.total,
        payment: 0,
        type: "debit",
        colour: b.colour,
      })),
    ...payments.map((p) => ({
      date: p.date,
      provider: p.method.toUpperCase(),
      description: p.description || "Payment Received",
      charge: 0,
      payment: p.amount,
      type: "credit",
    })),
  ];
  combined.sort((a, b) => new Date(a.date) - new Date(b.date));
  let bal = startBal;
  return combined.map((item) => {
    bal += item.payment - item.charge;
    return { ...item, balance: bal };
  });
}

function fmtDate(d) { return new Date(d).toLocaleDateString("en-GB"); }

function InitialAmountModal({ current, currentType, onClose, onConfirm, loading }) {
  const [amount, setAmount] = useState(current > 0 ? String(current) : "");
  const [type, setType] = useState(currentType || "charge");
  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!amount || isNaN(val) || val < 0) return toast.error("Valid amount দিন");
    onConfirm(val, type);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><FaTimes size={16} /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center"><FaEdit className="text-indigo-500" size={16} /></div>
          <div>
            <h2 className="font-black text-gray-900 text-base">Initial Amount সেট করুন</h2>
            <p className="text-[11px] text-gray-500">Ledger শুরুর আগের পুরনো হিসাব</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Amount (৳) *</label>
            <input autoFocus type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="যেমন: 5000"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Type *</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setType("charge")}
                className={`py-3 cursor-pointer rounded-xl border-2 text-sm font-black transition ${type === "charge" ? "border-red-400 bg-red-50 text-red-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                Charge (+)
                <p className="text-[10px] font-medium mt-0.5 opacity-70">Client আমার কাছে পাওনা</p>
              </button>
              <button type="button" onClick={() => setType("payment")}
                className={`py-3 cursor-pointer rounded-xl border-2 text-sm font-black transition ${type === "payment" ? "border-green-400 bg-green-50 text-green-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                Payment (-)
                <p className="text-[10px] font-medium mt-0.5 opacity-70">আমি client-কে দিতে হবে</p>
              </button>
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
            <p className="text-[11px] text-indigo-700 font-medium">💡 এই amount ledger-এর সবার উপরে প্রথম row হিসেবে দেখাবে এবং balance calculation এখান থেকে শুরু হবে।</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 cursor-pointer px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 cursor-pointer px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-black hover:bg-indigo-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : <><FaEdit size={12} /> Save</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CloseModal({ onClose, onConfirm, loading }) {
  const [title, setTitle] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("একটি title দিন");
    onConfirm(title.trim());
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><FaTimes size={16} /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><FaLock className="text-red-500" size={16} /></div>
          <div>
            <h2 className="font-black text-gray-900 text-base">Ledger Close করুন</h2>
            <p className="text-[11px] text-gray-500">Current data snapshot হিসেবে save হবে</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Closing Title *</label>
            <input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: January 2025 Closing"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent" />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-[11px] text-amber-700 font-medium">⚠️ Close করার পর সব data save হয়ে যাবে এবং current ledger empty হবে।</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={loading || !title.trim()} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-black hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : <><FaLock size={12} /> Confirm Close</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LedgerTable({ rows, openingBalance, initialAmount, initialAmountType }) {
  const hasInitial = initialAmount > 0;
  const initialBalance = hasInitial
    ? (initialAmountType === "payment" ? initialAmount : -initialAmount)
    : 0;
  const effectiveOpening = openingBalance + initialBalance;

  if (!rows.length && !hasInitial && openingBalance === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-400 font-bold text-sm uppercase">কোনো data নেই</p>
        <p className="text-gray-300 text-xs mt-1">নতুন bill যোগ হলে এখানে দেখাবে</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Date", "Method", "Description", "Charge (+)", "Payment (-)", "Balance"].map((h, i) => (
              <th key={h} className={`px-4 py-4 font-black text-gray-500 uppercase text-[10px] ${i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {/* Carry-forward row from previous period close */}
          {openingBalance !== 0 && (
            <tr className="bg-blue-50/60">
              <td className="px-4 py-3 whitespace-nowrap text-[11px] font-medium text-blue-600">—</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-blue-100 text-blue-700">CARRY FWD</span>
              </td>
              <td className="px-4 py-3 text-xs font-bold text-blue-700">Opening Balance (Previous Period)</td>
              <td className="px-4 py-3 text-right text-[11px]">—</td>
              <td className="px-4 py-3 text-right text-[11px]">—</td>
              <td className="px-4 py-3 text-right">
                <div className={`text-xs font-black px-2 py-1 rounded ${openingBalance < 0 ? "text-red-600 bg-red-50" : "text-teal-600 bg-teal-50"}`}>
                  {openingBalance < 0 ? `- ৳${Math.abs(openingBalance).toLocaleString()}` : `+ ৳${openingBalance.toLocaleString()}`}
                </div>
              </td>
            </tr>
          )}
          {/* Initial Amount row — always first, before all billings/payments */}
          {hasInitial && (
            <tr className="bg-indigo-50/60">
              <td className="px-4 py-3 whitespace-nowrap text-[11px] font-medium text-indigo-600">—</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${initialAmountType === "payment" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>INITIAL</span>
              </td>
              <td className="px-4 py-3 text-xs font-bold text-indigo-700">Opening Balance (শুরুর পুরনো হিসাব)</td>
              <td className="px-4 py-3 text-right text-[11px] font-bold text-gray-700">
                {initialAmountType === "charge" ? `৳${initialAmount.toLocaleString()}` : "—"}
              </td>
              <td className="px-4 py-3 text-right text-[11px] font-bold text-green-600">
                {initialAmountType === "payment" ? `৳${initialAmount.toLocaleString()}` : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <div className={`text-xs font-black px-2 py-1 rounded ${effectiveOpening < 0 ? "text-red-600 bg-red-50" : "text-teal-600 bg-teal-50"}`}>
                  {effectiveOpening < 0 ? `- ৳${Math.abs(effectiveOpening).toLocaleString()}` : `+ ৳${effectiveOpening.toLocaleString()}`}
                </div>
              </td>
            </tr>
          )}
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap text-gray-600 text-[11px] font-medium">{fmtDate(row.date)}</td>
              <td className="px-4 py-4 whitespace-nowrap">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${row.type === "credit" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{row.provider}</span>
              </td>
              <td className="px-4 py-4 text-gray-700 text-xs">
                <div className="font-bold text-gray-900">{row.description}</div>
                {row.colour && <span className="text-[10px] text-gray-400 italic leading-none">{row.colour}</span>}
              </td>
              <td className="px-4 py-4 text-right whitespace-nowrap">
                {row.charge > 0 ? <div className="text-gray-900 font-bold text-[11px]">({row.qty} × {row.price}) = ৳{row.charge.toLocaleString()}</div> : "—"}
              </td>
              <td className="px-4 py-4 text-right text-green-600 font-black text-xs whitespace-nowrap">
                {row.payment > 0 ? `৳${row.payment.toLocaleString()}` : "—"}
              </td>
              <td className="px-4 py-4 text-right whitespace-nowrap">
                <div className={`text-xs font-black px-2 py-1 rounded ${row.balance < 0 ? "text-red-600 bg-red-50" : "text-teal-600 bg-teal-50"}`}>
                  {row.balance < 0 ? `- ৳${Math.abs(row.balance).toLocaleString()}` : `+ ৳${row.balance.toLocaleString()}`}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryFooter({ totalCharge, totalPayment, finalBalance, openingBalance }) {
  return (
    <div className="bg-gray-900 p-5 sm:p-8 text-white">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div className="space-y-1 text-center sm:text-left border-b sm:border-b-0 sm:border-r border-gray-800 pb-4 sm:pb-0">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Billings</p>
          <p className="text-lg font-bold">৳{totalCharge.toLocaleString()}</p>
        </div>
        <div className="space-y-1 text-center sm:text-left border-b sm:border-b-0 sm:border-r border-gray-800 pb-4 sm:pb-0">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Received</p>
          <p className="text-lg font-bold text-green-400">৳{totalPayment.toLocaleString()}</p>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest mb-1">Final Balance</p>
          <p className={`text-2xl font-black ${finalBalance < 0 ? "text-red-500" : "text-teal-400"}`}>
            {finalBalance < 0 ? `- ৳${Math.abs(finalBalance).toLocaleString()}` : `+ ৳${finalBalance.toLocaleString()}`}
            <span className="text-xs ml-2 font-bold opacity-80 uppercase">{finalBalance < 0 ? "Due" : "Advance"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CustomerProfileLedger({ params }) {
  const resolvedParams = use(params);
  const customerId = resolvedParams?.customerId;
  const router = useRouter();

  const [selectedView, setSelectedView] = useState("current");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const [customer, setCustomer] = useState(null);
  const [currentLedger, setCurrentLedger] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [initialAmount, setInitialAmount] = useState(0);
  const [initialAmountType, setInitialAmountType] = useState("charge");
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotCache, setSnapshotCache] = useState({});
  const [pageLoading, setPageLoading] = useState(true);

  const fetchCurrentLedger = useCallback(async () => {
    try {
      const res = await fetch(`/api/customers/ledger/${customerId}`);
      const result = await res.json();
      if (result.success) {
        const { customer: c, billings, payments, openingBalance: ob = 0, initialAmount: ia = 0, initialAmountType: iat = "charge" } = result.data;
        setCustomer(c);
        setOpeningBalance(ob);
        setInitialAmount(ia);
        setInitialAmountType(iat);
        setCurrentLedger(buildLedger(billings, payments, ob, ia, iat));
      }
    } catch { toast.error("Failed to load ledger"); }
  }, [customerId]);

  const fetchSnapshots = useCallback(async () => {
    try {
      const res = await fetch(`/api/customers/ledger/${customerId}/snapshots`);
      const result = await res.json();
      if (result.success) setSnapshots(result.snapshots);
    } catch { toast.error("Failed to load snapshots"); }
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;
    Promise.all([fetchCurrentLedger(), fetchSnapshots()]).finally(() => setPageLoading(false));
  }, [customerId, fetchCurrentLedger, fetchSnapshots]);

  const loadSnapshot = useCallback(async (snapshotId) => {
    if (snapshotCache[snapshotId]) return;
    try {
      const res = await fetch(`/api/customers/ledger/${customerId}/snapshots/${snapshotId}`);
      const result = await res.json();
      if (result.success) setSnapshotCache(prev => ({ ...prev, [snapshotId]: result.snapshot }));
    } catch { toast.error("Failed to load snapshot"); }
  }, [customerId, snapshotCache]);

  useEffect(() => {
    if (selectedView !== "current") loadSnapshot(selectedView);
  }, [selectedView, loadSnapshot]);

  const handleClose = async (title) => {
    setCloseLoading(true);
    try {
      const res = await fetch(`/api/customers/ledger/${customerId}/close`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Ledger সফলভাবে close হয়েছে!");
        setShowCloseModal(false);
        setSelectedView("current");
        setSnapshotCache({});
        await Promise.all([fetchCurrentLedger(), fetchSnapshots()]);
      } else { toast.error(result.message || "Close করতে সমস্যা হয়েছে"); }
    } catch { toast.error("Server error"); }
    finally { setCloseLoading(false); }
  };

  const handleSetInitialAmount = async (amount, type) => {
    setInitialLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initialAmount: amount, initialAmountType: type }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Initial amount সেট হয়েছে!");
        setShowInitialModal(false);
        await fetchCurrentLedger();
      } else { toast.error(result.error || "সমস্যা হয়েছে"); }
    } catch { toast.error("Server error"); }
    finally { setInitialLoading(false); }
  };

  if (pageLoading) return <div className="p-10 text-center font-bold text-gray-500 animate-pulse uppercase">Generating Statement...</div>;

  const isCurrentView = selectedView === "current";
  const activeSnapshot = isCurrentView ? null : snapshotCache[selectedView];
  const displayRows = isCurrentView ? currentLedger : (activeSnapshot?.ledgerData ?? []);
  const displayOpeningBalance = isCurrentView ? openingBalance : (activeSnapshot?.openingBalance ?? 0);
  const totalCharge = displayRows.reduce((s, r) => s + (r.charge || 0), 0);
  const totalPayment = displayRows.reduce((s, r) => s + (r.payment || 0), 0);
  const finalBalance = displayOpeningBalance + totalPayment - totalCharge;
  const selectedLabel = isCurrentView ? "📂 Current Ledger" : (snapshots.find(s => s._id === selectedView)?.title ?? "Closed Ledger");

  return (
    <>
      {showCloseModal && <CloseModal onClose={() => setShowCloseModal(false)} onConfirm={handleClose} loading={closeLoading} />}
      {showInitialModal && <InitialAmountModal current={initialAmount} currentType={initialAmountType} onClose={() => setShowInitialModal(false)} onConfirm={handleSetInitialAmount} loading={initialLoading} />}
      <div className="mt-10 md:mt-8 lg:mt-1 max-w-6xl mx-auto p-3 sm:p-6 min-h-screen ">
        <button onClick={() => router.back()} className=" flex items-center gap-2 bg-blue-100 px-2 py-1 rounded text-gray-600 hover:text-blue-600 font-bold text-sm mb-4 print:hidden cursor-pointer">
          <FaArrowLeft size={14} /> BACK
        </button>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden print:border-none print:shadow-none">
          <div className="p-5 sm:p-8 border-b border-gray-100 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase">Ledger Statement</h1>
                <div className="mt-4 space-y-1">
                  <p className="font-bold text-blue-600 text-lg">{customer?.companyName}</p>
                  <p className="text-xs text-gray-500 uppercase font-bold">Owner: {customer?.ownerName} | Phone: {customer?.phoneNumber}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{customer?.address}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto print:hidden">
                <div className="relative">
                  <button onClick={() => setDropdownOpen(p => !p)} className="flex cursor-pointer items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition w-full sm:w-auto whitespace-nowrap">
                    {selectedLabel}
                    <FaChevronDown size={10} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-40 py-1 overflow-hidden ">
                      <button onClick={() => { setSelectedView("current"); setDropdownOpen(false); }} className={`w-full text-left cursor-pointer px-4 py-2.5 text-xs font-bold hover:bg-blue-50 flex items-center gap-2 transition ${isCurrentView ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}>
                        📂 Current Ledger {isCurrentView && <FaCheckCircle size={10} className="ml-auto text-blue-500" />}
                      </button>
                      {snapshots.length > 0 && (
                        <>
                          <div className="border-t border-gray-100 my-1" />
                          <p className="px-4 py-1 text-[9px] text-gray-400 font-black uppercase tracking-widest cursor-pointer">Closed Ledgers</p>
                          {snapshots.map(snap => (
                            <button key={snap._id} onClick={() => { setSelectedView(snap._id); setDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition cursor-pointer flex items-start gap-2 ${selectedView === snap._id ? "bg-gray-50" : ""}`}>
                              <FaLock size={9} className="text-gray-400 mt-0.5 shrink-0" />
                              <div><p className="text-xs font-bold text-gray-800">{snap.title}</p><p className="text-[10px] text-gray-400">{fmtDate(snap.closedAt)}</p></div>
                              {selectedView === snap._id && <FaCheckCircle size={10} className="ml-auto text-blue-500 mt-0.5 shrink-0" />}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
                {isCurrentView && (
                  <button onClick={() => setShowInitialModal(true)} className="flex cursor-pointer items-center gap-2 bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-600 transition whitespace-nowrap">
                    <FaEdit size={10} /> {initialAmount > 0 ? "Edit Initial" : "Set Initial"}
                  </button>
                )}
                {isCurrentView && currentLedger.length > 0 && (
                  <button onClick={() => setShowCloseModal(true)} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl text-xs font-black hover:bg-red-600 transition whitespace-nowrap">
                    <FaLock size={10} /> Close Ledger
                  </button>
                )}
                <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap">PRINT REPORT</button>
              </div>
            </div>
            {!isCurrentView && activeSnapshot && (
              <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                <FaLock size={10} /> Closed Ledger — {activeSnapshot.title} &nbsp;|&nbsp; Closed on {fmtDate(activeSnapshot.closedAt)}
              </div>
            )}
          </div>

          {!isCurrentView && !activeSnapshot
            ? <div className="py-20 text-center animate-pulse"><p className="text-gray-400 font-bold text-sm">Loading snapshot...</p></div>
            : <LedgerTable rows={displayRows} openingBalance={displayOpeningBalance}
              initialAmount={isCurrentView ? initialAmount : 0}
              initialAmountType={isCurrentView ? initialAmountType : "charge"} />
          }

          <SummaryFooter totalCharge={totalCharge} totalPayment={totalPayment} finalBalance={finalBalance} openingBalance={displayOpeningBalance} />

          <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-8 bg-white">
            <div className="text-[10px] text-gray-400 font-medium order-2 sm:order-1 uppercase">OFFICIAL STATEMENT • {new Date().toLocaleString()}</div>
            <div className="text-center order-1 sm:order-2">
              <div className="w-40 h-px bg-gray-200 mb-2"></div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}