import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import BillingSummary from "@/models/BillingSummary";
import Payment from "@/models/Payment";
import Dyeing from "@/models/Dyeing";
import LedgerSnapshot from "@/models/LedgerSnapshot";
import mongoose from "mongoose";

export async function POST(req, { params }) {
    try {
        await connectDB();
        const resolvedParams = await params;
        const { dyeingId } = resolvedParams;

        if (!mongoose.Types.ObjectId.isValid(dyeingId)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const { title } = await req.json();
        if (!title?.trim()) {
            return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
        }

        const objId = new mongoose.Types.ObjectId(dyeingId);
        const now = new Date();

        const latestSnapshot = await LedgerSnapshot.findOne(
            { entityId: objId, entityType: "dyeing" },
            { closedAt: 1, finalBalance: 1 }
        ).sort({ closedAt: -1 });

        const fromDate = latestSnapshot ? latestSnapshot.closedAt : new Date(0);
        // Opening balance = previous closing balance (carry-forward)
        const openingBalance = latestSnapshot ? latestSnapshot.finalBalance : 0;

        const [dyeing, billings, payments] = await Promise.all([
            Dyeing.findById(objId),
            BillingSummary.find({ dyeingId: objId, summaryType: "dyeing", createdAt: { $gt: fromDate } }).sort({ createdAt: 1 }),
            Payment.find({ dyeingId: objId, createdAt: { $gt: fromDate } }).sort({ date: 1 }),
        ]);

        if (!dyeing) return NextResponse.json({ success: false, message: "Dyeing not found" }, { status: 404 });

        // Either this ledger has new billing/payment activity, OR we are just closing it to archive the `initialAmount`
        const hasInitial = (dyeing.initialCharge > 0 || dyeing.initialPayment > 0);

        if (!billings.length && !payments.length && !hasInitial) {
            return NextResponse.json({ success: false, message: "কোনো data নেই close করার জন্য" }, { status: 400 });
        }

        const combined = [
            ...billings.map(b => ({
                date: b.createdAt, provider: "DYEING BILL",
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

        // Balance starts from openingBalance AND Initial Amounts (if applicable)
        const initialCharge = dyeing.initialCharge || 0;
        const initialPayment = dyeing.initialPayment || 0;
        const initialDate = dyeing.initialDate || null;

        let bal = openingBalance + initialPayment - initialCharge;
        const ledgerData = combined.map(item => {
            bal += item.payment - item.charge;
            return { ...item, balance: bal };
        });

        const totalCharge = ledgerData.reduce((s, r) => s + r.charge, 0);
        const totalPayment = ledgerData.reduce((s, r) => s + r.payment, 0);
        const finalBalance = openingBalance + initialPayment - initialCharge + totalPayment - totalCharge;

        const snapshot = await LedgerSnapshot.create({
            entityId: objId, entityType: "dyeing",
            title: title.trim(), fromDate, closedAt: now,
            ledgerData, totalCharge, totalPayment,
            finalBalance,
            openingBalance,
            initialCharge,
            initialPayment,
            initialDate,
        });

        // Wipe initial info from actual entity so it isn't carried double into next snapshot
        await Dyeing.findByIdAndUpdate(objId, { initialCharge: 0, initialPayment: 0, initialDate: null });

        return NextResponse.json({ success: true, message: "Dyeing Ledger closed successfully", snapshotId: snapshot._id });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
