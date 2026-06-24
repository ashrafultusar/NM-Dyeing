"use client";

import SearchableSelect from "@/components/OrderCreate/SearchableSelect";
import useAppData from "@/hook/useAppData";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const Page = () => {
  const { id } = useParams();
  const { data } = useAppData();
  const router = useRouter();

  const [tableData, setTableData] = useState([{ goj: "" }]);
  const inputRefs = useRef([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    date: "",
    invoiceNumber: "",
    companyName: "",
    customerId: "",
    clotheType: "",
    finishingWidth: "",
    quality: "",
    sillName: "",
    colour: "",
    finishingType: "",
    totalGoj: "",
    totalBundle: "",
    dyeingName: "",
    dyeingId: "",
    transporterName: "",
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/order/${id}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const orderData = await res.json();
        
        let formattedDate = "";
        if (orderData.date) {
           if(orderData.date.includes("T")) {
             const parts = orderData.date.split("T")[0].split("-");
             formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
           } else if(orderData.date.includes("/")) {
             formattedDate = orderData.date; // assuming already DD/MM/YYYY
           } else if(orderData.date.includes("-")) {
             const parts = orderData.date.split("-");
             if(parts[0].length === 4) { // YYYY-MM-DD
                 formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`; 
             } else {
                 formattedDate = orderData.date; // Already DD/MM/YYYY
             }
           }
        }

        setFormData({
          date: formattedDate,
          invoiceNumber: orderData.invoiceNumber || "",
          companyName: orderData.companyName || "",
          customerId: orderData.customerId || "",
          clotheType: orderData.clotheType || "",
          finishingWidth: orderData.finishingWidth || "",
          quality: orderData.quality || "",
          sillName: orderData.sillName || "",
          colour: orderData.colour || "",
          finishingType: orderData.finishingType || "",
          totalGoj: orderData.totalGoj || "",
          totalBundle: orderData.totalBundle || "",
          dyeingName: orderData.dyeingName || "",
          dyeingId: orderData.dyeingId || "",
          transporterName: orderData.transporterName || "",
        });

        if (orderData.tableData && orderData.tableData.length > 0) {
          setTableData(
            orderData.tableData.map((t) => ({
              rollNo: t.rollNo || null,
              goj: t.goj || "",
              _id: t._id || undefined, // keep existing ids if present
            }))
          );
        } else {
          setTableData([{ goj: "" }]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleTableChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...tableData];
    updated[index][name] = value === "" ? "" : Number(value);
    setTableData(updated);
  };

  const addRow = () => {
    setTableData((prev) => [...prev, { goj: "" }]);
    setTimeout(() => {
      const lastIndex = tableData.length;
      inputRefs.current[lastIndex]?.focus();
    }, 50);
  };

  const removeRow = (index) => {
    const updated = [...tableData];
    updated.splice(index, 1);
    setTableData(updated);
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (idx === tableData.length - 1) {
        addRow();
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (idx + 1 < tableData.length) {
        inputRefs.current[idx + 1]?.focus();
      }
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (idx - 1 >= 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    }
  };

  const isFormTotalsFilled = formData.totalGoj || formData.totalBundle;
  const isTableGojFilled = tableData.some(
    (row) => row.goj !== "" && row.goj !== null
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, tableData };

      const res = await fetch(`/api/order/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Order updated successfully!");
        router.push("/dashboard/order");
      } else {
        toast.error("Failed to update order");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Error:", error);
    }
  };

  if (loading) return <p className="p-4 flex justify-center mt-10">Loading...</p>;

  return (
    <section
      className="max-w-5xl mx-auto p-8 mt-16 md:mt-14 lg:mt-4
     bg-white border border-gray-200 rounded-2xl shadow-md"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        ✏ Edit Order Form
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800">
          {/* Date */}
          <div className="flex flex-col">
            <label htmlFor="date" className="mb-1 font-medium text-sm">
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              value={
                formData.date
                  ? formData.date.split("/").reverse().join("-") // DD/MM/YYYY → YYYY-MM-DD
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value; // YYYY-MM-DD
                if (value) {
                    const [y, m, d] = value.split("-");
                    const formatted = `${d}/${m}/${y}`; // → DD/MM/YYYY
                    setFormData({ ...formData, date: formatted });
                } else {
                    setFormData({ ...formData, date: ""});
                }
              }}
              className="border px-4 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Invoice Number */}
          <div className="flex flex-col">
            <label htmlFor="invoiceNumber" className="mb-1 font-medium text-sm">
              Invoice Number
            </label>
            <input
              id="invoiceNumber"
              type="text"
              required
              value={formData.invoiceNumber}
              onChange={handleChange}
              className="border px-4 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Company Name */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-sm">Company Name</label>
            <SearchableSelect
              id="companyName"
              value={formData.companyName}
              onChange={(e) => {
                const selected = data.customers.find(
                  (c) => c.companyName === e.target.value
                );
                setFormData({
                  ...formData,
                  companyName: selected?.companyName,
                  customerId: selected?._id,
                });
              }}
              placeholder="Select Company"
              options={data?.customers?.map((item) => ({
                value: item.companyName,
                label: item.companyName,
              }))}
            />
          </div>

          {/* Clothe Type */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-sm">Cloth Type</label>
            <SearchableSelect
              id="clotheType"
              value={formData.clotheType}
              onChange={handleChange}
              placeholder="Select Type"
              options={data?.clotheTypes?.map((item) => ({
                value: item.name,
                label: item.name,
              }))}
            />
          </div>

          {/* Finishing Width */}
          <div className="flex flex-col">
            <label
              htmlFor="finishingWidth"
              className="mb-1 font-medium text-sm"
            >
              Finishing Width (inch)
            </label>
            <input
              id="finishingWidth"
              type="number"
              required
              value={formData.finishingWidth}
              onChange={handleChange}
              className="border px-4 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Quality */}
          <div>
            <label className="mb-1 font-medium text-sm">Quality</label>
            <SearchableSelect
              id="quality"
              value={formData.quality}
              onChange={handleChange}
              placeholder="Select Quality"
              options={data?.qualities?.map((item) => ({
                value: item.name,
                label: item.name,
              }))}
            />
          </div>

          {/* Sill Name */}
          <div className="flex flex-col">
            <label htmlFor="sillName" className="mb-1 font-medium text-sm">
              Sill Name
            </label>
            <SearchableSelect
              id="sillName"
              value={formData.sillName}
              onChange={handleChange}
              placeholder="Select Sill Name"
              options={data?.sillNames?.map((item) => ({
                value: item.name,
                label: item.name,
              }))}
            />
          </div>

          {/* Colour */}
          <div className="flex flex-col">
            <label htmlFor="colour" className="mb-1 font-medium text-sm">
              Colour
            </label>
            <SearchableSelect
              id="colour"
              value={formData.colour}
              onChange={handleChange}
              placeholder="Select Colour"
              options={data?.colours?.map((item) => ({
                value: item.name,
                label: item.name,
              }))}
            />
          </div>

          {/* Finishing Type */}
          <div className="flex flex-col">
            <label htmlFor="finishingType" className="mb-1 font-medium text-sm">
              Finishing Type
            </label>
            <SearchableSelect
              id="finishingType"
              value={formData.finishingType}
              onChange={handleChange}
              placeholder="Select Finishing"
              options={data?.finishingTypes?.map((item) => ({
                value: item.name,
                label: item.name,
              }))}
            />
          </div>

          {/* Total Goj */}
          {!isTableGojFilled && (
            <div className="flex flex-col">
              <label htmlFor="totalGoj" className="mb-1 font-medium text-sm">
                Total Goj
              </label>
              <input
                id="totalGoj"
                type="number"
                value={formData.totalGoj}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Total Bundle */}
          {!isTableGojFilled && (
            <div className="flex flex-col">
              <label htmlFor="totalBundle" className="mb-1 font-medium text-sm">
                Total Bundle
              </label>
              <input
                id="totalBundle"
                type="number"
                value={formData.totalBundle}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {/* Dyeing Name */}
          <div className="flex flex-col">
            <label htmlFor="dyeingName" className="mb-1 font-medium text-sm">
              Dyeing Name
            </label>
            <SearchableSelect
              id="dyeingName"
              value={formData.dyeingName}
              onChange={(e) => {
                const selected = data.dyeings.find(
                  (d) => d.name === e.target.value
                );
                setFormData({
                  ...formData,
                  dyeingName: selected?.name, // name optional
                  dyeingId: selected?._id, // ✅ Dyeing _id add
                });
              }}
              placeholder="Select Dyeing Name"
              options={data?.dyeings?.map((item) => ({
                value: item.name,
                label: item.name,
              }))}
            />
          </div>

          {/* Transporter Name */}
          <div className="flex flex-col">
            <label
              htmlFor="transporterName"
              className="mb-1 font-medium text-sm"
            >
              Transporter Name
            </label>
            <input
              id="transporterName"
              type="text"
              required
              value={formData.transporterName}
              onChange={handleChange}
              className="border px-4 py-2 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Table */}
        {!isFormTotalsFilled && (
          <>
            <h3 className="text-xl font-semibold mt-6 mb-2">
              Roll & Goj Table
            </h3>
            <table className="w-full border border-gray-300 mb-4">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Than</th>
                  <th className="border px-2 py-1">Goj</th>
                  <th className="border px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1 text-center">{idx + 1}</td>
                    <td className="border px-2 py-1">
                      <input
                        type="number"
                        name="goj"
                        ref={(el) => (inputRefs.current[idx] = el)}
                        value={row.goj ?? ""}
                        onChange={(e) => handleTableChange(idx, e)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className="w-full border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(idx)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Sum Section */}
            <div className="flex justify-between bg-gray-100 p-2 rounded mb-4">
              <p className="font-semibold text-gray-700">
                Total Than: {tableData.length}
              </p>
              <p className="font-semibold text-gray-700">
                Total Goj:{" "}
                {tableData.reduce(
                  (sum, row) => sum + (Number(row.goj) || 0),
                  0
                )}
              </p>
            </div>
            {/* Add Row Button manually if needed, although Enter works */}
            <div className="flex justify-end mb-4">
                <button
                    type="button"
                    onClick={addRow}
                    className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg"
                >
                    + Add Row
                </button>
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-8 gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 hover:bg-gray-700 text-white font-medium px-6 py-3 cursor-pointer rounded-lg"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg"
          >
            Update Order
          </button>
        </div>
      </form>
    </section>
  );
};

export default Page;
