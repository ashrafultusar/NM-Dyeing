import connectDB from "@/lib/db";
import Batch from "@/models/Batch";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();

    const {
      orderId,
      colour,
      quality,
      sillName,
      clotheType,
      finishingType,
      dyeing,
      calender,
      customerId,
      dyeingId,
      calenderId,
      rows,
      selectedProcesses,
    } = body;

    if (
      !orderId ||
      !colour ||
      !sillName ||
      !finishingType ||
      !dyeing ||
      !rows?.length ||
      !selectedProcesses?.length
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    let existing = await Batch.findOne({ orderId });

    const newBatch = {
      batchName: "Batch 1",
      status: "pending",
      colour,
      quality,
      sillName,
      clotheType,
      finishingType,
      dyeing,
      calender: calender || null,

      customerId: customerId || null,
      dyeingId: dyeingId || null,
      calenderId: calenderId || null,

      rows,
      selectedProcesses,
    };

    if (existing) {
      const lastBatchNumber =
        existing.batches.length > 0
          ? Math.max(
              ...existing.batches.map((b) =>
                parseInt(b.batchName.split(" ")[1] || 0)
              )
            )
          : 0;

      newBatch.batchName = `Batch ${lastBatchNumber + 1}`;

      existing.batches.push(newBatch);
      await existing.save();

      return NextResponse.json(existing, { status: 200 });
    } else {
      const created = await Batch.create({
        orderId,
        batches: [newBatch],
      });

      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("Batch creation error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ UPDATE (note, inputs, status change etc.)
export async function PATCH(req) {
  await connectDB();
  try {
    const { orderId, batchId, batchData } = await req.json();

    if (!orderId || !batchId || !batchData) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the batch document for this order
    const batchDoc = await Batch.findOne({ orderId });
    if (!batchDoc) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Find the batch inside batches array by _id
    const batchIndex = batchDoc.batches.findIndex(
      (b) => b._id.toString() === batchId
    );

    if (batchIndex === -1) {
      return NextResponse.json({ message: "Batch not found" }, { status: 404 });
    }

    // Update the batch with new data
    batchDoc.batches[batchIndex] = {
      ...batchDoc.batches[batchIndex].toObject(),
      ...batchData,
      status: batchData.status || batchDoc.batches[batchIndex].status,
    };

    await batchDoc.save();

    return NextResponse.json(batchDoc, { status: 200 });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
