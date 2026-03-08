import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: false,
    },
    dyeingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dyeing",
      required: false,
    },

    calenderId: { type: mongoose.Schema.Types.ObjectId, ref: "Calendar", required: false },

    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ["cash", "bank", "bkash", "nagad", "other"],
      default: "cash",
    },
    description: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    isSavedInLedger: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ইন্ডেক্স আপডেট (কুয়েরি ফাস্ট করার জন্য)
paymentSchema.index({ userId: 1, date: -1 });
paymentSchema.index({ dyeingId: 1, date: -1 });
paymentSchema.index({ calenderId: 1, date: -1 });

export default mongoose.models.Payment ||
  mongoose.model("Payment", paymentSchema);
