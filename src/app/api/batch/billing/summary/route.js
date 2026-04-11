import connectDB from "@/lib/db";
import BillingSummary from "@/models/BillingSummary";

export async function POST(req) {
  await connectDB();

  try {
    const body = await req.json();

    const summary = await BillingSummary.create(body);

    return Response.json({ success: true, data: summary }, { status: 201 });
  } catch (error) {
    // 🔐 Duplicate key error 
    if (error.code === 11000) {
      return Response.json(
        { success: false, error: "Already saved" },
        { status: 409 }
      );
    }
    console.error(error);
    return Response.json(
      { success: false, error: "Failed to save billing summary" },
      { status: 500 }
    );
  }
}
