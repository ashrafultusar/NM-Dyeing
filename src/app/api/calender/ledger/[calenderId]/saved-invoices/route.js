import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SavedInvoice from "@/models/SavedInvoice";
import BillingSummary from "@/models/BillingSummary";
import Payment from "@/models/Payment";
import Calender from "@/models/Calender";
import mongoose from "mongoose";

export async function POST(req, { params }) {
    try {
        await connectDB();
        const resolvedParams = await params;
        const { calenderId } = resolvedParams;

        if (!mongoose.Types.ObjectId.isValid(calenderId)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const body = await req.json();
        const { title, records, totalCharge, totalPayment, companyName, orderIds } = body;

        if (!records || !records.length) {
            return NextResponse.json({ success: false, message: "No records selected" }, { status: 400 });
        }

        const objId = new mongoose.Types.ObjectId(calenderId);
        const calender = await Calender.findById(objId);
        if (!calender) return NextResponse.json({ success: false, message: "Calender not found" }, { status: 404 });

        const count = await SavedInvoice.countDocuments({ entityId: objId, entityType: "calender" });
        const invoiceNumber = `INV-CAL-${Date.now().toString().slice(-4)}-${(count + 1).toString().padStart(4, "0")}`;

        const savedInvoice = await SavedInvoice.create({
            entityId: objId,
            entityType: "calender",
            invoiceNumber,
            title: title || "Saved Invoice",
            companyName: companyName || calender.name,
            orderIds: orderIds || [],
            records,
            totalCharge,
            totalPayment
        });

        for (const record of records) {
            if (record.modelType === "BillingSummary" && record.recordId) {
                await BillingSummary.findByIdAndUpdate(record.recordId, { isSavedInLedger: true });
            } else if (record.modelType === "Payment" && record.recordId) {
                await Payment.findByIdAndUpdate(record.recordId, { isSavedInLedger: true });
            }
        }

        return NextResponse.json({ success: true, message: "Invoice saved successfully", invoiceId: savedInvoice._id });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req, { params }) {
    try {
        await connectDB();
        const resolvedParams = await params;
        const { calenderId } = resolvedParams;

        if (!mongoose.Types.ObjectId.isValid(calenderId)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const objId = new mongoose.Types.ObjectId(calenderId);

        const invoices = await SavedInvoice.find({ entityId: objId, entityType: "calender" })
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, invoices });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
