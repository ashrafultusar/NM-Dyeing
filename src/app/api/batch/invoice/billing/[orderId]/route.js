
import connectDB from "@/lib/db";
import Batch from "@/models/Batch";
import Invoice from "@/models/Invoice";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { orderId } = await params;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid Order ID" }, { status: 400 });
    }

    // 🧾 Find all invoices of this order
    const invoices = await Invoice.find({ orderId });

    if (!invoices.length) {
      return NextResponse.json({ error: "No invoices found" }, { status: 404 });
    }

    // 🔹 Find the batch document
    const batchDoc = await Batch.findOne({ orderId });
    if (!batchDoc) {
      return NextResponse.json({ error: "Batch record not found" }, { status: 404 });
    }

    // 🧠 For each invoice, gather its related batch data
    const result = invoices.map((inv) => {
      const relatedBatches = batchDoc.batches.filter((b) =>
        inv.batchIds.some((id) => id.toString() === b._id.toString())
      );

      return {
        invoiceNumber: inv.invoiceNumber,
        batchCount: relatedBatches.length,
        batches: relatedBatches,
      };
    });

    return NextResponse.json({ invoices: result });
  } catch (err) {
    console.error("Fetch Invoice Billing Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
