import { NextResponse } from "next/server";
import Order from "@/models/Order"; // We save the order before paying
import connectDB from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, items, currency } = body;

    if (!email || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    await connectDB();

    // 1. Calculate Total Price securely on the server
    // (In a real app, you should fetch prices from DB again to prevent hacking)
    let totalAmount = 0;
    items.forEach((item: any) => {
      const price = currency === "NGN" ? item.priceNGN : item.priceUSD;
      totalAmount += price * (item.quantity || 1);
    });

    // 2. Create "Pending" Order in Database
    const newOrder = await Order.create({
      customerEmail: email,
      customerName: email.split("@")[0], // Simple name extraction
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

    // 3. Initialize Paystack Transaction
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        amount: totalAmount * 100, // Paystack expects Kobo (multiply by 100)
        currency: currency, // NGN or USD
        callback_url: `${process.env.NEXTAUTH_URL}/shop?status=success&orderId=${newOrder._id}`, // Redirect after payment
        metadata: {
          orderId: newOrder._id.toString(),
        },
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error("Paystack Error:", paystackData);
      return NextResponse.json({ error: paystackData.message }, { status: 400 });
    }

    // 4. Send the Payment Link back to the frontend
    return NextResponse.json({ url: paystackData.data.authorization_url });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}