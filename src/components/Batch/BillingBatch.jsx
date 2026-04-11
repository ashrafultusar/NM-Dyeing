"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FaPrint, FaEye } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { MdDelete } from "react-icons/md";
import PrintBillingInvoice from "../Print/PrintBillingInvoice/PrintBillingInvoice";

export default function BillingBatch({ orderId }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState({});
  const printRef = useRef();
  const [selectedInvoiceToPrint, setSelectedInvoiceToPrint] = useState(null);
  const [savedRows, setSavedRows] = useState({});

  // Price and total per invoice/type
  const [priceByInvoice, setPriceByInvoice] = useState({});
  // shape: { [invoiceNumber]: { client: "", dyeing: "", calender: "" } }

  // Fetch invoices and order info
  const fetchBillingData = async () => {
    try {
      setLoading(true);

      const [invoiceRes, orderRes] = await Promise.all([
        fetch(`/api/batch/invoice/billing/${orderId}`),
        fetch(`/api/order/${orderId}`),
      ]);

      const invoiceData = await invoiceRes.json();
      const orderData = await orderRes.json();

      if (invoiceRes.ok) {
        const mapped = invoiceData.invoices.map((inv) => ({
          ...inv,
          isExpanded: false,
        }));
        setInvoices(mapped);

        // Initialize priceByInvoice
        setPriceByInvoice((prev) => {
          const next = { ...prev };
          mapped.forEach((inv) => {
            const key = inv.invoiceNumber;
            if (!next[key]) {
              next[key] = {
                client: { price: "", total: "" },
                dyeing: { price: "", total: "" },
                calender: { price: "", total: "" },
              };
            }
          });
          return next;
        });
      }

      if (orderRes.ok) setOrderInfo(orderData);
    } catch (err) {
      console.error(err);
      toast.error("Server error while fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchBillingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Helpers
  const toNumber = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const sumIdx = (idx) =>
    Array.isArray(idx)
      ? idx.reduce((s, x) => s + toNumber(x), 0)
      : toNumber(idx);
  const sumExtras = (extraInputs) =>
    Array.isArray(extraInputs)
      ? extraInputs.reduce((s, x) => s + toNumber(x), 0)
      : 0;

  const getInvoiceTotals = (inv) => {
    let idxTotal = 0;
    let extrasTotal = 0;
    (inv?.batches || []).forEach((b) => {
      (b?.rows || []).forEach((r) => {
        idxTotal += sumIdx(r?.idx);
        extrasTotal += sumExtras(r?.extraInputs);
      });
    });
    const totalQty = idxTotal + extrasTotal;
    return { idxTotal, extrasTotal, totalQty };
  };

  const invoiceHasCalender = (inv) =>
    inv?.batches?.some((b) => b?.calender && b.calender.trim() !== "");

  // Expand / Collapse

  const toggleExpand = (invoiceNumber) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.invoiceNumber === invoiceNumber
          ? { ...inv, isExpanded: !inv.isExpanded }
          : inv
      )
    );
  };

  // Delete invoice
  const handleDeleteInvoice = async (invoiceNumber) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      const res = await fetch(`/api/batch/invoice/delete/${invoiceNumber}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Invoice deleted!");
        setInvoices((prev) =>
          prev.filter((inv) => inv.invoiceNumber !== invoiceNumber)
        );
        setPriceByInvoice((prev) => {
          const next = { ...prev };
          delete next[invoiceNumber];
          return next;
        });
      } else toast.error(data.error || "Failed to delete invoice");
    } catch (err) {
      console.error(err);
      toast.error("Server error while deleting invoice");
    }
  };

  // Print invoice
  const handlePrint = (invoice) => {
    if (!invoice) return;
    setSelectedInvoiceToPrint({ ...invoice, orderInfo });
  };

  useEffect(() => {
    if (!selectedInvoiceToPrint) return;
    const printArea = printRef.current.cloneNode(true);
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.top = "0";
    tempDiv.style.left = "0";
    tempDiv.style.width = "100%";
    tempDiv.style.background = "white";
    tempDiv.style.zIndex = "9999";
    tempDiv.appendChild(printArea);
    document.body.appendChild(tempDiv);
    window.print();
    setTimeout(() => {
      document.body.removeChild(tempDiv);
      setSelectedInvoiceToPrint(null);
    }, 500);
  }, [selectedInvoiceToPrint]);

  useEffect(() => {
    if (!invoices?.length) return;

    invoices.forEach(async (inv) => {
      const res = await fetch(
        `/api/batch/billing/summary/${inv.invoiceNumber}`
      );
      const data = await res.json();

      setSavedRows((prev) => ({
        ...prev,
        [inv.invoiceNumber]: data,
      }));
    });
  }, [invoices]);

  // Billing logic (bidirectional)
  const handleBillingChange = (invoiceNumber, type, field, value, totalQty) => {
    setPriceByInvoice((prev) => {
      const current = prev[invoiceNumber]?.[type] || { price: "", total: "" };
      let price = current.price;
      let total = current.total;

      if (field === "price") {
        price = value;
        total = totalQty > 0 ? (toNumber(value) * totalQty).toFixed(2) : "";
      } else if (field === "total") {
        total = value;
        price = totalQty > 0 ? (toNumber(value) / totalQty).toFixed(2) : "";
      }

      return {
        ...prev,
        [invoiceNumber]: {
          ...prev[invoiceNumber],
          [type]: { price, total },
        },
      };
    });
  };

  const handleSaveSummary = async (inv, r, billing) => {
    try {
      const batch = inv.batches[0];
      const { totalQty } = getInvoiceTotals(inv);

      const payload = {
        orderId: orderId,
        displayOrderId: orderInfo?.orderId || "",
        companyName: orderInfo?.companyName || "Unknown Company",
        invoiceNumber: inv.invoiceNumber,
        summaryType: r.key,
        price: Number(billing.price),
        total: Number(billing.total),
        totalQty: Number(totalQty),
        batchName: batch.batchName,

        clotheType: batch.clotheType || orderInfo?.clotheType || "",
        colour: batch.colour,
        quality: batch.quality || orderInfo?.quality || "",
        sillName: batch.sillName,
        finishingType: batch.finishingType,
        customerId: batch.customerId,
        dyeing: batch.dyeing,
        dyeingId: batch.dyeingId,

        calender: batch.calender,
        calenderId: batch.calenderId,
      };

      const res = await fetch("/api/batch/billing/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast.success(`${r.label} billing saved`);

      // 🔒 Disable / hide input after save
      setSavedRows((prev) => ({
        ...prev,
        [inv.invoiceNumber]: {
          ...prev[inv.invoiceNumber],
          [r.key]: true,
        },
      }));
    } catch {
      toast.error("Failed to save billing");
    }
  };

  if (loading) return <p>Loading billing invoices...</p>;
  if (!invoices.length)
    return <p className="text-gray-500">No invoice billing data found.</p>;

  return (
    <div className="mt-6 space-y-6">
      {invoices?.map((inv) => {
        const { idxTotal, extrasTotal, totalQty } = getInvoiceTotals(inv);
        const hasCalender = invoiceHasCalender(inv);
        const summaryRows = [
          { label: "Client", key: "client" },
          { label: "Dyeing", key: "dyeing" },
          ...(hasCalender ? [{ label: "Calender", key: "calender" }] : []),
        ];

        // For merged rows UI
        const isMultiple = inv.batchCount > 1;
        const mergedRows = isMultiple
          ? inv.batches.flatMap((b) =>
              (b.rows || []).map((r) => ({
                ...r,
                batchName: b.batchName,
                sillName: b.sillName,
                colour: b.colour,
                finishingType: b.finishingType,
              }))
            )
          : [];

        return (
          <div
            key={inv.invoiceNumber}
            className="border rounded-lg shadow-sm border-gray-200 overflow-hidden"
          >
            <div className="flex justify-between items-center bg-gray-100 px-4 py-3 no-print">
              <h4 className="font-medium text-gray-700">
                Invoice:{" "}
                <span className="text-blue-600 font-semibold">
                  {inv.invoiceNumber}
                </span>{" "}
                <span className="text-sm text-orange-500">
                  ({isMultiple ? "Merged" : "Single"})
                </span>
              </h4>
              <div className="flex items-center gap-3 text-gray-600">
                <FaEye
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => toggleExpand(inv.invoiceNumber)}
                  title="View Details"
                />
                <FaPrint
                  className="cursor-pointer hover:text-green-600"
                  onClick={() => handlePrint(inv)}
                  title="Print Invoice"
                />
                <MdDelete
                  className="cursor-pointer text-red-500 hover:text-red-600"
                  onClick={() => handleDeleteInvoice(inv.invoiceNumber)}
                  title="Delete Invoice"
                />
              </div>
            </div>

            <AnimatePresence>
              {inv.isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white border-t border-gray-200 overflow-hidden"
                >
                  <div className="p-4 overflow-x-auto">
                    {/* Batches table */}
                    {isMultiple ? (
                      <table className="w-full text-sm border border-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 border">Batch</th>
                            <th className="px-3 py-2 border">Roll No</th>
                            <th className="px-3 py-2 border">Goj</th>
                            <th className="px-3 py-2 border">Index</th>
                            <th className="px-3 py-2 border">Extras</th>
                            <th className="px-3 py-2 border">Sill</th>
                            <th className="px-3 py-2 border">Colour</th>
                            <th className="px-3 py-2 border">Finishing</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mergedRows?.map((row, idx) => (
                            <tr key={idx} className="text-center">
                              <td className="px-3 py-2 border">
                                {row.batchName}
                              </td>
                              <td className="px-3 py-2 border">{row.rollNo}</td>
                              <td className="px-3 py-2 border">{row.goj}</td>
                              <td className="px-3 py-2 border">
                                {Array.isArray(row.idx)
                                  ? row.idx.join(", ")
                                  : row.idx || "-"}
                              </td>
                              <td className="px-3 py-2 border">
                                {row.extraInputs?.length
                                  ? row.extraInputs.join(", ")
                                  : "—"}
                              </td>
                              <td className="px-3 py-2 border">
                                {row.sillName}
                              </td>
                              <td className="px-3 py-2 border">{row.colour}</td>
                              <td className="px-3 py-2 border">
                                {row.finishingType}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      inv.batches.map((b, bIdx) => (
                        <div key={bIdx} className="mb-4">
                          <h5 className="text-gray-700 font-medium mb-2">
                            {b.batchName}
                          </h5>
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
                              {b.rows.map((r, rIdx) => (
                                <tr key={rIdx} className="text-center">
                                  <td className="px-3 py-2 border">
                                    {r.rollNo}
                                  </td>
                                  <td className="px-3 py-2 border">{r.goj}</td>
                                  <td className="px-3 py-2 border">
                                    {Array.isArray(r.idx)
                                      ? r.idx.join(", ")
                                      : r.idx || "-"}
                                  </td>
                                  <td className="px-3 py-2 border">
                                    {r.extraInputs?.length
                                      ? r.extraInputs.join(", ")
                                      : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))
                    )}

                    {/* Billing Summary */}
                    <div className="mt-4">
                      <table className="w-full text-sm border border-gray-200">
                        <tbody>
                          <tr className="bg-gray-50">
                            <td
                              className="px-3 py-2 border font-medium text-gray-700"
                              colSpan={6}
                            >
                              Index = {idxTotal} | Extras = {extrasTotal} |
                              Total Qty = {totalQty}
                            </td>
                          </tr>

                          {summaryRows?.map((r) => {
                            const billing = priceByInvoice?.[
                              inv.invoiceNumber
                            ]?.[r.key] || { price: "", total: "" };

                            const isSaved =
                              savedRows?.[inv.invoiceNumber]?.[r.key] === true;

                            return (
                              <tr key={r.key} className="text-center">
                                <td className="px-3 py-2 border text-left font-medium">
                                  {r.label}
                                </td>
                                <td className="px-3 py-2 border text-red-500 font-bold text-lg">
                                  ×
                                </td>

                                <td className="px-3 py-2 border">
                                  {!isSaved && (
                                    <input
                                      type="number"
                                      value={billing.price}
                                      onChange={(e) =>
                                        handleBillingChange(
                                          inv.invoiceNumber,
                                          r.key,
                                          "price",
                                          e.target.value,
                                          totalQty
                                        )
                                      }
                                      placeholder="Price"
                                      className="w-full max-w-[90px] mx-auto border rounded px-3 py-2 text-center"
                                    />
                                  )}
                                </td>

                                <td className="px-3 py-2 border font-bold text-lg text-gray-600">
                                  =
                                </td>

                                <td className="px-3 py-2 border font-semibold text-gray-700">
                                  {!isSaved && (
                                    <input
                                      type="number"
                                      value={billing.total}
                                      onChange={(e) =>
                                        handleBillingChange(
                                          inv.invoiceNumber,
                                          r.key,
                                          "total",
                                          e.target.value,
                                          totalQty
                                        )
                                      }
                                      placeholder="Total"
                                      className="w-full max-w-[120px] mx-auto border rounded px-3 py-2 text-center"
                                    />
                                  )}
                                </td>
                                <td>
                                  <button
                                    disabled={isSaved}
                                    onClick={() =>
                                      handleSaveSummary(inv, r, billing)
                                    }
                                    className={`px-2 py-2 rounded m-1 ${
                                      isSaved
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-green-400 hover:bg-green-500"
                                    }`}
                                  >
                                    <TiTick />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Hidden printable area */}
      <div style={{ display: "none" }}>
        <div ref={printRef} className="print-only">
          {selectedInvoiceToPrint && (
            <PrintBillingInvoice order={selectedInvoiceToPrint} />
          )}
        </div>
      </div>
    </div>
  );
}
