import mongoose from "mongoose";

const BillingSummarySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    displayOrderId: { type: String },
    companyName: { type: String, required: true },
    invoiceNumber: { type: String, required: true },

    summaryType: {
      type: String,
      enum: ["client", "dyeing", "calender"],
      required: true,
    },

    price: { type: Number, required: true },
    total: { type: Number, required: true },
    totalQty: { type: Number, required: true },
    batchName: { type: String, required: true },

    colour: String,
    sillName: String,
    finishingType: String,

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    dyeing: String,
    dyeingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dyeing",
    },

    calender: String,
    calenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Calender",
    },
  },
  { timestamps: true }
);

/* 🔐 HARD DUPLICATE PROTECTION */
BillingSummarySchema.index(
  { invoiceNumber: 1, summaryType: 1 },
  { unique: true }
);

export default mongoose.models.BillingSummary ||
  mongoose.model("BillingSummary", BillingSummarySchema);
