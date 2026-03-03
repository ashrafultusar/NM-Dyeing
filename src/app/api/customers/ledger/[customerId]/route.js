import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BillingSummary from "@/models/BillingSummary";
import Payment from "@/models/Payment";
import customers from "@/models/customers";
import LedgerSnapshot from "@/models/LedgerSnapshot";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { customerId } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const objId = new mongoose.Types.ObjectId(customerId);

    // Latest snapshot — records AFTER this date belong to current (open) period
    const latestSnapshot = await LedgerSnapshot.findOne(
      { entityId: objId, entityType: "customer" },
      { closedAt: 1 }
    ).sort({ closedAt: -1 });

    const fromDate = latestSnapshot ? latestSnapshot.closedAt : new Date(0);

    const [customer, billings, payments] = await Promise.all([
      customers.findById(objId),
      BillingSummary.find({ customerId: objId, createdAt: { $gt: fromDate } }).sort({ createdAt: 1 }),
      Payment.find({ userId: objId, date: { $gt: fromDate } }).sort({ date: 1 }),
    ]);

    if (!customer) {
      return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        customer,
        billings,
        payments,
        initialAmount: customer.initialAmount ?? 0,
        initialAmountType: customer.initialAmountType ?? "charge",
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}