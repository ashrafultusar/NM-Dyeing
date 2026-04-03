import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BillingSummary from "@/models/BillingSummary";
import Payment from "@/models/Payment";
import Dyeing from "@/models/Dyeing";
import LedgerSnapshot from "@/models/LedgerSnapshot";
import SavedInvoice from "@/models/SavedInvoice";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { dyeingId } = resolvedParams;

    if (!mongoose.Types.ObjectId.isValid(dyeingId)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const objId = new mongoose.Types.ObjectId(dyeingId);

    // Latest snapshot — records AFTER this date belong to current (open) period
    const latestSnapshot = await LedgerSnapshot.findOne(
      { entityId: objId, entityType: "dyeing" },
      { closedAt: 1 }
    ).sort({ closedAt: -1 });

    const fromDate = latestSnapshot ? latestSnapshot.closedAt : new Date(0);

    const [dyeing, billings, payments] = await Promise.all([
      Dyeing.findById(objId),
      BillingSummary.find({ dyeingId: objId, summaryType: "dyeing", createdAt: { $gt: fromDate } }).sort({ createdAt: 1 }),
      Payment.find({ dyeingId: objId, createdAt: { $gt: fromDate } }).sort({ date: 1 }),
    ]);

    if (!dyeing) {
      return NextResponse.json({ success: false, message: "Dyeing not found" }, { status: 404 });
    }

    const savedInvoices = await SavedInvoice.find({ entityId: objId, entityType: "dyeing" });
    const savedRecordIds = [];
    savedInvoices.forEach(inv => {
      inv.records.forEach(rec => { if (rec.recordId) savedRecordIds.push(rec.recordId.toString()); });
    });

    return NextResponse.json({
      success: true,
      data: {
        dyeing,
        billings,
        payments,
        openingBalance: latestSnapshot ? latestSnapshot.finalBalance : 0,
        initialCharge: dyeing.initialCharge ?? 0,
        initialPayment: dyeing.initialPayment ?? 0,
        initialDate: dyeing.initialDate ?? null,
        savedRecordIds,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

