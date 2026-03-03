import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LedgerSnapshot from "@/models/LedgerSnapshot";
import mongoose from "mongoose";

export async function GET(req, { params }) {
    try {
        await connectDB();
        const { calenderId, snapshotId } = await params;

        if (!mongoose.Types.ObjectId.isValid(calenderId) || !mongoose.Types.ObjectId.isValid(snapshotId)) {
            return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
        }

        const snapshot = await LedgerSnapshot.findOne({
            _id: new mongoose.Types.ObjectId(snapshotId),
            entityId: new mongoose.Types.ObjectId(calenderId),
            entityType: "calender",
        });

        if (!snapshot) {
            return NextResponse.json({ success: false, message: "Snapshot not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, snapshot });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
