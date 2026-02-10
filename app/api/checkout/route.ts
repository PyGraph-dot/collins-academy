import { NextResponse } from "next/server";
import Order from "@/models/Order"; 
import connectDB from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, items, currency } = body;

    // Log what we received (for debugging)
    console.log("1. Checkout Request Received:", { email, itemCount: items?.length, currency });

    if (!email || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    await connectDB();

    // Calculate Total
    let totalAmount = 0;
    items.forEach((item: any) => {
      const price = currency === "NGN" ? item.priceNGN : item.priceUSD;
      if (!price) throw new Error(`Price missing for item: ${item.title}`);
      totalAmount += price * (item.quantity || 1);
    });

    console.log("2. Total Calculated:", totalAmount);

    // Create Order
    const newOrder = await Order.create({
      customerEmail: email,
      customerName: email.split("@")[0],
      items: items.map((i: any) => ({
        productId: i._id,
        title: i.title,
        price: currency === "NGN" ? i.priceNGN : i.priceUSD,
        quantity: i.quantity || 1,
      })),
      totalAmount: totalAmount,
      currency: currency,
      status: "pending",
    });

    console.log("3. Order Created in DB:", newOrder._id);

    // Verify Key Exists
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error("CRITICAL: PAYSTACK_SECRET_KEY is missing in Vercel!");
      return NextResponse.json({ error: "Server Configuration Error: Missing Payment Key" }, { status: 500 });
    }

    // Initialize Paystack
    const paystackUrl = "https://api.paystack.co/transaction/initialize";
    const payload = {
      email: email,
      amount: totalAmount * 100, // Kobo
      currency: currency,
      callback_url: `${process.env.NEXTAUTH_URL}/shop?status=success&orderId=${newOrder._id}`,
      metadata: {
        orderId: newOrder._id.toString(),
      },
    };

    console.log("4. Sending to Paystack:", JSON.stringify(payload));

    const paystackResponse = await fetch(paystackUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const paystackData = await paystackResponse.json();

    // Log the EXACT response from Paystack
    console.log("5. Paystack Response:", paystackData);

    if (!paystackData.status) {
      // Send the actual Paystack message to the frontend
      return NextResponse.json({ error: paystackData.message }, { status: 400 });
    }

    return NextResponse.json({ url: paystackData.data.authorization_url });

  } catch (error: any) {
    console.error("Checkout System Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}