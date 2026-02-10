import { NextResponse } from "next/server";
import Order from "@/models/Order"; 
import connectDB from "@/lib/db";

// CONFIG: Manual Exchange Rate (Update this if Naira fluctuates wildly)
const USD_TO_NGN_RATE = 1700; 

// Helper to Calculate Paystack Fee so Merchant gets exact amount
function calculateDynamicTotal(amount: number, currency: string) {
  // 1. AUTO-CONVERT: If currency is USD, treat it as NGN for the payment calculation
  let effectiveAmount = amount;
  if (currency === "USD") {
     effectiveAmount = amount * USD_TO_NGN_RATE;
  }

  // 2. Paystack NGN Formula: (Amount + ₦100) / (1 - 1.5%)
  let flatFee = 100;
  const percentFee = 0.015;
  
  if (effectiveAmount < 2500) flatFee = 0;
  
  // Calculate total charge to ensure you get the exact book price
  let totalToCharge = (effectiveAmount + flatFee) / (1 - percentFee);
  
  return Math.ceil(totalToCharge); 
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

    // 1. Calculate Your Revenue (In the Original Currency)
    let revenueAmount = 0;
    items.forEach((item: any) => {
      const price = currency === "NGN" ? item.priceNGN : item.priceUSD;
      if (!price) throw new Error(`Price missing for item: ${item.title}`);
      revenueAmount += price * (item.quantity || 1);
    });

    console.log("2. Net Revenue (Your Share):", revenueAmount, currency);

    // 2. Calculate Charge Amount (Force everything to NGN for payment success)
    const chargeAmountNGN = calculateDynamicTotal(revenueAmount, currency);

    console.log("3. Total to Charge (NGN):", chargeAmountNGN);

    // 3. Create Order in DB
    // We save the order as the ORIGINAL currency (USD/NGN) so your dashboard is accurate.
    const newOrder = await Order.create({
      customerEmail: email,
      customerName: email.split("@")[0],
      items: items.map((i: any) => ({
        productId: i._id,
        title: i.title,
        price: currency === "NGN" ? i.priceNGN : i.priceUSD,
        quantity: i.quantity || 1,
      })),
      totalAmount: revenueAmount, 
      currency: currency, // e.g. "USD"
      status: "pending",
    });

    // 4. Send to Paystack (ALWAYS IN NGN)
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Server Error: Missing Key" }, { status: 500 });
    }

    const paystackUrl = "https://api.paystack.co/transaction/initialize";
    const payload = {
      email: email,
      amount: chargeAmountNGN * 100, // Send the Converted NGN Kobo amount
      currency: "NGN", // <--- FORCE NGN so Paystack doesn't reject it
      callback_url: `${process.env.NEXTAUTH_URL}/success`,
      metadata: {
        orderId: newOrder._id.toString(),
        originalCurrency: currency // Track that they actually wanted to pay USD
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