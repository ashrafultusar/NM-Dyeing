"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FaEye, FaFileInvoiceDollar } from "react-icons/fa";
import { Edit } from "lucide-react";
import { useRouter } from 'next/navigation'

export default function DeliveredBatchList({ orderId }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);

  const router = useRouter()
  // ✅ fetch batches
  const fetchDeliveredBatches = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/batch/${orderId}`);
      const data = await res.json();

      if (res.ok) {
        // add isExpanded key for each batch to control details open state individually
        const deliveredBatches = (data.batches || [])
          .filter((batch) => batch.status === "delivered")
          .map((b) => ({ ...b, isExpanded: false }));
        setBatches(deliveredBatches);
      } else toast.error(data.error || "Failed to load delivered batches");
    } catch (err) {
      console.error(err);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchDeliveredBatches();
  }, [orderId]);

  // ✅ checkbox toggle
  const handleSelect = (batchId) => {
    setSelectedBatches((prev) =>
      prev.includes(batchId)
        ? prev.filter((id) => id !== batchId)
        : [...prev, batchId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBatches.length === batches.length) {
      setSelectedBatches([]);
    } else {
      setSelectedBatches(batches.map((b) => b._id));
    }
  };



  const handleSingleBilling = async (batchId) => {
    try {
      const res = await fetch("/api/batch/invoice/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, batchIds: [batchId] }),
      });
      const data = await res.json();
  
      if (res.ok) {
        toast.success(`Invoice ${data.invoiceNumber} created for batch`);
  
        // ✅ Remove that batch from the delivered list immediately
        setBatches((prev) => prev.filter((b) => b._id !== batchId));
      } else toast.error(data.error || "Billing failed");
    } catch (err) {
      console.error(err);
      toast.error("Server error during billing");
    }
  };



  const handleMultiBilling = async () => {
    if (selectedBatches.length === 0) return;
  
    try {
      const res = await fetch("/api/batch/invoice/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, batchIds: selectedBatches }),
      });
      const data = await res.json();
  
      if (res.ok) {
        toast.success(
          `Invoice ${data.invoiceNumber} created for ${selectedBatches.length} batches`
        );
  
        // ✅ Instantly remove billed batches from UI
        setBatches((prev) =>
          prev.filter((b) => !selectedBatches.includes(b._id))
        );
        setSelectedBatches([]);
      } else toast.error(data.error || "Billing failed");
    } catch (err) {
      console.error(err);
      toast.error("Server error during multi billing");
    }
  };
  

  // ✅ toggle details open/close
  const toggleExpand = (batchId) => {
    setBatches((prev) =>
      prev.map((b) =>
        b._id === batchId ? { ...b, isExpanded: !b.isExpanded } : b
      )
    );
  };
console.log(batches);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Delivered Batches
        </h3>

        {selectedBatches.length > 0 && (
          <button
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition cursor-pointer"
            onClick={handleMultiBilling}
          >
            <FaFileInvoiceDollar /> Billing Selected ({selectedBatches.length})
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading batches...</p>
      ) : batches.length === 0 ? (
        <p className="text-gray-500">
          No delivered batches found for this order.
        </p>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={
                selectedBatches.length === batches.length && batches.length > 0
              }
              onChange={handleSelectAll}
            />
            <span className="text-sm text-gray-600">
              Select All ({batches.length})
            </span>
          </div>

          {batches.map((batch, bIdx) => {
            const isExpanded = batch.isExpanded;
            const isSelected = selectedBatches.includes(batch._id);

            return (
              <div
                key={batch._id}
                className={`border rounded-lg shadow-sm overflow-hidden ${
                  isSelected ? "border-blue-400 bg-blue-50" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center bg-gray-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelect(batch._id)}
                      className="cursor-pointer"
                    />
                    <h4 className="font-medium text-gray-700 flex items-center gap-2">
                      {batch.batchName || `Batch ${bIdx + 1}`}{" "}
                      {batch.status === "billing" && (
                        <span className="text-orange-500 text-sm font-semibold">
                          (Billing)
                        </span>
                      )}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 text-gray-600">
                    <button
                      onClick={() => toggleExpand(batch._id)}
                      className="hover:text-blue-600 transition cursor-pointer"
                      title={isExpanded ? "Hide Details" : "View Details"}
                    >
                      <FaEye size={18} />
                    </button>

                    <button
  className="hover:text-green-600 transition cursor-pointer"
  title="Edit Batch"
  onClick={() =>
    router.push(`/dashboard/allbatch/${batch._id}`)
  }
>
  <Edit size={18} />
</button>



                    <button
                      className="hover:text-orange-500 transition cursor-pointer"
                      title="Billing Info"
                      onClick={() => handleSingleBilling(batch._id)}
                    >
                      <FaFileInvoiceDollar size={18} />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="border-t border-gray-200 bg-white overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-3 py-2 border">Roll No</th>
                                <th className="px-3 py-2 border">Goj</th>
                                <th className="px-3 py-2 border">Index</th>
                                <th className="px-3 py-2 border">Extras</th>
                              </tr>
                            </thead>
                            <tbody>
                              {batch.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="text-center">
                                  <td className="px-3 py-2 border">
                                    {row.rollNo}
                                  </td>
                                  <td className="px-3 py-2 border">
                                    {row.goj}
                                  </td>
                                  <td className="px-3 py-2 border">
                                    {row.idx || "-"}
                                  </td>
                                  <td className="px-3 py-2 border">
                                    {row.extraInputs?.length
                                      ? row.extraInputs.join(", ")
                                      : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="pt-3 text-gray-700">
                          <span className="font-semibold">Note:</span>{" "}
                          {batch.note?.trim() || "Not Assigned"}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
