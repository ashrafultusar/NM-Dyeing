import mongoose, { Schema } from "mongoose";

const calenderSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    initialCharge: { type: Number, default: 0 },
    initialPayment: { type: Number, default: 0 },
    initialDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Calender ||
  mongoose.model("Calender", calenderSchema);
