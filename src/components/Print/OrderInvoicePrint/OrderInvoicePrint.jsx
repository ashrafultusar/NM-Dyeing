"use client";

import Image from "next/image";
import React from "react";
import { IoLogoWhatsapp } from "react-icons/io";

export default function OrderInvoicePrint({ order }) {
  const tableRows = order?.tableData || [
    { _id: "1", rollNo: 1, goj: 10.5, extra: "1.2" },
    { _id: "2", rollNo: 2, goj: 11.2, extra: "0.8" },
    { _id: "3", rollNo: 3, goj: 9.8, extra: "0.5" },
  ];

  const totalGoj = tableRows
    .reduce(
      (sum, row) =>
        sum + (parseFloat(row.goj) || 0) + (parseFloat(row.extra) || 0),
      0
    )
    .toFixed(2);

  const totalRoll = tableRows.length;

  const invoiceNumber = order?.invoiceNumber || "N/A";
  const date = order?.updatedAt
    ? new Date(order.updatedAt).toLocaleDateString("en-BD")
    : new Date().toLocaleDateString("en-BD");

  const clotheType = order?.clotheType || "Polyster";
  const finishingWidth = order?.finishingWidth || "58''";
  const orderId = order?.orderId || "ORD-001";
  const dyeingName = order?.dyeingName || "M/S Color Dyes";
  const partyName = order?.companyName || "M/S Rahman Fabrics";

  return (
    <div className="print-area font-sans mt-12 text-gray-900 bg-white p-10 max-w-3xl mx-auto border border-gray-300 rounded-lg shadow-md print:shadow-none print:border-none print:p-0">
      {/* header */}
      <div className="border-b-2 border-black pb-3 mb-4">
        <div className="flex flex-col items-center">
          {/* LOGO + TITLE */}
          <div className="flex items-center gap-3 justify-center">
            <Image
              src="/Image/logo.png"
              alt="Company Logo"
              width={60}
              height={60}
              priority
              loading="eager"
              className="object-contain"
            />
            <h1 className="text-2xl font-bold text-center -mb-3">
              মেসার্স এম.এন ডাইং এন্ড ফিনিশিং এজেন্ট
            </h1>
          </div>

          <p className="text-sm text-center">ঠিকানা: মাধবদী, নরসিংদী</p>

          {/* Phone Line */}
          <p className="flex items-center justify-center gap-2 text-base whitespace-nowrap">
            <span>Phone:</span>
            <span>01711201870</span>
            <span>01782155151</span>
            <IoLogoWhatsapp className="text-green-600 text-xl" />
            <Image src="/Image/bkash.png" width={18} height={18} alt="bKash"  priority
  loading="eager"/>
          </p>
        </div>
      </div>

      {/* ORDER INFO */}
      <div className="grid grid-cols-3 text-sm font-medium border-b border-gray-400 pb-2 mb-4">
        <div className="space-y-1">
          <p>
            Company: <span className="font-normal">{partyName}</span>
          </p>
          <p>
            Dyeing: <span className="font-normal">{dyeingName}</span>
          </p>
        </div>
        <div className="space-y-1">
          <p>
            Cloth: <span className="font-normal">{clotheType}</span>
          </p>
          <p>
            Finishing: <span className="font-normal">{finishingWidth}</span>
          </p>
        </div>
        <div className="space-y-1 text-right">
          <p>
            Order ID: <span className="font-normal">{orderId}</span>
          </p>
          <p>
            Invoice: <span className="font-normal">{invoiceNumber}</span>
          </p>
          <p>
            Date: <span className="font-normal">{date}</span>
          </p>
        </div>
      </div>

      {/* TABLE */}
      <table className="w-full border border-gray-400 border-collapse text-sm mb-10">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 py-2 w-[25%]">রোল নং</th>
            <th className="border border-gray-400 py-2 w-[25%]">গজ</th>
          </tr>
        </thead>
        <tbody>
          {tableRows?.map((row, i) => {
            const totalRow =
              (parseFloat(row.goj) || 0) + (parseFloat(row.extra) || 0);
            return (
              <tr key={row._id || i} className="even:bg-gray-50 text-center">
                <td className="border border-gray-400 py-1">{row.rollNo}</td>
                <td className="border border-gray-400 py-1">{row.goj}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-semibold">
            <td className="border border-gray-400 py-2 text-left pl-3">
              মোট রোল: {totalRoll}
            </td>
            <td
              colSpan={3}
              className="border border-gray-400 py-2 text-right pr-3"
            >
              মোট গজ: {totalGoj}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Signatures */}
      <div className="flex justify-between items-center  text-xs">
        <div
          className="text-center pt-4"
          style={{ width: "120px", borderTop: "1px solid black" }}
        >
          <p>গ্রহীতার স্বাক্ষর</p>
        </div>
        <div
          className="text-center pt-4"
          style={{ width: "120px", borderTop: "1px solid black" }}
        >
          <p>পক্ষে - মেসার্স এম.এন ডাইং</p>
        </div>
      </div>
    </div>
  );
}
