"use client";

import Image from "next/image";

import React from "react";

import { IoLogoWhatsapp } from "react-icons/io";

import { fmtDate } from "@/components/customer/ledgerUtils";

export default function LedgerPrint({
  customer,

  rows = [],

  openingBalance = 0,

  initialCharge = 0,

  initialPayment = 0,

  initialDate = null,

  totalCharge = 0,

  totalPayment = 0,

  finalBalance = 0,

  selectedLabel = "Current Ledger",

  role = "Customer",
}) {
  const hasInitial = initialCharge > 0 || initialPayment > 0;

  const initialBalance = (initialPayment || 0) - (initialCharge || 0);

  const effectiveOpening = openingBalance + initialBalance;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `

                @media print {

                    @page { 

                        size: A4; 

                        margin: 5mm; 

                    }

                    body { 

                        margin: 0; 

                        padding: 0; 

                    }

                    .print-area {

                        width: 100% !important;

                        max-width: 100% !important;

                        padding: 0 !important;

                        margin: 0 !important;

                        border: none !important;

                    }

                    table { font-size: 9px !important; }

                    th, td { padding: 4px 2px !important; }

                }

            `,
        }}
      />

      <div className="print-area font-sans mt-8 text-gray-900 bg-white p-8 max-w-4xl mx-auto border border-gray-300 rounded-lg shadow-md print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-full">
        {/* HEADER */}

        <div className="border-b-[0.5px] border-black/20 pb-1">
          <div className="flex flex-col items-center">
            <div
              className="flex items-center gap-2 -mb-2

             justify-center"
            >
              <Image
                src="/Image/logo.png"
                alt="Company Logo"
                width={35}
                height={35}
                priority
                className="object-contain"
              />

              <h1 className="text-lg font-bold opacity-75 text-center leading-tight">
                মেসার্স এম.এন ডাইং এন্ড ফিনিশিং এজেন্ট
              </h1>
            </div>

            <p className="text-[10px] text-center mt-0.5">
              ঠিকানা: মাধবদী, নরসিংদী
            </p>

            <p className="flex items-center justify-center gap-2 text-[11px] ">
              <span className="font-semibold opacity-80">Phone:</span>

              <span>01711201870, 01782155151</span>

              <IoLogoWhatsapp className="text-green-600 text-base" />

              <Image
                src="/Image/bkash.png"
                width={12}
                height={12}
                alt="bKash"
                priority
              />
            </p>
          </div>
        </div>

        {/* Selected Label - Top margin further reduced */}

        <h2 className="text-start mt-1 text-[7px] uppercase font-bold text-gray-500 mb-0.5">
          {selectedLabel}
        </h2>

        {/* CUSTOMER INFO - Vertical spacing minimized */}

        <div className="grid grid-cols-2 text-[11px] border-b border-gray-400 pb-1 mb-2 leading-tight">
          <div className="space-y-0">
            <p className="m-0 p-0">
              {role}:{" "}
              <span
                className="font-medium

              opacity-80 "
              >
                {customer?.companyName || "—"}
              </span>
            </p>

            <p className="m-0 p-0">
              Owner:{" "}
              <span className="font-medium text-gray-700">
                {customer?.ownerName || "—"}
              </span>
            </p>
          </div>

          <div className="space-y-0 text-right">
            <p className="m-0 p-0">
              Phone:{" "}
              <span className="font-medium">
                {customer?.phoneNumber || "—"}
              </span>
            </p>

            <p className="m-0 p-0">
              Address:{" "}
              <span className="font-normal uppercase text-[9px]">
                {customer?.address || "—"}
              </span>
            </p>

            <p className="text-[8px] font-medium opacity-80">
              Printed: {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        {/* TABLE */}

        <table className="w-full text-[10px] mb-4 border-collapse">
          <thead>
            <tr className="text-gray-600 border-b-[0.5px] border-gray-300">
              <th className="py-2 px-2 text-center font-bold">Date</th>

              <th className="py-2 px-2 text-center font-bold">Order ID</th>

              <th className="py-2 px-2 text-center font-bold">Method</th>

              <th className="py-2 px-2 text-center font-bold">Description</th>

              <th className="py-2 px-2 text-center font-bold">Charge (+)</th>

              <th className="py-2 px-2 text-center font-bold">Payment (-)</th>

              <th className="py-2 px-2 text-center font-bold">Balance</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {" "}
            {/* Rows are separated by very subtle lines */}
            {rows?.map((row, idx) => (
              <tr
                key={idx}
                // Zebra striping with extremely light gray for clarity

                className={`${
                  idx % 2 !== 0 ? "bg-[#f8f9fa]" : "bg-white"
                } text-[#374151]`}
              >
                <td className="py-2.5 px-2 text-center whitespace-nowrap font-medium text-gray-600">
                  {fmtDate(row.date)}
                </td>

                <td className="py-2.5 px-2 text-center font-medium text-gray-600">
                  {row.displayOrderId || "—"}
                </td>

                <td className="py-2.5 px-2 text-center text-[9px] font-medium text-gray-600 uppercase ">
                  {row.provider}
                </td>

                <td className="py-2.5 px-2 text-center">
                  <div className="font-medium text-gray-600">
                    {row.description}
                  </div>

                  {row.colour && (
                    <div className="text-[9px] mt-0.5">
                      <span className="text-gray-400 italic">Color: </span>

                      <span className="">{row.colour}</span>
                    </div>
                  )}
                </td>

                <td className="py-2.5 px-2 text-center font-medium text-gray-600 ">
                  {row.charge > 0 ? `৳${row.charge.toLocaleString()}` : "—"}
                </td>

                <td className="py-2.5 px-2 text-center font-medium text-gray-600 ">
                  {row.payment > 0 ? `৳${row.payment.toLocaleString()}` : "—"}
                </td>

                <td
                  className="py-2.5 px-2 text-center font-medium text-gray-600

        "
                >
                  <span className="bg-gray-100/50 px-1.5 py-0.5 rounded">
                    {row.balance < 0
                      ? `- ৳${Math.abs(row.balance).toLocaleString()}`
                      : `+ ৳${row.balance.toLocaleString()}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SUMMARY */}

        <div className="w-full flex justify-end text-[11px]">
          <div className="w-[180px] border border-gray-300 p-1.5 leading-tight">
            <div className="flex justify-between py-0.5 border-b">
              <span>Total Billings:</span>

              <span className="font-medium text-gray-600 ">
                ৳{totalCharge.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-0.5 border-b">
              <span>Total Received:</span>

              <span className="font-medium text-gray-600 ">
                ৳{totalPayment.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-1  font-medium text-gray-600 ">
              <span>Balance:</span>

              <span className={finalBalance < 0 ? "-" : "+"}>
                {finalBalance < 0
                  ? `- ${Math.abs(finalBalance).toLocaleString()} `
                  : `${finalBalance.toLocaleString()} +`}
              </span>
            </div>
          </div>
        </div>

        {/* Signatures - Line Opacity Reduced */}

        <div className="flex justify-between items-center text-[10px] mt-16 print:mt-12">
          <div className="text-center pt-1.5 w-[100px] border-t border-black/20">
            {" "}
            {}
            <p className="font-medium text-gray-600">গ্রাহকের স্বাক্ষর</p>
          </div>

          <div className="text-center pt-1.5 w-[130px] border-t border-black/20">
            {" "}
            {}
            <p className="font-medium text-gray-600">কর্তৃপক্ষের স্বাক্ষর</p>
          </div>
        </div>
      </div>
    </>
  );
}
