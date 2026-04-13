"use client";
import React, { useEffect, useState, useRef } from "react";
import { FaChevronDown, FaChevronUp, FaPrint, FaTrash, FaPlus, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { fmtDate } from "./ledgerUtils";
import SavedInvoicePrint from "@/components/Print/ledger/SavedInvoicePrint";

function CalenderSavedBillsTab({ calenderId, selectedView, availableRows, onInvoiceUpdated, companyAddress }) {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    const [appendingInvoiceId, setAppendingInvoiceId] = useState(null);
    const [appendSelectedRows, setAppendSelectedRows] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);

    const [printingInvoice, setPrintingInvoice] = useState(null);
    const printRef = useRef(null);

    useEffect(() => {
        if (calenderId) fetchInvoices();
    }, [calenderId, selectedView]);

    async function fetchInvoices() {
        setLoading(true);
        try {
            const res = await fetch(`/api/calender/ledger/${calenderId}/saved-invoices?view=${selectedView}&_t=${Date.now()}`);
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

    const handlePrint = (invoice) => {
        setPrintingInvoice(invoice);
        setTimeout(() => {
            if (!printRef.current) return;
            const printArea = printRef.current.cloneNode(true);
            const tempDiv = document.createElement("div");
            tempDiv.className = "print-only";
            tempDiv.appendChild(printArea);
            document.body.appendChild(tempDiv);
            window.print();
            setTimeout(() => {
                document.body.removeChild(tempDiv);
                setPrintingInvoice(null);
            }, 500);
        }, 100);
    };

    const handleRemoveRecord = async (invoiceId, record) => {
        if (!confirm("Are you sure you want to remove this item? It will return to the Current Ledger.")) return;
        try {
            const res = await fetch(`/api/calender/ledger/${calenderId}/saved-invoices/${invoiceId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "remove", record })
            });
            if (res.ok) {
                toast.success("Item removed from Invoice!");
                fetchInvoices();
                onInvoiceUpdated?.();
            } else {
                toast.error("Failed to remove item");
            }
        } catch {
            toast.error("Server error");
        }
    };

    const handleAppend = async () => {
        if (!appendSelectedRows.length) return;
        setActionLoading(true);
        const totalCharge = appendSelectedRows.reduce((acc, row) => acc + (row.charge || 0), 0);
        const totalPayment = appendSelectedRows.reduce((acc, row) => acc + (row.payment || 0), 0);

        try {
            const res = await fetch(`/api/calender/ledger/${calenderId}/saved-invoices/${appendingInvoiceId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ records: appendSelectedRows, totalCharge, totalPayment })
            });
            if (res.ok) {
                toast.success("Items appended successfully!");
                setAppendingInvoiceId(null);
                setAppendSelectedRows([]);
                fetchInvoices();
                onInvoiceUpdated?.();
            } else {
                toast.error("Failed to append items");
            }
        } catch {
            toast.error("Server error");
        } finally {
            setActionLoading(false);
        }
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
                                         {fmtDate(inv.createdAt)}
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
                                    {selectedView === "current" && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAppendingInvoiceId(inv._id);
                                                setAppendSelectedRows([]);
                                            }}
                                            className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition"
                                            title="Add Available Data to this Invoice"
                                        >
                                            <FaPlus size={14} />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePrint(inv);
                                        }}
                                        className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200 transition print:hidden"
                                        title="Print Invoice"
                                    >
                                        <FaPrint size={14} />
                                    </button>
                                    <div className="text-gray-400 border-l border-gray-300 pl-4 ml-2">
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
                                                {selectedView === "current" && (
                                                    <th className="px-4 py-3 font-black text-gray-500 uppercase text-[10px] text-right print:hidden">Action</th>
                                                )}
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
                                                    {selectedView === "current" && (
                                                        <td className="px-4 py-3 text-right print:hidden whitespace-nowrap">
                                                            <button
                                                                onClick={() => handleRemoveRecord(inv._id, row)}
                                                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded transition"
                                                                title="Remove item"
                                                            >
                                                                <FaTrash size={12} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 divide-y divide-gray-200">
                                            <tr>
                                                <td colSpan="5" className="px-4 py-3 text-right text-xs font-black uppercase text-gray-500">Totals</td>
                                                <td className="px-4 py-3 text-right font-black text-gray-900 text-sm">৳{inv.totalCharge?.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-black text-green-600 text-sm">৳{inv.totalPayment?.toLocaleString()}</td>
                                                {selectedView === "current" && <td className="print:hidden"></td>}
                                            </tr>
                                            <tr className="bg-white">
                                                <td colSpan="5" className="px-4 py-3 text-right text-[10px] font-black uppercase text-indigo-500">Net Due </td>
                                                <td colSpan="2" className={`px-4 py-3 text-right font-black text-sm tracking-tight ${(inv.totalCharge || 0) - (inv.totalPayment || 0) > 0 ? "text-red-500" : "text-gray-900"}`}>
                                                    ৳{((inv.totalCharge || 0) - (inv.totalPayment || 0)).toLocaleString()}
                                                </td>
                                                {selectedView === "current" && <td className="print:hidden"></td>}
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {appendingInvoiceId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <div>
                                <h3 className="font-black text-gray-800 text-lg">Append Data to Invoice</h3>
                                <p className="text-xs text-gray-500 mt-1 font-semibold">Select items from the Current Ledger to add them to this invoice.</p>
                            </div>
                            <button onClick={() => setAppendingInvoiceId(null)} className="text-gray-400 hover:text-red-500 transition"><FaTimes size={20} /></button>
                        </div>

                        <div className="p-0 overflow-y-auto flex-1">
                            {(!availableRows || availableRows.length === 0) ? (
                                <div className="text-center text-gray-500 py-16 font-bold flex flex-col items-center justify-center">
                                    <span className="text-4xl mb-3 block">📭</span>
                                    No available unsaved items to append in the Current Ledger.
                                </div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200 text-left">
                                    <thead className="bg-gray-100 sticky top-0 shadow-sm z-10">
                                        <tr>
                                            <th className="px-4 py-3 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                    checked={appendSelectedRows.length === availableRows.length}
                                                    onChange={e => {
                                                        if (e.target.checked) setAppendSelectedRows([...availableRows]);
                                                        else setAppendSelectedRows([]);
                                                    }}
                                                />
                                            </th>
                                            <th className="px-4 py-3 font-black text-gray-500 text-[10px] uppercase">Date</th>
                                            <th className="px-4 py-3 font-black text-gray-500 text-[10px] uppercase">Description</th>
                                            <th className="px-4 py-3 font-black text-gray-500 text-[10px] uppercase text-right">Charge</th>
                                            <th className="px-4 py-3 font-black text-gray-500 text-[10px] uppercase text-right">Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {availableRows.map((row, idx) => {
                                            const isSelected = appendSelectedRows.some(r => r.recordId === row.recordId && r.modelType === row.modelType);
                                            return (
                                                <tr key={idx} className={`hover:bg-blue-50 cursor-pointer transition ${isSelected ? "bg-indigo-50/50" : ""}`}
                                                    onClick={() => {
                                                        if (isSelected) setAppendSelectedRows(appendSelectedRows.filter(r => !(r.recordId === row.recordId && r.modelType === row.modelType)));
                                                        else setAppendSelectedRows([...appendSelectedRows, row]);
                                                    }}>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => { }}
                                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-gray-600">{fmtDate(row.date)}</td>
                                                    <td className="px-4 py-3 text-xs">
                                                        <div className="font-bold text-gray-900">{row.description}</div>
                                                        <div className="text-[10px] text-gray-500 mt-0.5">{row.companyName} | {row.provider}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-xs font-bold whitespace-nowrap">{row.charge > 0 ? `৳${row.charge.toLocaleString()}` : "—"}</td>
                                                    <td className="px-4 py-3 text-right text-xs font-bold text-green-600 whitespace-nowrap">{row.payment > 0 ? `৳${row.payment.toLocaleString()}` : "—"}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center rounded-b-xl">
                            <div className="font-bold text-sm text-gray-500">
                                {appendSelectedRows.length} items selected
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setAppendingInvoiceId(null)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition">Cancel</button>
                                <button
                                    disabled={!appendSelectedRows.length || actionLoading}
                                    onClick={handleAppend}
                                    className="px-6 py-2 font-black text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                                >
                                    {actionLoading ? "Appending..." : "Confirm Append"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: "none" }}>
                <div ref={printRef}>
                    <SavedInvoicePrint invoice={printingInvoice} companyAddress={companyAddress} />
                </div>
            </div>
        </div>
    );
}

export default React.memo(CalenderSavedBillsTab);
