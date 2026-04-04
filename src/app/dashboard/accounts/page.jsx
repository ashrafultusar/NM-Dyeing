"use client";

import { useEffect, useState, useRef } from "react";
import { FaEdit, FaUser, FaFillDrip, FaCalendarAlt } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { toast } from "react-toastify";

export default function Page() {
  const [entities, setEntities] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [type, setType] = useState("customer");
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    id: "",
    amount: "",
    method: "cash",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });

  // টাইপ পরিবর্তন হলে ডাটা লোড করা
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        let endpoint = "/api/customers"; 
        if (type === "dyeing") endpoint = "/api/dyeings";
        if (type === "calendar") endpoint = "/api/calender";

        const res = await fetch(endpoint);
        const data = await res.json();
        setEntities(Array.isArray(data) ? data : []);
        setSelectedId(""); 
        setPayments([]);
        setTotal(0);
      } catch (err) {
        toast.error("Failed to load list");
      }
    };
    fetchEntities();
  }, [type]);

  // পেমেন্ট হিস্ট্রি লোড
  const fetchPayments = async () => {
    if (!selectedId) return;
    try {
      
      const res = await fetch(
        `/api/payments?userId=${selectedId}&type=${type}`
      );
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        setPayments([]);
        return;
      }

      if (Array.isArray(data)) {
        setPayments(data);
        setTotal(data.reduce((t, p) => t + Number(p.amount), 0));
      }
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) return toast.warning("Please select an entry!");

    const payload = {
      id: form.id,
      userId: selectedId,
      type: type,
      amount: Number(form.amount),
      method: form.method,
      description: form.description,
      date: form.date,
    };

    try {
      const res = await fetch("/api/payments", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchPayments();
        setForm({
          id: "",
          amount: "",
          method: "cash",
          description: "",
          date: new Date().toISOString().slice(0, 10),
        });
        toast.success("Success!");
      }
    } catch (err) {
      toast.error("Error saving data");
    }
  };

  const handleEdit = (p) => {
    setForm({
      id: p._id,
      amount: p.amount,
      method: p.method,
      description: p.description || "",
      date: new Date(p.date).toISOString().slice(0, 10),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/payments?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.info("Deleted!");
      fetchPayments();
    }
  };

  const filteredEntities = entities.filter((ent) =>
    (ent.companyName || ent.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const currentSelection = entities.find((ent) => ent._id === selectedId);

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 border-b pb-3">
        Accounts Section
      </h1>

      {/* ✅ Toggle Tabs */}
      <div className="flex  bg-gray-100 p-1 rounded-xl shadow-inner">
        {[
          { id: "customer", label: "Customer", icon: <FaUser /> },
          { id: "dyeing", label: "Dyeing", icon: <FaFillDrip /> },
          { id: "calendar", label: "Calendar", icon: <FaCalendarAlt /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setType(tab.id)}
            className={`flex-1 flex items-center justify-center cursor-pointer gap-2 py-2.5 rounded-lg font-bold transition-all ${
              type === tab.id
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ✅ Searchable Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full border-2 border-gray-200 p-3 rounded-lg bg-white cursor-pointer flex justify-between items-center hover:border-blue-300 transition"
        >
          <span
            className={
              currentSelection ? "font-semibold text-gray-800" : "text-gray-400"
            }
          >
            {currentSelection
              ? `${currentSelection.companyName || currentSelection.name} ${
                  currentSelection.ownerName
                    ? `(${currentSelection.ownerName})`
                    : ""
                }`
              : `Select ${type}...`}
          </span>
          <span>{isDropdownOpen ? "▲" : "▼"}</span>
        </div>

        {isDropdownOpen && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden">
            <input
              type="text"
              className="w-full p-3 border-b outline-none focus:bg-blue-50"
              placeholder={`Search ${type}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            <div className="max-h-64 overflow-y-auto">
              {filteredEntities.map((ent) => (
                <div
                  key={ent._id}
                  onClick={() => {
                    setSelectedId(ent._id);
                    setIsDropdownOpen(false);
                    setSearchTerm("");
                  }}
                  className="p-3 hover:bg-blue-600 hover:text-white cursor-pointer border-b last:border-0 transition"
                >
                  <div className="font-bold">{ent.companyName || ent.name}</div>
                  <div className="text-xs opacity-80">
                    {ent.ownerName || "No Owner Info"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedId && (
        <>
          {/* ✅ Total Card */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90 uppercase tracking-widest font-semibold">
                Total Received
              </p>
              <h2 className="text-3xl font-black">
                ৳ {total.toLocaleString()}
              </h2>
            </div>
            {form.id && (
              <div className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-xs font-bold animate-pulse">
                EDITING MODE
              </div>
            )}
          </div>

          {/* ✅ Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border-2 border-gray-50 p-2.5 rounded-lg focus:border-blue-400 outline-none bg-gray-50 font-semibold"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Method
              </label>
              <select
                name="method"
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full border-2 border-gray-50 p-2.5 rounded-lg focus:border-blue-400 outline-none bg-gray-50 font-semibold"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="bkash">Bkash</option>
                <option value="nagad">Nagad</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border-2 border-gray-50 p-2.5 rounded-lg focus:border-blue-400 outline-none bg-gray-50 font-semibold"
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full border-2 border-gray-50 p-2.5 rounded-lg focus:border-blue-400 outline-none bg-gray-50"
                placeholder="Note here..."
                rows="2"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className={`flex-1 cursor-pointer py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                  form.id
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {form.id ? "Update Entry" : "Save Payment"}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      id: "",
                      amount: "",
                      method: "cash",
                      description: "",
                      date: new Date().toISOString().slice(0, 10),
                    })
                  }
                  className="bg-gray-200 text-gray-600 px-6 rounded-xl font-bold hover:bg-gray-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* ✅ Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 font-bold text-gray-600 border-b">Date</th>
                  <th className="p-4 font-bold text-gray-600 border-b">
                    Method
                  </th>
                  <th className="p-4 font-bold text-gray-600 border-b">
                    Description
                  </th>
                  <th className="p-4 font-bold text-gray-600 border-b text-right">
                    Amount
                  </th>
                  <th className="p-4 font-bold text-gray-600 border-b text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-blue-50/30 transition">
                    <td className="p-4 text-gray-700">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">
                        {p.method}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 max-w-[150px] truncate">
                      {p.description || "-"}
                    </td>
                    <td className="p-4 text-right font-bold text-gray-800">
                      ৳ {p.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-center space-x-3">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-blue-500 hover:scale-110 transition inline-block"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-red-500 hover:scale-110 transition inline-block"
                      >
                        <MdDeleteForever size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
