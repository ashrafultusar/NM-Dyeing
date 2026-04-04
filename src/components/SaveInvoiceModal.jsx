import React, { useState } from "react";
import { FaTimes, FaSave } from "react-icons/fa";

export default function SaveInvoiceModal({ onClose, onConfirm, loading }) {
  const [title, setTitle] = useState("New Invoice");
  const [saveMode, setSaveMode] = useState("ledger");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden shadow-indigo-900/20">
        <div className="flex justify-between items-center p-5 bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100">
          <h2 className="text-lg font-black text-indigo-900 uppercase tracking-wide">
            Save Invoice Options
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 cursor-pointer"
          >
            <FaTimes size={16} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Invoice Title
            </label>
            <input
              type="text"
              className="w-full border-2 border-indigo-100 p-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-gray-800"
              placeholder="Enter invoice title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              Save Mode
            </label>
            <div className="space-y-3">
              <label
                className={`block border-2 p-4 rounded-xl cursor-pointer transition-all ${
                  saveMode === "ledger"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600 h-4 w-4"
                    checked={saveMode === "ledger"}
                    onChange={() => setSaveMode("ledger")}
                    disabled={loading}
                  />
                  <span className="ml-3 font-bold text-gray-800">
                    Ledger Bill (Include Current Due)
                  </span>
                </div>
                <p className="ml-7 mt-1 text-[11px] text-gray-500 leading-tight">
                  Appends the final due amount calculated from the entire ledger
                  to the invoice.
                </p>
              </label>

              <label
                className={`block border-2 p-4 rounded-xl cursor-pointer transition-all ${
                  saveMode === "individual"
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-indigo-600 h-4 w-4"
                    checked={saveMode === "individual"}
                    onChange={() => setSaveMode("individual")}
                    disabled={loading}
                  />
                  <span className="ml-3 font-bold text-gray-800">
                    Individual Details Only
                  </span>
                </div>
                <p className="ml-7 mt-1 text-[11px] text-gray-500 leading-tight">
                  Saves only the selected items exactly as they appear.
                </p>
              </label>
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end items-center">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(title || "New Invoice", saveMode)}
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Saving..."
            ) : (
              <>
                <FaSave /> Save Invoice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
