// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db";
// import CompletedBatch from "@/components/Batch/CompletedBatch";


// export async function PUT(req, { params }) {
//   await connectDB();

//   try {
//     const { id } = params;

//     if (!id) {
//       return NextResponse.json({ error: "Batch ID is required" }, { status: 400 });
//     }

//     const body = await req.json();
//     let { price, total } = body;

//     // Convert to number
//     price = Number(price);
//     total = Number(total);

//     if (price === undefined || total === undefined || isNaN(price) || isNaN(total)) {
//       return NextResponse.json(
//         { error: "Price and Total must be valid numbers" },
//         { status: 400 }
//       );
//     }

//     const updatedBatch = await CompletedBatch.findByIdAndUpdate(
//       id,
//       { price, total },
//       { new: true }
//     );

//     if (!updatedBatch) {
//       return NextResponse.json({ error: "Batch not found" }, { status: 404 });
//     }

//     return NextResponse.json(updatedBatch, { status: 200 });
//   } catch (error) {
//     console.error("PUT /update-billing error:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to update billing" },
//       { status: 500 }
//     );
//   }
// }

// app/api/batch/completed/update-billing/[id]/route.js

import connectDB from "@/lib/db";
import BillingSummary from "@/models/BillingSummary";
import { NextResponse } from "next/server";
import mongoose from "mongoose";


export async function PUT(req, { params }) {
  await connectDB();

  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid Batch ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    let { price, total } = body;

    // Convert to numbers
    price = Number(price);
    total = Number(total);

    // Validate numbers
    if (isNaN(price) && isNaN(total)) {
      return NextResponse.json(
        { error: "Either price or total must be a valid number" },
        { status: 400 }
      );
    }

    // Fetch the batch first to get totalQty
    const batch = await BillingSummary.findById(id);
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const totalQty = batch.totalQty;

    // Auto-calculate missing value
    if (!isNaN(price) && (total === undefined || total === null)) {
      total = price * totalQty;
    } else if (!isNaN(total) && (price === undefined || price === null)) {
      price = total / totalQty;
    }

    // Update batch
    batch.price = price;
    batch.total = total;

    await batch.save();

    return NextResponse.json(batch, { status: 200 });
  } catch (error) {
    console.error("PUT /update-billing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update billing" },
      { status: 500 }
    );
  }
}
