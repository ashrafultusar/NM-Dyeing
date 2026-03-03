import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const useOrders = (filters) => {
  const {
    currentPage,
    itemsPerPage,
    searchTerm,
    dateRange,
    customStartDate,
    customEndDate,
    exactDate,
    status,
    clotheType,
    finishingType,
    colour,
    sillName,
    quality,
  } = filters;

  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);


  const fetchOrders = async () => {
    let startDate = "";
    let endDate = "";
    const today = dayjs();

    switch (dateRange) {
      case "last_week":
        startDate = today.subtract(1, "week").startOf("week").toISOString();
        endDate = today.subtract(1, "week").endOf("week").toISOString();
        break;
      case "last_month":
        startDate = today.subtract(1, "month").startOf("month").toISOString();
        endDate = today.subtract(1, "month").endOf("month").toISOString();
        break;
      case "this_week":
        startDate = today.startOf("week").toISOString();
        endDate = today.endOf("week").toISOString();
        break;
      case "this_month":
        startDate = today.startOf("month").toISOString();
        endDate = today.endOf("month").toISOString();
        break;
      case "last_3_days":
        startDate = today.subtract(3, "day").startOf("day").toISOString();
        endDate = today.endOf("day").toISOString();
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = customStartDate.toISOString();
          endDate = customEndDate.toISOString();
        }
        break;
      default:
        break;
    }

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        startDate,
        endDate,
      });

      if (exactDate) params.append("date", exactDate);
      if (status) params.append("status", status);
      if (clotheType) params.append("clotheTypes", clotheType);
      if (finishingType) params.append("finishingType", finishingType);
      if (colour) params.append("colour", colour);
      if (sillName) params.append("sillName", sillName);
      if (quality) params.append("quality", quality);

      const res = await fetch(`/api/order?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch orders");

      const { orders: fetchedOrders, totalCount } = await res.json();
      setOrders(fetchedOrders);
      setTotalPages(Math.ceil(totalCount / itemsPerPage));
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Error fetching orders. Please try again.");
    }
  };


  const fetchSingleOrder = async (id) => {
    setLoadingOrder(true);
    try {
      const res = await fetch(`/api/order/${id}`);
      if (!res.ok) throw new Error("Failed to fetch order");
      const data = await res.json();
      setSelectedOrder(data);
      return data;
    } catch (err) {
      console.error("Error fetching single order:", err);
      toast.error("Error fetching order details.");
    } finally {
      setLoadingOrder(false);
    }
  };


  const deleteOrder = async (id) => {
    try {
      const res = await fetch(`/api/order/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete order");
      await fetchOrders();
      toast.success("Order deleted successfully.");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting order. Please try again.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    dateRange,
    customStartDate,
    customEndDate,
    exactDate,
    status,
    clotheType,
    finishingType,
    colour,
    sillName,
    quality,
  ]);

  return {
    orders,
    totalPages,
    loadingOrder,
    selectedOrder,
    setSelectedOrder,
    fetchSingleOrder,
    deleteOrder,
  };
};

export default useOrders;
