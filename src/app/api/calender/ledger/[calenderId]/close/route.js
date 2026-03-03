import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BillingSummary from "@/models/BillingSummary";
import Payment from "@/models/Payment";
import Calender from "@/models/Calender";
import LedgerSnapshot from "@/models/LedgerSnapshot";
import mongoose from "mongoose";

export async function POST(req, { params }) {
    try {
        await connectDB();
        const resolvedParams = await params;
        const { calenderId } = resolvedParams;

        if (!mongoose.Types.ObjectId.isValid(calenderId)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const { title } = await req.json();
        if (!title?.trim()) {
            return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
        }

        const objId = new mongoose.Types.ObjectId(calenderId);
        const now = new Date();

        const latestSnapshot = await LedgerSnapshot.findOne(
            { entityId: objId, entityType: "calender" },
            { closedAt: 1, finalBalance: 1 }
        ).sort({ closedAt: -1 });

        const fromDate = latestSnapshot ? latestSnapshot.closedAt : new Date(0);
        // Opening balance = previous closing balance (carry-forward)
        const openingBalance = latestSnapshot ? latestSnapshot.finalBalance : 0;

        const [calender, billings, payments] = await Promise.all([
            Calender.findById(objId),
            BillingSummary.find({ calenderId: objId, summaryType: "calender", createdAt: { $gt: fromDate } }).sort({ createdAt: 1 }),
            Payment.find({ calenderId: objId, date: { $gt: fromDate } }).sort({ date: 1 }),
        ]);

        if (!calender) return NextResponse.json({ success: false, message: "Calender not found" }, { status: 404 });
        if (!billings.length && !payments.length) {
            return NextResponse.json({ success: false, message: "কোনো data নেই close করার জন্য" }, { status: 400 });
        }

        const combined = [
            ...billings.map(b => ({
                date: b.createdAt, provider: "CALENDER BILL",
                description: `Invoice: ${b.invoiceNumber}`,
                qty: b.totalQty, price: b.price, charge: b.total, payment: 0, type: "debit", colour: b.colour,
            })),
            ...payments.map(p => ({
                date: p.date, provider: p.method.toUpperCase(),
                description: p.description || "Payment Received",
                charge: 0, payment: p.amount, type: "credit",
            })),
        ];

        combined.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Balance starts from openingBalance (carry-forward from previous period)
        let bal = openingBalance;
        const ledgerData = combined.map(item => {
            bal += item.payment - item.charge;
            return { ...item, balance: bal };
        });

        const totalCharge = ledgerData.reduce((s, r) => s + r.charge, 0);
        const totalPayment = ledgerData.reduce((s, r) => s + r.payment, 0);
        const finalBalance = openingBalance + totalPayment - totalCharge;

        const snapshot = await LedgerSnapshot.create({
            entityId: objId, entityType: "calender",
            title: title.trim(), fromDate, closedAt: now,
            ledgerData, totalCharge, totalPayment,
            finalBalance,
            openingBalance,
        });

        return NextResponse.json({ success: true, message: "Calender Ledger closed successfully", snapshotId: snapshot._id });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
