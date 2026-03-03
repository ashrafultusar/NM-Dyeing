import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  designation: { type: String, required: true },
  info: { type: String },
});

const DyeingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    employees: [EmployeeSchema],
    initialAmount: { type: Number, default: 0 },
    initialAmountType: { type: String, enum: ["charge", "payment"], default: "charge" },
  },
  { timestamps: true }
);

export default mongoose.models.Dyeing || mongoose.model("Dyeing", DyeingSchema);
