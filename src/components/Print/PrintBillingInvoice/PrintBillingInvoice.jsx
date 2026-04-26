"use client";

import { IoLogoWhatsapp } from "react-icons/io";

import Image from "next/image";

export default function PrintBillingInvoice({ order }) {
  const orderInfo = order?.orderInfo;
  const batches = order?.batches || [];

  // Chunk batches 3 per row
  const chunkedBatches = [];
  for (let i = 0; i < batches.length; i += 3) {
    chunkedBatches.push(batches.slice(i, i + 3));
  }

  // --- GRAND TOTAL CALCULATION ---
  let grandTotalFinishGoj = 0;
  let grandTotalFinishRolls = 0;

  batches?.forEach((batch) => {
    const finishingRows =
      batch.rows?.map((r) => {
        const idxValue = Number(r.idx?.[0] || 0);

        const extras = r.extraInputs
          ? r.extraInputs.map((v) => Number(v || 0))
          : [];

        const totalGoj = idxValue + extras.reduce((s, v) => s + v, 0);
        const rollCount = 1 + extras.length;

        // MODIFIED LOGIC: Return the calculated row info
        return { goj: totalGoj, rollCount };
      }) || [];

    grandTotalFinishGoj += finishingRows.reduce((s, r) => s + r.goj, 0);

    // MODIFIED LOGIC HERE: Only count rolls where total 'goj' > 0
    grandTotalFinishRolls += finishingRows.reduce((s, r) => {
      // যদি 'goj' 0 এর বেশি হয় তবেই rollCount যোগ হবে
      return s + (r.goj > 0 ? r.rollCount : 0);
    }, 0);
  });

  return (
    <div
      className="print-only p-0 text-xs text-gray-800 font-sans bg-white"
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        padding: "10mm",
        boxSizing: "border-box",
      }}
    >
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
              unoptimized
              loading="eager"
              className="object-contain"
            />
            <h1 className="text-2xl text-center -mb-3">
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
            <Image
              src="/Image/bkash.png"
              width={18}
              unoptimized
              height={18}
              alt="bKash"
              priority
              loading="eager"
            />
          </p>
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-3 text-sm font-medium border-b border-gray-400 pb-2 mb-4">
        <div className="space-y-1">
          <p className="text-md">
            Client:{" "}
            <span className="font-normal ">{orderInfo?.companyName}</span>
          </p>
          <p>
            Cloth Type:{" "}
            <span className="font-normal">{orderInfo?.clotheType}</span>
          </p>
        </div>
        <div className="space-y-1">
          <p>
            Cloth Quality:{" "}
            <span className="font-normal">{orderInfo?.quality}</span>
          </p>
          <p>
            Finishing Width:{" "}
            <span className="font-normal">{orderInfo?.finishingWidth}</span>
          </p>
        </div>
        <div className="space-y-1 text-right">
          <p>
            Order ID: <span className="font-normal">{orderInfo?.orderId}</span>
          </p>
          <p>
            Invoice Number:{" "}
            <span className="font-normal">{order?.invoiceNumber}</span>
          </p>
          <p>
            Date:{" "}
            <span className="font-normal">
              {orderInfo?.updatedAt
                ? new Date(orderInfo.updatedAt).toLocaleDateString("en-BD", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : "N/A"}
            </span>
          </p>
        </div>
      </div>

      {/* Batch Boxes */}
      <div className="mt-4 space-y-6">
        {chunkedBatches?.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-3 gap-4 items-start">
            {row.map((batch, index) => {
              // GRAY rows
              const grayRows =
                batch.rows?.map((r) => ({
                  rollNo: r.rollNo,
                  goj: r.goj,
                })) || [];

              const totalGray = grayRows.reduce(
                (sum, r) => sum + (r.goj || 0),
                0
              );

              // --- UPDATED FINISHING LOGIC ---
              const finishingRows =
                batch.rows?.map((r) => {
                  const idxValue = Number(r.idx?.[0] || 0);
                  const extras = r.extraInputs
                    ? r.extraInputs.map((v) => Number(v || 0))
                    : [];

                  const calcText =
                    extras.length > 0
                      ? `${idxValue} + ${extras.join(" + ")}`
                      : `${idxValue}`;

                  const totalGoj = idxValue + extras.reduce((s, v) => s + v, 0);
                  const rollCount = 1 + extras.length; // number of values

                  return {
                    goj: totalGoj,
                    calcText,
                    rollCount,
                  };
                }) || [];

              const totalFinish = finishingRows.reduce(
                (sum, r) => sum + r.goj,
                0
              );

              // MODIFIED LOGIC HERE: Calculate total rolls for the batch, excluding 0 goj entries
              const totalFinishRolls = finishingRows.reduce(
                (sum, r) => sum + (r.goj > 0 ? r.rollCount : 0),
                0
              );

              return (
                <div
                  key={index}
                  style={{
                    pageBreakInside: "avoid",
                    border: "0.1px solid rgba(0, 0, 0, 0.6)", // ব্যাচের মেইন বর্ডার
                  }}
                >
                  {/* Batch Header */}
                  <div className="text-center font-bold border-b border-black py-1">
                    {batch?.batchName} - {batch?.sillName}
                  </div>

                  <div className="text-center border-b border-black py-1 text-[11px] leading-tight">
                    {batch?.colour} - {batch?.finishingType}
                  </div>

                  {/* 2 Table Layout */}
                  <div className="grid grid-cols-2">
                    {/* GRAY TABLE */}
                    <div className="border-r border-black">
                      <div className="text-center font-semibold border-b border-black py-1 text-[11px]">
                        গ্রে- বেচ ১
                      </div>

                      <div className="grid grid-cols-2 text-[10px] font-semibold border-b border-black text-center">
                        <div className="border-r border-black py-1">রোল</div>
                        <div className="py-1">গজ</div>
                      </div>

                      {grayRows?.map((r, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-2 border-b border-gray-300 text-[10px] text-center"
                        >
                          <div className="border-r border-black py-1">
                            {r.rollNo}
                          </div>
                          <div className="py-1">{r.goj}</div>
                        </div>
                      ))}

                      <div className="grid grid-cols-2 text-center text-[11px] font-bold border-t border-black">
                        <div className="border-r border-black py-1">
                          রোল: {grayRows.length}
                        </div>
                        <div className="py-1">গজ: {totalGray}</div>
                      </div>
                    </div>

                    {/* FINISHING TABLE */}
                    <div>
                      <div className="text-center font-semibold border-b border-black py-1 text-[11px]">
                        ফিনিশিং- বেচ ১
                      </div>

                      <div className="grid grid-cols-2 text-[10px] font-semibold border-b border-black text-center">
                        <div className="border-r border-black py-1">রোল</div>
                        <div className="py-1">গজ</div>
                      </div>

                      {finishingRows?.map((r, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-2 border-b border-gray-300 text-[10px] text-center"
                        >
                          <div className="border-r border-black py-1">
                            {r.rollCount}
                          </div>
                          <div className="py-1">{r.calcText}</div>
                        </div>
                      ))}

                      <div className="grid grid-cols-2 text-center text-[11px] font-bold border-t border-black">
                        <div className="border-r border-black py-1">
                          রোল: {totalFinishRolls} {/* Uses the updated total */}
                        </div>
                        <div className="py-1">গজ: {totalFinish}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Grand Summary */}
      <div className="mt-16">
        <div
          className="grid grid-cols-4 text-lg text-center"
          style={{
            border: "1px solid black",
          }}
        >
          <div className="py-2" style={{ borderRight: "1px solid black" }}>
            মোট গজ:
          </div>
          <div className="py-2" style={{ borderRight: "1px solid black" }}>
            {grandTotalFinishGoj}
          </div>
          <div className="py-2" style={{ borderRight: "1px solid black" }}>
            মোট রোল:
          </div>
          <div className="py-2">{grandTotalFinishRolls}</div>
        </div>
      </div>

      {/* Signatures */}
      <div className="flex justify-between items-center mt-24 text-xs">
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
