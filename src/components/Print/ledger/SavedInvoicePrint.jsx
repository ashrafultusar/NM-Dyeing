"use client";

import Image from "next/image";

import React from "react";

import { IoLogoWhatsapp } from "react-icons/io";

import { fmtDate } from "@/components/customer/ledgerUtils";

export default function SavedInvoicePrint({ invoice, companyAddress }) {
  if (!invoice) return null;

  const records = invoice.records || [];

  const previousDueRecord = records.find(
    (r) =>
      r.displayOrderId === "Previous Due" ||
      r.clothType === "Previous Due" ||
      r.quality === "Previous Due" ||
      (r.description && r.description.startsWith("Previous Due")) ||
      (r.description && r.description.startsWith("Previous Ledger Balance"))
  );
  const previousDue = previousDueRecord ? previousDueRecord.charge || 0 : 0;

  const totalCharge = invoice.totalCharge || 0;

  const totalRecentBill = totalCharge - previousDue;

  const totalPayment = invoice.totalPayment || 0;

  const netDue = totalCharge - totalPayment;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `

                @media print {

                    @page { 

                        size: A5; 

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
        {/* HEADER - Consistent with Ledger Style */}

        <div className="border-b-[0.5px] border-black/20 pb-1">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 -mb-2 justify-center">
              <Image
                src="/Image/logo.png"
                alt="Company Logo"
                width={35}
                height={35}
                priority
                className="object-contain"
              />

              <h1 className="text-lg  text-center leading-tight">
                মেসার্স এম.এন ডাইং এন্ড ফিনিশিং এজেন্ট
              </h1>
            </div>

            <p className="text-[10px] text-center mt-0.5">
              ঠিকানা: মাধবদী, নরসিংদী
            </p>

            <p className="flex items-center justify-center gap-2 text-[11px]">
              <span className=" opacity-80">Phone:</span>

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

        {/* INVOICE INFO - Grid Layout matching Ledger */}

        <div className="grid grid-cols-2 text-[11px] border-b border-gray-400 pb-1 mb-2 mt-1 leading-tight">
          <div className="space-y-0">
            <p className=" p-0">
              Company:{" "}
              <span className=" ">
                {invoice.companyName || "—"}
              </span>
            </p>
            {companyAddress && (
              <p className="p-0">
                Address:{" "}
                <span className="">{companyAddress}</span>
              </p>
            )}
          </div>

          <div className="text-right">
            <p>
              Invoice No:{" "}
              <span className="">
                {invoice.invoiceNumber || "—"}
              </span>
            </p>

            <p>
              Date:{" "}
              <span className=" ">
                {invoice.createdAt ? fmtDate(invoice.createdAt) : "—"}
              </span>
            </p>

            <p className="text-[8px] ">
              Printed: {new Date().toLocaleString()}
            </p>
          </div>
        </div>

        {/* TABLE - Zebra Striped & Clean Lines */}
        <table className="w-full text-[10px] mb-4 border-collapse">
          <thead>
            <tr className=" border-b-[0.5px] border-gray-300">
              <th className="py-2 px-2 text-center ">Date</th>
              <th className="py-2 px-2 text-center ">ID / Invoice</th>
              <th className="py-2 px-2 text-center ">Method</th>
              <th className="py-2 px-2 text-center ">Description</th>
              <th className="py-2 px-2 text-center ">Charge (+)</th>
              <th className="py-2 px-2 text-center ">Payment (-)</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {records.map((row, idx) => {
              const isDueRow =
                row.displayOrderId === "Previous Due" ||
                row.clothType === "Previous Due" ||
                row.quality === "Previous Due" ||
                (row.description &&
                  row.description.startsWith("Previous Due")) ||
                (row.description &&
                  row.description.startsWith("Previous Ledger Balance"));

              let dueLabel = row.description;
              let dueId = "—";

              if (isDueRow && row.description) {
                const parenIndex = row.description.indexOf("(");
                if (parenIndex !== -1) {
                  dueLabel = row.description.substring(0, parenIndex).trim();
                  dueId = row.description.substring(parenIndex).trim();
                }
              }

              return (
                <tr
                  key={idx}
                  className={`${
                    idx % 2 !== 0 ? "bg-[#f8f9fa]" : "bg-white"
                  } `}
                >
                  <td className="py-2.5 px-2 text-center whitespace-nowrap ">
                    {fmtDate(row.date)}
                  </td>

                  {/* ID Section - Invoice (Upore) & OrderID (Niche small) */}
                  <td className="py-2.5 px-2 text-center ">
                    {isDueRow ? (
                      <div className="text-[8px]   whitespace-nowrap">
                        {dueId !== "—" ? dueId : invoice.invoiceNumber || "—"}
                      </div>
                    ) : (
                      <>
                        <div className="text-[8px] ">
                          {invoice.invoiceNumber || "—"}
                        </div>
                        <div className="text-[8px] ">
                          {row.displayOrderId || "—"}
                        </div>
                      </>
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-center text-[9px] ">
                    {row.provider}
                  </td>

                  {/* Description Section - 2 Lines */}
                  <td className="py-2.5 px-2 text-center leading-tight">
                    {isDueRow ? (
                      <div className="text-[10px] "></div>
                    ) : (
                      <>
                        {/* Top Line: Quality & ClothType */}
                        <div className="text-[8px] ">
                          {row.clothType || row.description}{" "}
                          {row.quality ? `/ ${row.quality}` : ""}
                        </div>
                        {/* Bottom Line: Small details */}
                        <div className="text-[8px] ">
                          {[row.finishingType, row.sillName, row.colour]
                            .filter(Boolean)
                            .join(" / ")}
                        </div>
                      </>
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-center ">
                    {row.charge > 0 ? (
                      row.qty && row.price && !isDueRow ? (
                        <span className="text-[8px]">
                          ({row.qty}×{row.price})=৳{row.charge.toLocaleString()}
                        </span>
                      ) : (
                        `৳${row.charge.toLocaleString()}`
                      )
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-center ">
                    {row.payment > 0 ? `৳${row.payment.toLocaleString()}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="w-full flex justify-end text-[11px]">
          <div className="w-[180px] border border-gray-400 p-1.5 leading-tight">
            <div className="flex justify-between py-0.5 border-b">
              <span>Sub Total:</span>
              <span className=" ">
                ৳{totalRecentBill.toLocaleString()}
              </span>
            </div>

            {previousDue > 0 && (
              <div className="flex justify-between py-0.5 border-b">
                <span>Due:</span>
                <span className="">
                  ৳{previousDue.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between py-0.5 border-b">
              <span>Total Bill:</span>
              <span className="">
                ৳{totalCharge.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-0.5 border-b">
              <span>Total Received:</span>
              <span className=" ">
                ৳{totalPayment.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-1 ">
              <span>Balance:</span>
              <span>
                {netDue < 0
                  ? `+ ৳${Math.abs(netDue).toLocaleString()}`
                  : `- ৳${netDue.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>

        {/* SIGNATURES - Consistent Spacing */}

        <div className="flex justify-between items-center text-[10px] mt-16 print:mt-12">
          <div className="text-center pt-1.5 w-[100px] border-t border-black/20">
            <p className="font-medium ">গ্রাহকের স্বাক্ষর</p>
          </div>

          <div className="text-center pt-1.5 w-[130px] border-t border-black/20">
            <p className="font-medium ">কর্তৃপক্ষের স্বাক্ষর</p>
          </div>
        </div>
      </div>
    </>
  );
}
