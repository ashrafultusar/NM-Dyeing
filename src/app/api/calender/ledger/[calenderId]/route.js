import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BillingSummary from "@/models/BillingSummary";
import Payment from "@/models/Payment";
import Calender from "@/models/Calender";
import LedgerSnapshot from "@/models/LedgerSnapshot";
import SavedInvoice from "@/models/SavedInvoice";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { calenderId } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(calenderId)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const objId = new mongoose.Types.ObjectId(calenderId);

    // Latest snapshot — records AFTER this date belong to current (open) period
    const latestSnapshot = await LedgerSnapshot.findOne(
      { entityId: objId, entityType: "calender" },
      { closedAt: 1 }
    ).sort({ closedAt: -1 });

    const fromDate = latestSnapshot ? latestSnapshot.closedAt : new Date(0);

    const [calender, billings, payments] = await Promise.all([
      Calender.findById(objId),
      BillingSummary.find({ calenderId: objId, summaryType: "calender", createdAt: { $gt: fromDate } }).sort({ createdAt: 1 }),
      Payment.find({ calenderId: objId, createdAt: { $gt: fromDate } }).sort({ date: 1 }),
    ]);

    if (!calender) {
      return NextResponse.json({ success: false, message: "Calender not found" }, { status: 404 });
    }

    const savedInvoices = await SavedInvoice.find({ entityId: objId, entityType: "calender" });
    const savedRecordIds = [];
    savedInvoices.forEach(inv => {
      inv.records.forEach(rec => { if (rec.recordId) savedRecordIds.push(rec.recordId.toString()); });
    });

    return NextResponse.json({
      success: true,
      data: {
        calender,
        billings,
        payments,
        openingBalance: latestSnapshot ? latestSnapshot.finalBalance : 0,
        initialCharge: calender.initialCharge ?? 0,
        initialPayment: calender.initialPayment ?? 0,
        initialDate: calender.initialDate ?? null,
        savedRecordIds,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
