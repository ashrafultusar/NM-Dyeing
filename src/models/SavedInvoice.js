import mongoose from "mongoose";

const SavedInvoiceRowSchema = new mongoose.Schema(
  {
    recordId: mongoose.Schema.Types.ObjectId,
    modelType: String,
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
    type: { type: String, enum: ["debit", "credit"] },
    clothType: String,
    quality: String,
    colour: String,
    sillName: String,
    finishingType: String,
  },
  { _id: false }
);
 
const SavedInvoiceSchema = new mongoose.Schema(
  {
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    entityType: {
      type: String,
      enum: ["customer", "dyeing", "calender"],
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    orderIds: {
      type: [String],
    },
    records: [SavedInvoiceRowSchema],
    totalCharge: { type: Number, default: 0 },
    totalPayment: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SavedInvoiceSchema.index({ entityId: 1, entityType: 1, createdAt: -1 });

export default mongoose.models.SavedInvoice ||
  mongoose.model("SavedInvoice", SavedInvoiceSchema);
