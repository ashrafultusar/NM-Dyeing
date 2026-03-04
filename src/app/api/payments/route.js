import connectDB from "@/lib/db";
import Payment from "@/models/Payment";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("userId");
    const type = searchParams.get("type");

    let query = {};
    if (type === "customer") query = { userId: id };
    else if (type === "dyeing") query = { dyeingId: id };
    else if (type === "calendar") query = { calenderId: id }; 
    else query = { user: id };

    const payments = await Payment.find(query)
  .sort({ date: -1, _id: -1 }) 
  .lean();
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, type, amount, method, description, date } = body;

    if (!userId || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const paymentData = {
      amount: Number(amount),
      method,
      description,
      date: date || new Date(),
    };

    // ✅ Using 'calenderId' to match the updated Model
    if (type === "customer") paymentData.userId = userId;
    else if (type === "dyeing") paymentData.dyeingId = userId;
    else if (type === "calendar") paymentData.calenderId = userId; 

    const payment = await Payment.create(paymentData);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

    const updatedPayment = await Payment.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return NextResponse.json(updatedPayment, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

    await Payment.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
