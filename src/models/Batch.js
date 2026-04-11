import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    batches: [
      {
        batchName: { type: String, required: true },
        status: { type: String, default: "pending" },

        customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
        dyeingId: { type: mongoose.Schema.Types.ObjectId, ref: "Dyeing" },
        calenderId: { type: mongoose.Schema.Types.ObjectId, ref: "Calender" },

        rows: [
          {
            rollNo: Number,
            goj: Number,
            idx: [Number],
            extraInputs: [String],
          },
        ],

        selectedProcesses: [
          {
            name: String,
            price: Number,
          },
        ],

        colour: { type: String, required: true },
        quality: { type: String },
        sillName: { type: String, required: true },
        clotheType: { type: String },
        finishingType: { type: String, required: true },
        dyeing: { type: String, required: true },
        calender: { type: String },
        note: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

const Batch = mongoose.models.Batch || mongoose.model("Batch", batchSchema);
export default Batch;
