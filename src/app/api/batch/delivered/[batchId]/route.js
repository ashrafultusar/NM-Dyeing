import connectDB from "@/lib/db";
import Batch from "@/models/Batch";
import { NextResponse } from "next/server";
import mongoose from "mongoose";


export async function GET(req, { params }) {
  await connectDB();

  try {
    const { batchId } = await params;

    if (!batchId || !mongoose.Types.ObjectId.isValid(batchId)) {
      return NextResponse.json({ error: "Invalid Batch ID format" }, { status: 400 });
    }

    const batchDoc = await Batch.findOne({ "batches._id": batchId });

    if (!batchDoc)
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    const batch = batchDoc.batches.id(batchId);

    return NextResponse.json({ batch });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error while fetching batch" },
      { status: 500 }
    );
  }
}




export async function PUT(req, { params }) {
  await connectDB();

  try {
    const { batchId } = await params;

    if (!batchId || !mongoose.Types.ObjectId.isValid(batchId)) {
      return NextResponse.json({ error: "Invalid Batch ID format" }, { status: 400 });
    }

    const body = await req.json();

    const { updatedRows } = body;

    const batchDoc = await Batch.findOne({ "batches._id": batchId });

    if (!batchDoc)
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    const batch = batchDoc.batches.id(batchId);

    batch.rows = updatedRows;

    await batchDoc.save();

    return NextResponse.json({
      message: "Batch updated successfully",
      batch,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error updating batch" },
      { status: 500 }
    );
  }
}
