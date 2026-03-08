import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import SavedInvoice from "@/models/SavedInvoice";
import BillingSummary from "@/models/BillingSummary";
import Payment from "@/models/Payment";
import customers from "@/models/customers";
import mongoose from "mongoose";

export async function POST(req, { params }) {
    try {
        await connectDB();
        const resolvedParams = await params;
        const { customerId } = resolvedParams;

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const body = await req.json();
        const { title, records, totalCharge, totalPayment, companyName, orderIds } = body;

        if (!records || !records.length) {
            return NextResponse.json({ success: false, message: "No records selected" }, { status: 400 });
        }

        const objId = new mongoose.Types.ObjectId(customerId);
        const customer = await customers.findById(objId);
        if (!customer) return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 });

        const count = await SavedInvoice.countDocuments({ entityId: objId, entityType: "customer" });
        const invoiceNumber = `INV-CUS-${customer.customerId || Date.now().toString().slice(-4)}-${(count + 1).toString().padStart(4, "0")}`;

        const savedInvoice = await SavedInvoice.create({
            entityId: objId,
            entityType: "customer",
            invoiceNumber,
            title: title || "Saved Invoice",
            companyName: companyName || customer.companyName,
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
        const { customerId } = resolvedParams;

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const objId = new mongoose.Types.ObjectId(customerId);

        const invoices = await SavedInvoice.find({ entityId: objId, entityType: "customer" })
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, invoices });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
