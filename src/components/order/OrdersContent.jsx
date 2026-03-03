"use client";

import OrderSideModal from "@/components/order/OrderSideModal";
import ConfirmationModal from "@/components/order/ConfirmationModal";
import OrderFilters from "@/components/order/OrderFilters";
import OrderTable from "@/components/order/OrderTable";
import PaginationControls from "@/components/order/PaginationControls";
import useAppData from "@/hook/useAppData";
import useOrders from "@/hook/useOrder";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, ShoppingCart } from "lucide-react";


export const OrdersContent = () => {
  const { data } = useAppData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("id");

  // States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [status, setStatus] = useState("");
  const [clotheType, setClotheType] = useState("");
  const [finishingType, setFinishingType] = useState("");
  const [colour, setColour] = useState("");
  const [sillName, setSillName] = useState("");
  const [quality, setQuality] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [exactDate, setExactDate] = useState(""); // YYYY-MM-DD from input, converted to DD/MM/YYYY for API

  // Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const {
    orders,
    totalPages,
    loadingOrder,
    selectedOrder,
    setSelectedOrder,
    fetchSingleOrder,
    deleteOrder,
  } = useOrders({
    currentPage,
    itemsPerPage,
    searchTerm,
    dateRange,
    customStartDate,
    customEndDate,
    exactDate: exactDate
      ? exactDate.split("-").reverse().join("/")  // YYYY-MM-DD → DD/MM/YYYY
      : "",
    status,
    clotheType,
    finishingType,
    colour,
    sillName,
    quality,
  });

  // URL-e ID thakle seta auto load hobe (Refresh korle kaj korbe)
  useEffect(() => {
    if (orderIdFromUrl) {
      fetchSingleOrder(orderIdFromUrl);
    } else {
      setSelectedOrder(null);
    }
  }, [orderIdFromUrl]);

  // Handlers
  const handleOrderClick = (id) => {
    // URL update korbe, jeta automatic useEffect trigger korbe
    router.push(`/dashboard/order?id=${id}`, { scroll: false });
  };

  const closeModal = () => {
    setSelectedOrder(null);
    router.push("/dashboard/order", { scroll: false });
  };

  const confirmDelete = (id) => {
    setOrderToDelete(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    await deleteOrder(orderToDelete);
    setShowConfirmModal(false);
    setOrderToDelete(null);
    if (selectedOrder && selectedOrder._id === orderToDelete) {
      closeModal();
    }
  };

  const handleCustomApply = () => {
    if (!customStartDate || !customEndDate) {
      toast.error("Please select both start and end date");
      return;
    }
  };

  return (
    <div className="py-1 md:py-16 lg:py-6 text-black relative mt-10 md:-mt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-6 lg:mt-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100 shadow-sm">
            <ShoppingCart className="text-[#2563eb]" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1e293b]">Orders</h1>
            <p className="text-sm text-gray-500 font-medium">Manage and track all your orders</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date filter input */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white shadow-sm">
            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">তারিখ:</label>
            <input
              type="date"
              value={exactDate}
              onChange={(e) => { setExactDate(e.target.value); setCurrentPage(1); }}
              className="text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
            />
            {exactDate && (
              <button
                onClick={() => setExactDate("")}
                className="text-gray-400 hover:text-red-500 transition text-xs font-bold ml-1"
                title="Clear date"
              >✕</button>
            )}
          </div>
          <Link
            href={"/dashboard/createOrder"}
            className="inline-flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-sm shadow-blue-200 cursor-pointer"
          >
            <Plus size={18} /> New Order
          </Link>
        </div>
      </div>

      <OrderFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateRange={dateRange}
        handleDateRangeChange={setDateRange}
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
        handleCustomApply={handleCustomApply}
        status={status}
        setStatus={setStatus}
        clotheType={clotheType}
        setClotheType={setClotheType}
        finishingType={finishingType}
        setFinishingType={setFinishingType}
        colour={colour}
        setColour={setColour}
        sillName={sillName}
        setSillName={setSillName}
        quality={quality}
        setQuality={setQuality}
        showMoreFilters={showMoreFilters}
        setShowMoreFilters={setShowMoreFilters}
        data={data}
      />

      <OrderTable
        orders={orders}
        handleOrderClick={handleOrderClick}
        confirmDelete={confirmDelete}
      />

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
      />

      <OrderSideModal
        isModalOpen={!!selectedOrder}
        loadingOrder={loadingOrder}
        selectedOrder={selectedOrder}
        closeModal={closeModal}
        confirmDelete={confirmDelete}
      />

      <ConfirmationModal
        showConfirmModal={showConfirmModal}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};