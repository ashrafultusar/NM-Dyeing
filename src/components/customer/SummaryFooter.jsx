"use client";
import React from "react";

function SummaryFooter({
    totalCharge,
    totalPayment,
    finalBalance,
    openingBalance,
}) {
    return (
        <div className="bg-gray-900 p-5 sm:p-8 text-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                <div className="space-y-1 text-center sm:text-left border-b sm:border-b-0 sm:border-r border-gray-800 pb-4 sm:pb-0">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        Total Billings
                    </p>
                    <p className="text-lg font-bold">৳{totalCharge.toLocaleString()}</p>
                </div>
                <div className="space-y-1 text-center sm:text-left border-b sm:border-b-0 sm:border-r border-gray-800 pb-4 sm:pb-0">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                        Total Received
                    </p>
                    <p className="text-lg font-bold text-green-400">
                        ৳{totalPayment.toLocaleString()}
                    </p>
                </div>
                <div className="text-center sm:text-right">
                    <p className="text-[10px] text-blue-300 font-black uppercase tracking-widest mb-1">
                        Final Balance
                    </p>
                    <p
                        className={`text-2xl font-black ${finalBalance < 0 ? "text-red-500" : "text-teal-400"
                            }`}
                    >
                        {finalBalance < 0
                            ? `- ৳${Math.abs(finalBalance).toLocaleString()}`
                            : `+ ৳${finalBalance.toLocaleString()}`}
                        <span className="text-xs ml-2 font-bold opacity-80 uppercase">
                            {finalBalance < 0 ? "Due" : "Advance"}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default React.memo(SummaryFooter);
