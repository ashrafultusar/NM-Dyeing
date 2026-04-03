import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SavedInvoice from "@/models/SavedInvoice";
import BillingSummary from "@/models/BillingSummary";
import Payment from "@/models/Payment";
import mongoose from "mongoose";

export async function PATCH(req, { params }) {
    try {
        await connectDB();
        const resolvedParams = await params;
        const { invoiceId } = resolvedParams;
        const body = await req.json();

        if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const invoice = await SavedInvoice.findById(invoiceId);
        if (!invoice) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

        if (body.action === "remove") {
            const { recordId, modelType, charge, payment } = body.record;

            invoice.records = invoice.records.filter(r => !(r.recordId?.toString() === recordId && r.modelType === modelType));
            invoice.totalCharge -= (charge || 0);
            invoice.totalPayment -= (payment || 0);

            if (invoice.records.length === 0) {
                await SavedInvoice.findByIdAndDelete(invoiceId);
            } else {
                await invoice.save();
            }

            if (modelType === "BillingSummary" && recordId) {
                await BillingSummary.findByIdAndUpdate(recordId, { isSavedInLedger: false });
            } else if (modelType === "Payment" && recordId) {
                await Payment.findByIdAndUpdate(recordId, { isSavedInLedger: false });
            }
            return NextResponse.json({ success: true, deletedInvoice: invoice.records.length === 0 });
        }

        const { records, totalCharge, totalPayment } = body;
        invoice.records.push(...records);
        invoice.totalCharge += totalCharge;
        invoice.totalPayment += totalPayment;
        await invoice.save();

        for (const record of records) {
            if (record.modelType === "BillingSummary" && record.recordId) {
                await BillingSummary.findByIdAndUpdate(record.recordId, { isSavedInLedger: true });
            } else if (record.modelType === "Payment" && record.recordId) {
                await Payment.findByIdAndUpdate(record.recordId, { isSavedInLedger: true });
            }
        }
        return NextResponse.json({ success: true });
    } catch (error) { return NextResponse.json({ success: false, error: error.message }, { status: 500 }); }
}
