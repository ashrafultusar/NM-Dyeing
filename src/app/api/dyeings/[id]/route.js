import connectDB from "@/lib/db";
import Dyeing from "@/models/Dyeing";
import { NextResponse } from "next/server";

// GET single dyeing
export async function GET(req, { params }) {
  try {
    await connectDB();
    const dyeing = await Dyeing.findById(params.id);
    if (!dyeing) {
      return NextResponse.json({ error: "Dyeing not found" }, { status: 404 });
    }
    return NextResponse.json(dyeing);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// UPDATE dyeing
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();
    const dyeing = await Dyeing.findByIdAndUpdate(params.id, body, {
      new: true,
    });
    if (!dyeing) {
      return NextResponse.json({ error: "Dyeing not found" }, { status: 404 });
    }
    return NextResponse.json(dyeing);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — set ledger initial amount
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { initialCharge, initialPayment, initialDate } = await req.json();
    if (typeof initialCharge !== "number" || initialCharge < 0)
      return NextResponse.json({ error: "Invalid charge amount" }, { status: 400 });
    if (typeof initialPayment !== "number" || initialPayment < 0)
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 });

    const updated = await Dyeing.findByIdAndUpdate(
      params.id,
      { initialCharge, initialPayment, initialDate: initialDate || null },
      { new: true }
    );
    if (!updated)
      return NextResponse.json({ error: "Dyeing not found" }, { status: 404 });

    return NextResponse.json({ success: true, initialCharge: updated.initialCharge, initialPayment: updated.initialPayment, initialDate: updated.initialDate });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE dyeing
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const dyeing = await Dyeing.findByIdAndDelete(params.id);
    if (!dyeing) {
      return NextResponse.json({ error: "Dyeing not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Dyeing deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
