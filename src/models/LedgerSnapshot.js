import mongoose from "mongoose";

const LedgerRowSchema = new mongoose.Schema(
  {
    date: Date,
    provider: String,
    displayOrderId: String,
    companyName: String,
    description: String,
    qty: Number,
    price: Number,
    charge: { type: Number, default: 0 },
    payment: { type: Number, default: 0 },
    balance: Number,
    colour: String,
    type: { type: String, enum: ["debit", "credit"] },
  },
  { _id: false }
);

const LedgerSnapshotSchema = new mongoose.Schema(
  {
    // Generic entity reference — works for Customer, Dyeing, Calender
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["customer", "dyeing", "calender"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Date-range strategy: records within (fromDate, closedAt] belong to this snapshot
    // No mass updates on existing records — zero write amplification
    fromDate: {
      type: Date,
      required: true, // epoch (new Date(0)) if first ever closing
    },
    closedAt: {
      type: Date,
      required: true,
    },

    // Pre-computed snapshot — viewing closed ledger needs zero DB joins
    ledgerData: [LedgerRowSchema],
    totalCharge: { type: Number, default: 0 },
    totalPayment: { type: Number, default: 0 },
    finalBalance: { type: Number, default: 0 },
    openingBalance: { type: Number, default: 0 },
    initialCharge: { type: Number, default: 0 },
    initialPayment: { type: Number, default: 0 },
    initialDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound index for fast lookup of all snapshots for any entity
LedgerSnapshotSchema.index({ entityId: 1, entityType: 1, closedAt: -1 });

export default mongoose.models.LedgerSnapshot ||
  mongoose.model("LedgerSnapshot", LedgerSnapshotSchema);
