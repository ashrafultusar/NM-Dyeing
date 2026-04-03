"use client";
import React from "react";
import { fmtDate } from "./ledgerUtils";

function LedgerTable({
    rows,
    openingBalance,
    initialCharge,
    initialPayment,
    initialDate,
    isCurrentView,
    selectedRows,
    setSelectedRows,
}) {
    const hasInitial = initialCharge > 0 || initialPayment > 0;
    const initialBalance = (initialPayment || 0) - (initialCharge || 0);
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
                        {isCurrentView && (
                            <th className="px-4 py-4 w-10">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    checked={
                                        rows.length > 0 &&
                                        selectedRows.length === rows.filter((r) => !r.isSaved).length &&
                                        rows.filter((r) => !r.isSaved).length > 0
                                    }
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedRows(rows.filter((r) => !r.isSaved));
                                        else setSelectedRows([]);
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
                            <th key={h} className={`px-4 py-4 font-black text-gray-500 uppercase text-[10px] ${i >= 5 ? "text-right" : "text-left"}`}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {openingBalance !== 0 && (
                        <tr className="bg-blue-50/60">
                            {isCurrentView && <td className="px-4 py-3"></td>}
                            <td className="px-4 py-3 whitespace-nowrap text-[11px] font-medium text-blue-600">—</td>
                            <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold">—</td>
                            <td className="px-4 py-3 text-[11px] font-semibold">—</td>
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
                    {hasInitial && (
                        <tr className="bg-indigo-50/60">
                            {isCurrentView && <td className="px-4 py-3"></td>}
                            <td className="px-4 py-3 whitespace-nowrap text-[11px] font-medium text-indigo-600">{initialDate ? fmtDate(initialDate) : "—"}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-[11px] font-bold">—</td>
                            <td className="px-4 py-3 text-[11px] font-semibold">—</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${initialPayment > 0 && initialCharge === 0 ? "bg-green-100 text-green-700" : initialCharge > 0 && initialPayment === 0 ? "bg-red-100 text-red-700" : "bg-indigo-100 text-indigo-700"}`}>INITIAL</span>
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
                        const isSelected = selectedRows.some((r) => r.recordId === row.recordId && r.modelType === row.modelType);
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
                                                else setSelectedRows(selectedRows.filter((r) => !(r.recordId === row.recordId && r.modelType === row.modelType)));
                                            }}
                                            className={`rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 ${row.isSaved ? "cursor-not-allowed grayscale" : "cursor-pointer"}`}
                                        />
                                        {row.isSaved && <span className="ml-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-gray-200 text-gray-500">Saved</span>}
                                    </td>
                                )}
                                <td className="px-4 py-4 whitespace-nowrap text-gray-600 text-[11px] font-medium">{fmtDate(row.date)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-[11px] font-bold text-indigo-600">{row.displayOrderId || "—"}</td>
                                <td className="px-4 py-4 text-[11px] font-semibold text-gray-700 max-w-[150px] truncate">{row.companyName || "—"}</td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${row.type === "credit" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                        {row.provider}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-gray-700 text-xs">
                                    <div className="font-bold text-gray-900">{row.description}</div>
                                    {row.colour && <span className="text-[10px] text-gray-400 italic leading-none">{row.colour}</span>}
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

export default React.memo(LedgerTable);
