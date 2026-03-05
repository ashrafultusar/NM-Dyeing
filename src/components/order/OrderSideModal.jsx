"use client";
import React, { useRef, useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FaPencilAlt, FaPrint } from "react-icons/fa";
import { LuTrash2 } from "react-icons/lu";
import { CiGrid41 } from "react-icons/ci";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import OrderStatus from "../OrderStatus/OrderStatus";
import OrderInvoicePrint from "../Print/OrderInvoicePrint/OrderInvoicePrint";

const OrderSideModal = ({
  isModalOpen,
  loadingOrder,
  selectedOrder,
  closeModal,
  confirmDelete,
}) => {
  const router = useRouter();
  const [isDetailsOpen, setIsDetailsOpen] = useState(true); // Default open rakhle dekhte bhalo lage
  const [isClient, setIsClient] = useState(false);
  const printRef = useRef();

  // Client side check to avoid Hydration Error
  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatDate = (dateString) => {
    if (!isClient || !dateString) return "Loading...";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Invalid Date";
    }
  };

  const handlePrint = () => {
    const printArea = printRef.current.cloneNode(true);
    const tempDiv = document.createElement("div");
    tempDiv.className = "print-only";
    tempDiv.appendChild(printArea);
    document.body.appendChild(tempDiv);
    window.print();
    setTimeout(() => {
      document.body.removeChild(tempDiv);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="no-print fixed inset-0 flex justify-end z-50">
          <motion.div
            className="absolute inset-0 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          />

          <motion.div
            className="relative w-full sm:w-[350px] md:w-[450px] h-full bg-white shadow-lg border-l border-gray-200 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-xl font-bold">
                {selectedOrder?.orderId || "N/A"}
              </h2>
              <IoClose
                className="w-6 h-6 text-gray-500 hover:text-black cursor-pointer"
                onClick={closeModal}
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingOrder ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <div
                    className="p-4 bg-gray-100 rounded-lg flex items-center justify-between cursor-pointer"
                    onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <CiGrid41 className="text-2xl" />
                      </div>
                      <p className="text-base uppercase font-medium">
                        {selectedOrder?.clotheType || "N/A"}
                      </p>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isDetailsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-6 pt-2">
                          <div className="grid grid-cols-2 gap-4 text-gray-700">
                            <div>
                              <p className="text-xs text-gray-500">
                                Created at
                              </p>
                              <p className="font-semibold">
                                {formatDate(selectedOrder?.createdAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Due Date</p>
                              <p className="font-semibold">
                                {formatDate(selectedOrder?.dueDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Bundle</p>
                              <p className="font-semibold">
                                {selectedOrder?.bundle || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Quantity</p>
                              <p className="font-semibold">
                                {selectedOrder?.quality || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="border-t pt-4 flex gap-2">
                            <button
                              onClick={handlePrint}
                              className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition cursor-pointer text-sm"
                            >
                              <FaPrint size={16} /> Print
                            </button>
                            <div style={{ display: "none" }}>
                              <div ref={printRef}>
                                <OrderInvoicePrint order={selectedOrder} />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t flex justify-between gap-4">
                            <button
                              onClick={() =>
                                router.push(
                                  `/dashboard/order/update/${selectedOrder?._id}`
                                )
                              }
                              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                              <FaPencilAlt className="inline-block mr-2" /> Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(selectedOrder?._id)}
                              className="flex-1 py-3 px-4 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition"
                            >
                              <LuTrash2 className="inline-block mr-2" /> Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <OrderStatus
                    selectedOrder={selectedOrder}
                    orderId={selectedOrder?._id}
                    currentStatus={selectedOrder?.status || "Pending"}
                    tableData={selectedOrder?.tableData || []}
                    onStatusChange={(newStatus) => {
                      if (selectedOrder) selectedOrder.status = newStatus;
                    }}
                  />
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderSideModal;
