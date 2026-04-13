"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import { FaArrowLeft, FaChevronDown, FaChevronUp, FaPrint } from "react-icons/fa";
import { toast } from "react-toastify";

function fmtDate(d) {
    return new Date(d).toLocaleDateString("en-GB");
}

export default function DyeingSavedBills({ params }) {
    const resolvedParams = use(params);
    const dyeingId = resolvedParams?.dyeingId;
    const router = useRouter();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        async function fetchInvoices() {
            try {
                const res = await fetch(`/api/dyeings/ledger/${dyeingId}/saved-invoices`);
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
        if (dyeingId) fetchInvoices();
    }, [dyeingId]);

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
        <div className="mt-12 md:mt-8 lg:mt-1 max-w-6xl mx-auto p-3 sm:p-6 min-h-screen">
            <button
                onClick={() => router.back()}
                className="flex cursor-pointer items-center gap-2 bg-blue-100 px-2 py-1 rounded text-gray-600 hover:text-blue-600 font-bold text-sm mb-6 print:hidden"
            >
                <FaArrowLeft size={14} /> BACK
            </button>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden print:border-none print:shadow-none">
                <div className="p-5 sm:p-8 border-b border-gray-100 bg-white">
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase">
                        Saved Bills / Invoices
                    </h1>
                    <p className="text-sm font-bold text-gray-500 mt-2">
                        Selected bills saved from the Dyeing ledger
                    </p>
                </div>

                <div className="p-5 sm:p-8 space-y-4">
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
            </div>
        </div>
    );
}
