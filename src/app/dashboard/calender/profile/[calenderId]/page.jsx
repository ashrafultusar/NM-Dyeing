"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, use, useCallback } from "react";
import { FaArrowLeft, FaChevronDown, FaChevronUp, FaLock, FaTimes, FaCheckCircle, FaEdit, FaPrint } from "react-icons/fa";
import { toast } from "react-toastify";

function CalenderSavedBillsTab({ calenderId }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch(`/api/calender/ledger/${calenderId}/saved-invoices`);
        const data = await res.json();
        if (data.success) {
          setInvoices(data.invoices);
        } else {
          toast.error("Failed to fetch saved invoices");
        }
      } catch {
        toast.error("Server error");
      } finally {
        setLoading(false);
      }
    }
    if (calenderId) fetchInvoices();
  }, [calenderId]);

  const handlePrint = (invoiceId) => {
    setExpandedId(invoiceId);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (loading) {
    return (
      <div className="p-10 text-center font-bold text-gray-500 animate-pulse uppercase">
        Loading Saved Invoices...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.length === 0 ? (
        <div className="text-center py-10 text-gray-400 font-bold">
          No saved invoices found.
        </div>
      ) : (
        invoices.map((inv) => {
          const isExpanded = expandedId === inv._id;
          return (
            <div
              key={inv._id}
              className={`border rounded-xl overflow-hidden transition-all duration-300 print:border-none print:block ${isExpanded ? "border-indigo-300 ring-2 ring-indigo-50" : "border-gray-200"
                } ${!isExpanded && "print:hidden"}`}
            >
              <div
                className="bg-gray-50 px-5 py-4 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-100 transition print:hidden"
                onClick={() => setExpandedId(isExpanded ? null : inv._id)}
              >
                <div>
                  <h3 className="text-sm font-black text-gray-900">
                    {inv.invoiceNumber} — {inv.title}
                  </h3>
                  <p className="text-xs text-gray-600 font-bold mt-1">
                    Company: <span className="text-indigo-600">{inv.companyName}</span>{" "}
                    {inv.orderIds?.length > 0 && `| Orders: ${inv.orderIds.join(", ")}`}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                    Saved On: {fmtDate(inv.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Total Billed</p>
                    <p className="text-sm font-black">৳{inv.totalCharge?.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Total Paid</p>
                    <p className="text-sm font-black text-green-600">
                      ৳{inv.totalPayment?.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrint(inv._id);
                    }}
                    className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition"
                    title="Print Invoice"
                  >
                    <FaPrint size={14} />
                  </button>
                  <div className="text-gray-400">
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>
              </div>

              {/* Print Only Header */}
              <div className="hidden print:block p-6 border-b border-gray-200">
                <h2 className="text-2xl font-black mb-2">{inv.title || "Invoice"}</h2>
                <p className="font-bold text-gray-800">Invoice No: {inv.invoiceNumber}</p>
                <p className="font-bold text-gray-800">Company: {inv.companyName}</p>
                <p className="text-sm text-gray-500">Date: {fmtDate(inv.createdAt)}</p>
              </div>

              {/* Expanded Content */}
              <div
                className={`${isExpanded ? "block" : "hidden"
                  } print:block bg-white transition-all`}
              >
                <div className="overflow-x-auto w-full border-t border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "Date",
                          "Order ID",
                          "Company",
                          "Method",
                          "Description",
                          "Charge (+)",
                          "Payment (-)",
                        ].map((h, i) => (
                          <th
                            key={h}
                            className={`px-4 py-3 font-black text-gray-500 uppercase text-[10px] ${i >= 5 ? "text-right" : "text-left"
                              }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {inv.records.map((row, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/10">
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-[11px] font-medium">
                            {fmtDate(row.date)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold text-indigo-600">
                            {row.displayOrderId || "—"}
                          </td>
                          <td className="px-4 py-3 text-[11px] font-semibold text-gray-700 max-w-[150px] truncate">
                            {row.companyName || "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${row.type === "credit"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                                }`}
                            >
                              {row.provider}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700 text-xs">
                            <div className="font-bold text-gray-900">{row.description}</div>
                            {row.colour && (
                              <span className="text-[10px] text-gray-400 italic leading-none">
                                {row.colour}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {row.charge > 0 ? (
                              <div className="text-gray-900 font-bold text-[11px]">
                                ({row.qty} × {row.price}) = ৳{row.charge.toLocaleString()}
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3 text-right text-green-600 font-black text-xs whitespace-nowrap">
                            {row.payment > 0 ? `৳${row.payment.toLocaleString()}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="5" className="px-4 py-3 text-right text-xs font-black uppercase text-gray-500">Totals</td>
                        <td className="px-4 py-3 text-right font-black text-gray-900 text-sm">৳{inv.totalCharge?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-black text-green-600 text-sm">৳{inv.totalPayment?.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function buildLedger(billings, payments, openingBalance = 0, initialCharge = 0, initialPayment = 0, savedRecordIds = []) {
  let startBal = openingBalance;
  if (initialCharge > 0 || initialPayment > 0) {
    startBal += initialPayment - initialCharge;
  }
  const combined = [
    ...billings.map((b) => ({
      date: b.createdAt, provider: "CALENDER BILL",
      displayOrderId: b.displayOrderId || "N/A",
      companyName: b.companyName || "Unknown",
      description: `Invoice: ${b.invoiceNumber}`,
      qty: b.totalQty, price: b.price, charge: b.total, payment: 0, type: "debit", colour: b.colour,
      recordId: b._id, modelType: "BillingSummary", isSaved: savedRecordIds.includes(b._id.toString()),
    })),
    ...payments.map((p) => ({
      date: p.date, provider: p.method.toUpperCase(),
      description: p.description || "Payment Received",
      charge: 0, payment: p.amount, type: "credit",
      recordId: p._id, modelType: "Payment", isSaved: savedRecordIds.includes(p._id.toString()),
    })),
  ];
  combined.sort((a, b) => new Date(a.date) - new Date(b.date));
  let bal = startBal;
  return combined.map((item) => { bal += item.payment - item.charge; return { ...item, balance: bal }; });
}

function fmtDate(d) { return new Date(d).toLocaleDateString("en-GB"); }

function InitialAmountModal({ initCharge, initPayment, initDate, onClose, onConfirm, loading }) {
  const [chargeAmount, setChargeAmount] = useState(initCharge > 0 ? String(initCharge) : "");
  const [paymentAmount, setPaymentAmount] = useState(initPayment > 0 ? String(initPayment) : "");
  const [dateVal, setDateVal] = useState(initDate ? new Date(initDate).toISOString().split('T')[0] : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const cVal = parseFloat(chargeAmount) || 0;
    const pVal = parseFloat(paymentAmount) || 0;
    if (cVal < 0 || pVal < 0) return toast.error("Valid amount দিন");
    if (chargeAmount === "" && paymentAmount === "") return toast.error("Charge বা Payment দিন");
    onConfirm(cVal, pVal, dateVal || null);
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5 text-red-600">Charge (+)</label>
              <input type="number" min="0" step="any" value={chargeAmount} onChange={(e) => setChargeAmount(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent" />
              <p className="text-[10px] font-medium mt-1 text-gray-500">Client আমার কাছে পাওনা</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5 text-green-600">Payment (-)</label>
              <input type="number" min="0" step="any" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" />
              <p className="text-[10px] font-medium mt-1 text-gray-500">আমি client-কে দিতে হবে</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5">Date (Optional)</label>
            <input type="date" value={dateVal} onChange={(e) => setDateVal(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
            <p className="text-[10px] font-medium mt-1 text-gray-500">যে দিন Initial Amount টি যুক্ত করা হয়েছিল</p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
            <p className="text-[11px] text-indigo-700 font-medium">💡 আপনি চাইলে শুধু Charge, শুধু Payment, অথবা দুটি একসাথেই save করতে পারবেন। এটি ledger-এর সবার উপরে দেখাবে।</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-black hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2">
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"><FaTimes size={16} /></button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><FaLock className="text-red-500" size={16} /></div>
          <div>
            <h2 className="font-black text-gray-900 text-base">Calender Ledger Close করুন</h2>
            <p className="text-[11px] text-gray-500">Current data snapshot হিসেবে save হবে</p>
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return toast.error("title দিন"); onConfirm(title.trim()); }} className="space-y-4">
          <input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="যেমন: January 2025 Closing"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-[11px] text-amber-700 font-medium">⚠️ Close করার পর সব data save হবে এবং current ledger empty হবে।</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading || !title.trim()} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-black hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : <><FaLock size={12} /> Confirm Close</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LedgerTable({ rows, openingBalance, initialCharge, initialPayment, initialDate, isCurrentView, selectedRows, setSelectedRows }) {
  const hasInitial = initialCharge > 0 || initialPayment > 0;
  const initialBalance = (initialPayment || 0) - (initialCharge || 0);
  const effectiveOpening = openingBalance + initialBalance;
  if (!rows.length && !hasInitial && openingBalance === 0) {
    return <div className="py-20 text-center"><p className="text-gray-400 font-bold text-sm uppercase">কোনো data নেই</p><p className="text-gray-300 text-xs mt-1">নতুন bill যোগ হলে এখানে দেখাবে</p></div>;
  }
  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {isCurrentView && (
              <th className="px-4 py-4 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  checked={rows.length > 0 && selectedRows.length === rows.filter(r => !r.isSaved).length && rows.filter(r => !r.isSaved).length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(rows.filter(r => !r.isSaved));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                />
              </th>
            )}
            {[
              "Date",
              "Order ID",
              "Company",
              "Method",
              "Description",
              "Charge (+)",
              "Payment (-)",
              "Balance",
            ].map((h, i) => (
              <th key={h} className={`px-4 py-4 font-black text-gray-500 uppercase text-[10px] ${i >= 5 ? "text-right" : "text-left"}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {openingBalance !== 0 && (
            <tr className="bg-blue-50/60">
              {isCurrentView && <td className="px-4 py-3"></td>}
              <td className="px-4 py-3 text-[11px] font-medium text-blue-600">—</td>
              <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold">—</td>
              <td className="px-4 py-3 text-[11px] font-semibold">—</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-blue-100 text-blue-700">CARRY FWD</span></td>
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
          {hasInitial && (
            <tr className="bg-indigo-50/60">
              {isCurrentView && <td className="px-4 py-3"></td>}
              <td className="px-4 py-3 text-[11px] font-medium text-indigo-600">{initialDate ? fmtDate(initialDate) : "—"}</td>
              <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold">—</td>
              <td className="px-4 py-3 text-[11px] font-semibold">—</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${initialPayment > 0 && initialCharge === 0 ? "bg-green-100 text-green-700" : (initialCharge > 0 && initialPayment === 0 ? "bg-red-100 text-red-700" : "bg-indigo-100 text-indigo-700")}`}>INITIAL</span>
              </td>
              <td className="px-4 py-3 text-xs font-bold text-indigo-700">Opening Balance (শুরুর পুরনো হিসাব)</td>
              <td className="px-4 py-3 text-right text-[11px] font-bold text-gray-700">{initialCharge > 0 ? `৳${initialCharge.toLocaleString()}` : "—"}</td>
              <td className="px-4 py-3 text-right text-[11px] font-bold text-green-600">{initialPayment > 0 ? `৳${initialPayment.toLocaleString()}` : "—"}</td>
              <td className="px-4 py-3 text-right">
                <div className={`text-xs font-black px-2 py-1 rounded ${effectiveOpening < 0 ? "text-red-600 bg-red-50" : "text-teal-600 bg-teal-50"}`}>
                  {effectiveOpening < 0 ? `- ৳${Math.abs(effectiveOpening).toLocaleString()}` : `+ ৳${effectiveOpening.toLocaleString()}`}
                </div>
              </td>
            </tr>
          )}
          {rows.map((row, idx) => {
            const isSelected = selectedRows.some(r => r.recordId === row.recordId && r.modelType === row.modelType);
            return (
              <tr key={idx} className={`transition-colors ${isSelected ? "bg-indigo-50/50" : "hover:bg-blue-50/30"} ${row.isSaved ? "opacity-60" : ""}`}>
                {isCurrentView && (
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      disabled={row.isSaved}
                      checked={row.isSaved || isSelected}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedRows([...selectedRows, row]);
                        else setSelectedRows(selectedRows.filter(r => !(r.recordId === row.recordId && r.modelType === row.modelType)));
                      }}
                      className={`rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${row.isSaved ? "cursor-not-allowed grayscale" : "cursor-pointer"}`}
                    />
                    {row.isSaved && <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-gray-200 text-gray-500">Saved</span>}
                  </td>
                )}
                <td className="px-4 py-4 whitespace-nowrap text-gray-600 text-[11px] font-medium">{fmtDate(row.date)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-[11px] font-bold text-indigo-600">{row.displayOrderId || "—"}</td>
                <td className="px-4 py-4 text-[11px] font-semibold text-gray-700 max-w-[150px] truncate">{row.companyName || "—"}</td>
                <td className="px-4 py-4 whitespace-nowrap"><span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${row.type === "credit" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{row.provider}</span></td>
                <td className="px-4 py-4 text-gray-700 text-xs">
                  <div className="font-bold text-gray-900">{row.description}</div>
                  {row.colour && <span className="text-[10px] text-gray-400 italic">{row.colour}</span>}
                </td>
                <td className="px-4 py-4 text-right whitespace-nowrap">
                  {row.charge > 0 ? <div className="text-gray-900 font-bold text-[11px]">({row.qty} × {row.price}) = ৳{row.charge.toLocaleString()}</div> : "—"}
                </td>
                <td className="px-4 py-4 text-right text-green-600 font-black text-xs whitespace-nowrap">{row.payment > 0 ? `৳${row.payment.toLocaleString()}` : "—"}</td>
                <td className="px-4 py-4 text-right whitespace-nowrap">
                  <div className={`text-xs font-black px-2 py-1 rounded ${row.balance < 0 ? "text-red-600 bg-red-50" : "text-teal-600 bg-teal-50"}`}>
                    {row.balance < 0 ? `- ৳${Math.abs(row.balance).toLocaleString()}` : `+ ৳${row.balance.toLocaleString()}`}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SummaryFooter({ totalCharge, totalPayment, finalBalance }) {
  return (
    <div className="bg-gray-900 p-5 sm:p-8 text-white">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        <div className="space-y-1 text-center sm:text-left border-b sm:border-b-0 sm:border-r border-gray-800 pb-4 sm:pb-0">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Bill</p>
          <p className="text-lg font-bold">৳{totalCharge.toLocaleString()}</p>
        </div>
        <div className="space-y-1 text-center sm:text-left border-b sm:border-b-0 sm:border-r border-gray-800 pb-4 sm:pb-0">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Paid</p>
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

export default function CalenderProfileLedger({ params }) {
  const resolvedParams = use(params);
  const calenderId = resolvedParams?.calenderId;
  const router = useRouter();

  const [selectedView, setSelectedView] = useState("current");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [calender, setCalender] = useState(null);
  const [currentLedger, setCurrentLedger] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [initialCharge, setInitialCharge] = useState(0);
  const [initialPayment, setInitialPayment] = useState(0);
  const [initialDate, setInitialDate] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotCache, setSnapshotCache] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isSavingSelected, setIsSavingSelected] = useState(false);
  const [activeTab, setActiveTab] = useState("ledger");

  const fetchCurrentLedger = useCallback(async () => {
    try {
      const res = await fetch(`/api/calender/ledger/${calenderId}`);
      const result = await res.json();
      if (result.success) {
        const { calender: c, billings, payments, openingBalance: ob = 0, initialCharge: ic = 0, initialPayment: ip = 0, initialDate: id = null, savedRecordIds = [] } = result.data;
        setCalender(c); setOpeningBalance(ob);
        setInitialCharge(ic); setInitialPayment(ip);
        setInitialDate(id);
        setCurrentLedger(buildLedger(billings, payments, ob, ic, ip, savedRecordIds));
      }
    } catch { toast.error("Failed to load ledger"); }
  }, [calenderId]);

  const fetchSnapshots = useCallback(async () => {
    try {
      const res = await fetch(`/api/calender/ledger/${calenderId}/snapshots`);
      const result = await res.json();
      if (result.success) setSnapshots(result.snapshots);
    } catch { toast.error("Failed to load snapshots"); }
  }, [calenderId]);

  useEffect(() => {
    if (!calenderId) return;
    Promise.all([fetchCurrentLedger(), fetchSnapshots()]).finally(() => setPageLoading(false));
  }, [calenderId, fetchCurrentLedger, fetchSnapshots]);

  const loadSnapshot = useCallback(async (snapshotId) => {
    if (snapshotCache[snapshotId]) return;
    try {
      const res = await fetch(`/api/calender/ledger/${calenderId}/snapshots/${snapshotId}`);
      const result = await res.json();
      if (result.success) setSnapshotCache(prev => ({ ...prev, [snapshotId]: result.snapshot }));
    } catch { toast.error("Failed to load snapshot"); }
  }, [calenderId, snapshotCache]);

  useEffect(() => { if (selectedView !== "current") loadSnapshot(selectedView); }, [selectedView, loadSnapshot]);

  const handleSaveSelected = async () => {
    if (!selectedRows.length) return;
    const title = prompt("Saved Invoice-এর জন্য একটি Title দিন (ঐচ্ছিক):", "New Invoice");
    if (title === null) return;

    setIsSavingSelected(true);
    const totalCharge = selectedRows.reduce((a, b) => a + (b.charge || 0), 0);
    const totalPayment = selectedRows.reduce((a, b) => a + (b.payment || 0), 0);

    try {
      const res = await fetch(`/api/calender/ledger/${calenderId}/saved-invoices`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, records: selectedRows, totalCharge, totalPayment }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Invoice সফলভাবে সেভ হয়েছে!");
        setSelectedRows([]);
        await fetchCurrentLedger();
      } else { toast.error(result.message || "Failed to save selected bills"); }
    } catch { toast.error("Server Error"); }
    finally { setIsSavingSelected(false); }
  };

  const handleClose = async (title) => {
    setCloseLoading(true);
    try {
      const res = await fetch(`/api/calender/ledger/${calenderId}/close`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Calender Ledger সফলভাবে close হয়েছে!");
        setShowCloseModal(false); setSelectedView("current"); setSnapshotCache({});
        await Promise.all([fetchCurrentLedger(), fetchSnapshots()]);
      } else { toast.error(result.message || "সমস্যা হয়েছে"); }
    } catch { toast.error("Server error"); }
    finally { setCloseLoading(false); }
  };

  const handleSetInitialAmount = async (charge, payment, date) => {
    setInitialLoading(true);
    try {
      const res = await fetch(`/api/calender/${calenderId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initialCharge: charge, initialPayment: payment, initialDate: date }),
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
      {showInitialModal && <InitialAmountModal initCharge={initialCharge} initPayment={initialPayment} initDate={initialDate} onClose={() => setShowInitialModal(false)} onConfirm={handleSetInitialAmount} loading={initialLoading} />}
      <div className="mt-12 md:mt-8 lg:mt-1 max-w-6xl mx-auto p-3 sm:p-6 min-h-screen">
        <button onClick={() => router.back()} className="flex cursor-pointer items-center gap-2 bg-blue-100 px-2 py-1 rounded text-gray-600 hover:text-blue-600 font-bold text-sm mb-4 print:hidden"><FaArrowLeft size={14} /> BACK</button>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden print:border-none print:shadow-none">
          <div className="border-b border-gray-100 bg-gray-50 flex print:hidden">
            <button
              onClick={() => setActiveTab("ledger")}
              className={`cursor-pointer flex-1 py-4 text-sm font-black uppercase tracking-wider transition-colors ${activeTab === "ledger"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
            >
              Ledger Statement
            </button>
            <button
              onClick={() => setActiveTab("saved-bills")}
              className={`cursor-pointer flex-1 py-4 text-sm font-black uppercase tracking-wider transition-colors ${activeTab === "saved-bills"
                ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
            >
              Saved Invoices
            </button>
          </div>

          <div className="p-5 sm:p-8 border-b border-gray-100 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase">{activeTab === "ledger" ? "Calender Ledger Statement" : "Saved Bills / Invoices"}</h1>
                <div className="mt-4 space-y-1">
                  <p className="font-bold text-blue-600 text-lg">{calender?.name}</p>
                  <p className="text-xs text-gray-500 uppercase font-bold">Location: {calender?.location}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto print:hidden flex-wrap">
                {activeTab === "ledger" && isCurrentView && selectedRows.length > 0 && (
                  <button onClick={handleSaveSelected} disabled={isSavingSelected} className="flex cursor-pointer items-center gap-2 bg-indigo-600 text-white border border-indigo-700 rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-indigo-700 transition w-full sm:w-auto whitespace-nowrap disabled:opacity-50 shadow-sm">
                    {isSavingSelected ? "Saving..." : `Save Selected (${selectedRows.length})`}
                  </button>
                )}
                {activeTab === "ledger" && (
                  <div className="relative">
                    <button onClick={() => setDropdownOpen(p => !p)} className="flex cursor-pointer items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition w-full sm:w-auto whitespace-nowrap">
                      {selectedLabel} <FaChevronDown size={10} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-40 py-1 overflow-hidden">
                        <button onClick={() => { setSelectedView("current"); setDropdownOpen(false); }} className={`w-full cursor-pointer text-left px-4 py-2.5 text-xs font-bold hover:bg-blue-50 flex items-center gap-2 transition ${isCurrentView ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}>
                          📂 Current Ledger {isCurrentView && <FaCheckCircle size={10} className="ml-auto text-blue-500" />}
                        </button>
                        {snapshots.length > 0 && (<>
                          <div className="border-t border-gray-100 my-1" />
                          <p className="px-4 py-1 text-[9px] text-gray-400 font-black uppercase tracking-widest">Closed Ledgers</p>
                          {snapshots.map(snap => (
                            <button key={snap._id} onClick={() => { setSelectedView(snap._id); setDropdownOpen(false); }} className={`w-full cursor-pointer text-left px-4 py-2.5 hover:bg-gray-50 transition flex items-start gap-2 ${selectedView === snap._id ? "bg-gray-50" : ""}`}>
                              <FaLock size={9} className="text-gray-400 mt-0.5 shrink-0" />
                              <div><p className="text-xs font-bold text-gray-800">{snap.title}</p><p className="text-[10px] text-gray-400">{fmtDate(snap.closedAt)}</p></div>
                              {selectedView === snap._id && <FaCheckCircle size={10} className="ml-auto text-blue-500 mt-0.5 shrink-0" />}
                            </button>
                          ))}
                        </>)}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "ledger" && isCurrentView && (
                  <button onClick={() => setShowInitialModal(true)} className="cursor-pointer flex items-center gap-2 bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-600 transition whitespace-nowrap">
                    <FaEdit size={10} /> {(initialCharge > 0 || initialPayment > 0) ? "Edit Initial" : "Set Initial"}
                  </button>
                )}
                {activeTab === "ledger" && isCurrentView && currentLedger.length > 0 && (
                  <button onClick={() => setShowCloseModal(true)} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl text-xs font-black hover:bg-red-600 transition whitespace-nowrap">
                    <FaLock size={10} /> Close Ledger
                  </button>
                )}
                {activeTab === "ledger" && (
                  <button onClick={() => window.print()} className="cursor-pointer bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap">PRINT REPORT</button>
                )}
              </div>
            </div>
            {!isCurrentView && activeSnapshot && (
              <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                <FaLock size={10} /> Closed Ledger — {activeSnapshot.title} &nbsp;|&nbsp; Closed on {fmtDate(activeSnapshot.closedAt)}
              </div>
            )}
          </div>

          {activeTab === "ledger" ? (
            <>
              {!isCurrentView && !activeSnapshot
                ? <div className="py-20 text-center animate-pulse"><p className="text-gray-400 font-bold text-sm">Loading snapshot...</p></div>
                : <LedgerTable rows={displayRows} openingBalance={displayOpeningBalance}
                  initialCharge={isCurrentView ? initialCharge : (activeSnapshot?.initialCharge ?? 0)}
                  initialPayment={isCurrentView ? initialPayment : (activeSnapshot?.initialPayment ?? 0)}
                  initialDate={isCurrentView ? initialDate : (activeSnapshot?.initialDate ?? null)}
                  isCurrentView={isCurrentView} selectedRows={selectedRows} setSelectedRows={setSelectedRows} />
              }
              <SummaryFooter totalCharge={totalCharge} totalPayment={totalPayment} finalBalance={finalBalance} />
            </>
          ) : (
            <div className="p-5 sm:p-8">
              <CalenderSavedBillsTab calenderId={calenderId} />
            </div>
          )}

          <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-8 bg-white">
            <div className="text-[10px] text-gray-400 font-medium order-2 sm:order-1 uppercase">OFFICIAL STATEMENT • {new Date().toLocaleString()}</div>
            <div className="text-center order-1 sm:order-2"><div className="w-40 h-px bg-gray-200 mb-2"></div><p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Authorized Signature</p></div>
          </div>
        </div>
      </div>
    </>
  );
}
