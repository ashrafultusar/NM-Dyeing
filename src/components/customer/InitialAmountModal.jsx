"use client";
import React, { useState } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

function InitialAmountModal({ initCharge, initPayment, initDate, onClose, onConfirm, loading }) {
    const [chargeAmount, setChargeAmount] = useState(initCharge > 0 ? String(initCharge) : "");
    const [paymentAmount, setPaymentAmount] = useState(initPayment > 0 ? String(initPayment) : "");
    const [dateVal, setDateVal] = useState(initDate ? new Date(initDate).toISOString().split("T")[0] : "");

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
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                    <FaTimes size={16} />
                </button>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <FaEdit className="text-indigo-500" size={16} />
                    </div>
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
                                placeholder="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent" />
                            <p className="text-[10px] font-medium mt-1 text-gray-500">Client আমার কাছে পাওনা</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-1.5 text-green-600">Payment (-)</label>
                            <input type="number" min="0" step="any" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent" />
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

export default React.memo(InitialAmountModal);
