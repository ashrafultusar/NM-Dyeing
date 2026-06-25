"use client";
import { Edit, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function CalendarBatch({ orderId }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null); // COLLAPSE STATE
  const router = useRouter();

  useEffect(() => {
    const fetchDeliveredBatches = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/batch/${orderId}`);
        const data = await res.json();

        if (res.ok) {
          const deliveredBatches = (data.batches || []).filter(
            (batch) => batch.status === "calender"
          );
          setBatches(deliveredBatches);
        } else {
          toast.error(data.error || "Failed to load delivered batches");
        }
      } catch (err) {
        console.error(err);
       
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchDeliveredBatches();
  }, [orderId]);

  const handleDelivered = async (batchToUpdate) => {
    const newStatus = "delivered"; 
    if (!orderId || !batchToUpdate?._id) {
      toast.error("Batch not found");
      return;
    }

    const updatedBatch = {
      ...batchToUpdate,
      status: newStatus,
      note: batchToUpdate.note || "",
      rows: batchToUpdate.rows.map((row) => ({
        ...row,
        idx: row.idx || 0, 
        extraInputs: row.extraInputs || [],
      })),
    };

    try {
      const res = await fetch(`/api/batch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          batchId: batchToUpdate._id,
          batchData: updatedBatch,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          `Batch "${updatedBatch.batchName}" Status Update "${newStatus}" SuccessFully`
        );
        setBatches((prev) => prev.filter((b) => b._id !== batchToUpdate._id));
      } else {
        toast.error(data.message || " Status Update Faild");
      }
    } catch (error) {
      console.error(error);
      toast.error("Status Update");
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Delivered Batches (Calendar)
      </h3>

      {loading ? (
        <p className="text-gray-500">Loading delivered batches...</p>
      ) : batches.length === 0 ? (
        <p className="text-gray-500">
          No delivered batches found for this order.
        </p>
      ) : (
        <div className="space-y-6">
          {batches.map((batch, bIdx) => (
            <div
              key={bIdx}
              className="border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-700 ">
                  {batch.batchName || `Batch ${bIdx + 1}`} ✅
                </h4>
                <div className="flex gap-2">
                  <button
                     onClick={() =>
                      router.push(`/dashboard/allbatch/${batch._id}`)
                    }
                    className="text-blue-500 hover:text-blue-700 cursor-pointer"
                    title="Edit Batch"
                  >
                    <Edit size={20} />
                  </button>

                  <button
                    onClick={() => handleDelivered(batch)}
                    className="bg-green-300 text-gray-700 px-2 py-1 rounded cursor-pointer hover:bg-green-400"
                  >
                    Delivered
                  </button>
                </div>
              </div>

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
                        <td className="px-3 py-2 border">{row.rollNo}</td>
                        <td className="px-3 py-2 border">{row.goj}</td>
                        <td className="px-3 py-2 border">{row.idx || "-"}</td>
                        <td className="px-3 py-2 border">
                          {row.extraInputs?.length
                            ? row.extraInputs.join(", ")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {batch.rows.length > 0 && (
                    <tfoot>
                      <tr className="text-center font-semibold bg-gray-50">
                        <td className="px-3 py-2 border">{batch.rows.length}</td>
                        <td className="px-3 py-2 border">
                          {batch.rows.reduce((sum, row) => sum + (Number(row.goj) || 0), 0)}
                        </td>
                        <td className="px-3 py-2 border">
                          {batch.rows.reduce((sum, row) => sum + (Number(row.idx) || 0), 0)}
                        </td>
                        <td className="px-3 py-2 border">
                          {batch.rows.reduce(
                            (sum, row) =>
                              sum +
                              (row.extraInputs
                                ? row.extraInputs.reduce((s, val) => s + (Number(val) || 0), 0)
                                : 0),
                            0
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>

                {/* COLLAPSIBLE INFO SECTION */}
                <button
                  onClick={() =>
                    setExpandedIndex(expandedIndex === bIdx ? null : bIdx)
                  }
                  className="flex items-center justify-between w-full px-3 py-2 mt-3 bg-gray-100 border rounded text-sm text-gray-700 cursor-pointer"
                >
                  <span>Show Batch Details</span>
                  {expandedIndex === bIdx ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedIndex === bIdx && (
                    <motion.div
                      key="collapse-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="overflow-x-auto my-3">
                        <table className="w-full text-sm border border-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="px-3 py-2 border text-left w-1/3">
                                Field
                              </th>
                              <th className="px-3 py-2 border text-left">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ["Calendar", batch.calender],
                              ["Colour", batch.colour],
                              ["Dyeing", batch.dyeing],
                              ["Finishing Type", batch.finishingType],
                              ["Sill Name", batch.sillName],
                            ]
                              .filter(([_, value]) => value)
                              .map(([label, value], idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                  <td className="border px-3 py-2 font-medium uppercase">{label}</td>
                                  <td className="border px-3 py-2">{value}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* END COLLAPSIBLE INFO SECTION */}
              </div>

              <p className="pt-3">Note: {batch.note?.trim() || "Not Assigned"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
