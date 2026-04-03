"use client";
import React, { useState } from "react";
import { FaLock, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";

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
                    <input autoFocus type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="যেমন: January 2026 Closing"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-[11px] text-amber-700 font-medium">⚠️ Close করার পর সব data save হবে এবং current ledger empty হবে।</p>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 cursor-pointer text-gray-600 text-sm font-bold hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={loading || !title.trim()} className="flex-1 cursor-pointer px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-black hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" /> : <><FaLock size={12} /> Confirm Close</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default React.memo(CloseModal);
