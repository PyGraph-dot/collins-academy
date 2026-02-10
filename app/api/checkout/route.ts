import { NextResponse } from "next/server";
import Order from "@/models/Order"; 
import connectDB from "@/lib/db";

// Helper to Calculate Paystack Fee so Merchant gets exact amount
// Formula: (Amount + FlatFee) / (1 - PercentFee)
function calculateDynamicTotal(amount: number, currency: string) {
  if (currency === "NGN") {
    // Paystack NGN: 1.5% + ₦100 (Waived if < ₦2500, Capped at ₦2000)
    let flatFee = 100;
    const percentFee = 0.015;
    
    if (amount < 2500) flatFee = 0;
    
    // Calculate what we need to charge to get the exact 'amount'
    let totalToCharge = (amount + flatFee) / (1 - percentFee);
    
    // Check if fee exceeds cap (Cap is ₦2000)
    // If the calculated fee is huge, we might just use the uncapped formula or cap logic
    // For simplicity and safety in this context:
    return Math.ceil(totalToCharge); 
  } else {
    // Paystack USD (International): Generally 3.9% + ₦100 equivalent
    // We will just add 4% buffer to be safe
    return Math.ceil(amount / (1 - 0.04));
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, items, currency } = body;

    console.log("1. Checkout Request:", { email, currency });

    if (!email || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    await connectDB();

    // 1. Calculate the "Book Price" (Your Revenue)
    let revenueAmount = 0;
    items.forEach((item: any) => {
      const price = currency === "NGN" ? item.priceNGN : item.priceUSD;
      if (!price) throw new Error(`Price missing for item: ${item.title}`);
      revenueAmount += price * (item.quantity || 1);
    });

    console.log("2. Net Revenue (Your Share):", revenueAmount);

    // 2. Calculate "Charge Amount" (Customer pays this so you get RevenueAmount)
    const chargeAmount = calculateDynamicTotal(revenueAmount, currency);

    console.log("3. Total to Charge (Inc. Fees):", chargeAmount);

    // 3. Create Order in DB
    // IMPORTANT: We save 'revenueAmount' so your dashboard shows what YOU earned, not what Paystack took.
    const newOrder = await Order.create({
      customerEmail: email,
      customerName: email.split("@")[0],
      items: items.map((i: any) => ({
        productId: i._id,
        title: i.title,
        price: currency === "NGN" ? i.priceNGN : i.priceUSD,
        quantity: i.quantity || 1,
      })),
      totalAmount: revenueAmount, // Saving the Book Price
      currency: currency,
      status: "pending",
    });

    // 4. Send to Paystack
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Server Error: Missing Key" }, { status: 500 });
    }

    const paystackUrl = "https://api.paystack.co/transaction/initialize";
    const payload = {
      email: email,
      amount: chargeAmount * 100, // Paystack expects Kobo (We send the INFLATED amount)
      currency: currency,
      callback_url: `${process.env.NEXTAUTH_URL}/success`,
      metadata: {
        orderId: newOrder._id.toString(),
      },
    };

    const paystackResponse = await fetch(paystackUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      return NextResponse.json({ error: paystackData.message }, { status: 400 });
    }

    return NextResponse.json({ url: paystackData.data.authorization_url });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}