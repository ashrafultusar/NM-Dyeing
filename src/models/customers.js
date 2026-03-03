import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  ownerName: { type: String, required: true },
  address: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  employeeList: { type: [String], default: [] },
  searchText: { type: String, default: "" },
  initialAmount: { type: Number, default: 0 },
  initialAmountType: { type: String, enum: ["charge", "payment"], default: "charge" },
}, { timestamps: true });


mongoose.models = {};

// export default mongoose.model("Customer", CustomerSchema);
export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);