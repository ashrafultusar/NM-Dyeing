import React from "react";
import { LuTrash2 } from "react-icons/lu";

const getStatusColor = (status) => {

  const s = status?.toLowerCase();

  switch (s) {
    case "delivered":
    case "completed":
      return "bg-green-200 text-green-900 border-green-300";
    case "canceled":
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";
    case "pending":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "inprocess":
    case "in process":
    case "processing":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "batch":
      return "bg-cyan-100 text-cyan-700 border-cyan-200";
    case "calender":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "billing":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const getPaymentColor = (payment) => {
  return payment === "Paid"
    ? "bg-green-100 text-green-700"
    : "bg-red-100 text-red-700";
};

const OrderTable = ({ orders, loadingOrders, handleOrderClick, confirmDelete }) => {
  if (loadingOrders) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500 font-medium">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow bg-white">
      <table className="min-w-full text-sm table-auto">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-4 text-left whitespace-nowrap">Order Id</th>
            <th className="p-4 text-left whitespace-nowrap">Customer</th>
            <th className="p-4 text-left whitespace-nowrap">Product</th>

            <th className="p-4 text-left whitespace-nowrap">Status</th>
            <th className="p-4 text-left whitespace-nowrap">Total Goj</th>
            <th className="p-4 text-left whitespace-nowrap">Billing</th>
            <th className="p-4 text-left whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders?.map((order) => (
            <tr
              key={order?._id}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => handleOrderClick(order?._id)}
            >
              <td className="p-4 whitespace-nowrap">{order?.orderId}</td>
              <td className="p-4 whitespace-nowrap">
                {order?.companyName || "N/A"}
              </td>
              <td className="p-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {order?.clotheType || "N/A"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {order?.quality || "N/A"}
                  </span>
                </div>
              </td>

              <td className="p-4 whitespace-nowrap capitalize">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(
                    order?.status
                  )}`}
                >
                  {order?.status || "N/A"}
                </span>
              </td>
              <td className="p-4 whitespace-nowrap">
                {order?.totalGoj !== null && order?.totalGoj !== undefined
                  ? order?.totalGoj
                  : order?.tableData && order?.tableData.length > 0
                    ? order.tableData.reduce(
                      (sum, item) => sum + (item.goj || 0),
                      0
                    )
                    : "N/A"}
              </td>

              <td className="p-4 whitespace-nowrap">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${getPaymentColor(
                    order?.paymentMethod
                  )}`}
                >
                  {order?.paymentMethod || "Unpaid"}
                </span>
              </td>
              <td className="p-4 whitespace-nowrap">
                <div className=" items-center gap-3">
                  <LuTrash2
                    className="w-4 h-4 text-gray-500 hover:text-red-600 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(order?._id);
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
