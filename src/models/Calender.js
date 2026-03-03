import mongoose, { Schema } from "mongoose";

const calenderSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    initialAmount: { type: Number, default: 0 },
    initialAmountType: { type: String, enum: ["charge", "payment"], default: "charge" },
  },
  { timestamps: true }
);

export default mongoose.models.Calender ||
  mongoose.model("Calender", calenderSchema);
