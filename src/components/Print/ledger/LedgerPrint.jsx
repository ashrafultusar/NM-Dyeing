"use client";

import Image from "next/image";
import React from "react";
import { IoLogoWhatsapp } from "react-icons/io";
import { fmtDate } from "@/components/customer/ledgerUtils";

export default function LedgerPrint({
    customer,
    rows = [],
    openingBalance = 0,
    initialCharge = 0,
    initialPayment = 0,
    initialDate = null,
    totalCharge = 0,
    totalPayment = 0,
    finalBalance = 0,
    selectedLabel = "Current Ledger",
    role = "Customer"
}) {
    const hasInitial = initialCharge > 0 || initialPayment > 0;
    const initialBalance = (initialPayment || 0) - (initialCharge || 0);
    const effectiveOpening = openingBalance + initialBalance;

    return (
        <div className="print-area font-sans mt-12 text-gray-900 bg-white p-10 max-w-4xl mx-auto border border-gray-300 rounded-lg shadow-md print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full">
            {/* HEADER */}
            <div className="border-b-2 border-black pb-3 mb-4">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-3 justify-center">
                        <Image
                            src="/Image/logo.png"
                            alt="Company Logo"
                            width={60}
                            height={60}
                            priority
                            loading="eager"
                            className="object-contain"
                        />
                        <h1 className="text-2xl font-bold text-center -mb-3">
                            মেসার্স এম.এন ডাইং এন্ড ফিনিশিং এজেন্ট
                        </h1>
                    </div>
                    <p className="text-sm text-center mt-2">ঠিকানা: মাধবদী, নরসিংদী</p>
                    <p className="flex items-center justify-center gap-2 text-base whitespace-nowrap mt-1">
                        <span>Phone:</span>
                        <span>01711201870</span>
                        <span>01782155151</span>
                        <IoLogoWhatsapp className="text-green-600 text-xl" />
                        <Image src="/Image/bkash.png" width={18} height={18} alt="bKash" priority loading="eager" />
                    </p>
                </div>
            </div>

            <h2 className="text-center font-bold text-lg uppercase mb-4 border-b pb-2 inline-block mx-auto w-full">
                Ledger Statement - {selectedLabel}
            </h2>

            {/* CUSTOMER INFO */}
            <div className="grid grid-cols-2 text-sm font-medium border-b border-gray-400 pb-2 mb-4">
                <div className="space-y-1">
                    <p>
                        {role}: <span className="font-bold text-base">{customer?.companyName || "—"}</span>
                    </p>
                    <p>
                        Owner: <span className="font-normal">{customer?.ownerName || "—"}</span>
                    </p>
                </div>
                <div className="space-y-1 text-right">
                    <p>
                        Phone: <span className="font-normal">{customer?.phoneNumber || "—"}</span>
                    </p>
                    <p>
                        Address: <span className="font-normal uppercase text-xs">{customer?.address || "—"}</span>
                    </p>
                </div>
            </div>

            {/* TABLE */}
            <table className="w-full border border-gray-400 border-collapse text-xs mb-8">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-400 py-2 px-2 text-left">Date</th>
                        <th className="border border-gray-400 py-2 px-2 text-left">Order ID</th>
                        <th className="border border-gray-400 py-2 px-2 text-left">Method</th>
                        <th className="border border-gray-400 py-2 px-2 text-left">Description</th>
                        <th className="border border-gray-400 py-2 px-2 text-right">Charge (+)</th>
                        <th className="border border-gray-400 py-2 px-2 text-right">Payment (-)</th>
                        <th className="border border-gray-400 py-2 px-2 text-right">Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {openingBalance !== 0 && (
                        <tr className="bg-gray-50 text-gray-800">
                            <td className="border border-gray-400 py-1 px-2 font-medium text-center">—</td>
                            <td className="border border-gray-400 py-1 px-2 font-bold text-center">—</td>
                            <td className="border border-gray-400 py-1 px-2 text-center text-[10px] font-bold">CARRY FWD</td>
                            <td className="border border-gray-400 py-1 px-2 font-bold italic">Opening Balance (Previous Period)</td>
                            <td className="border border-gray-400 py-1 px-2 text-right text-center">—</td>
                            <td className="border border-gray-400 py-1 px-2 text-right text-center">—</td>
                            <td className="border border-gray-400 py-1 px-2 text-right font-bold">
                                {openingBalance < 0 ? `- ৳${Math.abs(openingBalance).toLocaleString()}` : `+ ৳${openingBalance.toLocaleString()}`}
                            </td>
                        </tr>
                    )}
                    {hasInitial && (
                        <tr className="bg-gray-50 text-gray-800">
                            <td className="border border-gray-400 py-1 px-2">{initialDate ? fmtDate(initialDate) : "—"}</td>
                            <td className="border border-gray-400 py-1 px-2 font-bold text-center">—</td>
                            <td className="border border-gray-400 py-1 px-2 text-center text-[10px] font-bold">INITIAL</td>
                            <td className="border border-gray-400 py-1 px-2 font-bold italic">Opening Balance (শুরুর পুরনো হিসাব)</td>
                            <td className="border border-gray-400 py-1 px-2 text-right">{initialCharge > 0 ? `৳${initialCharge.toLocaleString()}` : "—"}</td>
                            <td className="border border-gray-400 py-1 px-2 text-right">{initialPayment > 0 ? `৳${initialPayment.toLocaleString()}` : "—"}</td>
                            <td className="border border-gray-400 py-1 px-2 text-right font-bold">
                                {effectiveOpening < 0 ? `- ৳${Math.abs(effectiveOpening).toLocaleString()}` : `+ ৳${effectiveOpening.toLocaleString()}`}
                            </td>
                        </tr>
                    )}
                    {rows.map((row, idx) => (
                        <tr key={idx} className="even:bg-gray-50 text-gray-800">
                            <td className="border border-gray-400 py-2 px-2 whitespace-nowrap">{fmtDate(row.date)}</td>
                            <td className="border border-gray-400 py-2 px-2 font-bold">{row.displayOrderId || "—"}</td>
                            <td className="border border-gray-400 py-2 px-2 text-center text-[10px] font-bold uppercase">{row.provider}</td>
                            <td className="border border-gray-400 py-2 px-2">
                                <div className="font-bold">{row.description}</div>
                                {row.colour && <span className="text-[10px] text-gray-500 italic">Color: {row.colour}</span>}
                            </td>
                            <td className="border border-gray-400 py-2 px-2 text-right">
                                {row.charge > 0 ? `৳${row.charge.toLocaleString()}` : "—"}
                            </td>
                            <td className="border border-gray-400 py-2 px-2 text-right">
                                {row.payment > 0 ? `৳${row.payment.toLocaleString()}` : "—"}
                            </td>
                            <td className="border border-gray-400 py-2 px-2 text-right font-bold">
                                {row.balance < 0 ? `- ৳${Math.abs(row.balance).toLocaleString()}` : `+ ৳${row.balance.toLocaleString()}`}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-gray-100 font-bold text-sm">
                        <td colSpan={4} className="border border-gray-400 py-2 px-2 text-right">Totals:</td>
                        <td className="border border-gray-400 py-2 px-2 text-right text-red-600">৳{totalCharge.toLocaleString()}</td>
                        <td className="border border-gray-400 py-2 px-2 text-right text-green-600">৳{totalPayment.toLocaleString()}</td>
                        <td className="border border-gray-400 py-2 px-2 text-right">
                            {finalBalance < 0 ? `- ৳${Math.abs(finalBalance).toLocaleString()}` : `+ ৳${finalBalance.toLocaleString()}`}
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* SUMMARY */}
            <div className="w-full flex justify-end text-sm">
                <div className="w-[300px] border border-gray-400 p-2">
                    <div className="flex justify-between py-1 border-b">
                        <span>Total Billings (Charge):</span>
                        <span className="font-bold">৳{totalCharge.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b">
                        <span>Total Received (Payment):</span>
                        <span className="font-bold">৳{totalPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 mt-2 text-base font-black">
                        <span>Final Balance:</span>
                        <span className={finalBalance < 0 ? "text-red-600" : "text-green-600"}>
                            {finalBalance < 0 ? `${Math.abs(finalBalance).toLocaleString()} (Due)` : `${finalBalance.toLocaleString()} (Adv)`}
                        </span>
                    </div>
                </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-center text-xs mt-20">
                <div className="text-center pt-2" style={{ width: "150px", borderTop: "1px solid black" }}>
                    <p>গ্রাহকের স্বাক্ষর</p>
                </div>
                <div className="text-[10px] text-gray-500 font-medium uppercase mt-2">
                    Printed: {new Date().toLocaleString()}
                </div>
                <div className="text-center pt-2" style={{ width: "150px", borderTop: "1px solid black" }}>
                    <p>কর্তৃপক্ষের স্বাক্ষর</p>
                </div>
            </div>
        </div>
    );
}
