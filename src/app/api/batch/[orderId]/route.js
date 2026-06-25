import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Batch from "@/models/Batch";
import mongoose from "mongoose";


// export async function GET(req, { params }) {
//   try {

//     await connectDB();
//     const { orderId } = params;

//     // 3️⃣ Find batch document based on orderId
//     const batchDoc = await Batch.findOne({ orderId });

//     // 4️⃣ If no batch found, send 404
//     if (!batchDoc) {
//       return NextResponse.json([], { status: 200 });
//     }

//     return NextResponse.json(batchDoc, { status: 200 });

//   } catch (err) {
//     console.error("❌ Error fetching batches:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch batches." },
//       { status: 500 }
//     );
//   }
// }




export async function GET(req, { params }) {
  try {
    await connectDB();
    const { orderId } = await params;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const batchDoc = await Batch.findOne({ orderId });

    if (!batchDoc) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(batchDoc, { status: 200 });
  } catch (err) {
    console.error("❌ Error fetching batches:", err);
    return NextResponse.json(
      { error: "Failed to fetch batches." },
      { status: 500 }
    );
  }
}




// ✅ DELETE a specific batch by orderId + batchId (from query)
export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const { orderId } = await params;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // 🔹 Get batchId from query string: /api/batch/[orderId]?batchId=xxxx
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");

    if (!batchId) {
      return NextResponse.json(
        { message: "Missing batchId in query" },
        { status: 400 }
      );
    }

    const batchDoc = await Batch.findOne({ orderId });
    if (!batchDoc)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    // ✅ Remove the batch from the array
    batchDoc.batches = batchDoc.batches.filter(
      (b) => b._id.toString() !== batchId
    );

    await batchDoc.save();

    return NextResponse.json(
      { message: "Batch deleted successfully", batches: batchDoc.batches },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

