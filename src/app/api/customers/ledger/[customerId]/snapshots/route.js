import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LedgerSnapshot from "@/models/LedgerSnapshot";
import mongoose from "mongoose";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { customerId } = await params;

        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const snapshots = await LedgerSnapshot.find(
            { entityId: new mongoose.Types.ObjectId(customerId), entityType: "customer" },
            { title: 1, closedAt: 1, totalCharge: 1, totalPayment: 1, finalBalance: 1 }
        ).sort({ closedAt: -1 });

        return NextResponse.json({ success: true, snapshots });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
