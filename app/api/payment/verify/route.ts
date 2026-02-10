import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Product from "@/models/Product"; // We need this to get the file URL
import connectDB from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  try {
    await connectDB();

    // 1. Ask Paystack if the transaction is valid
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json({ error: "Payment not verified" }, { status: 400 });
    }

    // 2. Payment is Real! Find the order associated with this email/amount
    // (In a perfect world, we passed orderId in metadata, let's use that)
    const orderId = verifyData.data.metadata?.orderId;
    
    if (orderId) {
        // 3. Update Order to "success" and save the Paystack Reference
        const order = await Order.findByIdAndUpdate(
            orderId, 
            { status: "success", transactionId: reference },
            { new: true }
        ).populate({
            path: 'items.productId',
            model: Product,
            select: 'fileUrl title image' // Get the file URL securely
        });

        return NextResponse.json({ success: true, order });
    }

    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}