import { NextResponse } from "next/server";
import Order from "@/models/Order"; 
import connectDB from "@/lib/db";

// CONFIG: Manual Exchange Rate
// Expert Tip: We use a manual constant for stability. Free APIs can crash or hit limits.
// Since we save this rate to the DB, changing this number later WON'T break old records.
const CURRENT_MARKET_RATE = 1700; 

function getExchangeRate(currency: string) {
  if (currency === "USD") return CURRENT_MARKET_RATE;
  return 1; // NGN to NGN is always 1
}

// Helper to Calculate Paystack Fee
function calculateDynamicTotal(amount: number, currency: string) {
  let effectiveAmount = amount;
  
  // 1. AUTO-CONVERT using the rate
  if (currency === "USD") {
     effectiveAmount = amount * CURRENT_MARKET_RATE;
  }

  // 2. Paystack NGN Formula
  let flatFee = 100;
  const percentFee = 0.015;
  
  if (effectiveAmount < 2500) flatFee = 0;
  
  let totalToCharge = (effectiveAmount + flatFee) / (1 - percentFee);
  return Math.ceil(totalToCharge); 
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, items, currency } = body;

    if (!email || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    await connectDB();

    // 1. Calculate Your Revenue
    let revenueAmount = 0;
    items.forEach((item: any) => {
      const price = currency === "NGN" ? item.priceNGN : item.priceUSD;
      revenueAmount += price * (item.quantity || 1);
    });

    // 2. Get the Rate & Calculate Charge
    const exchangeRateUsed = getExchangeRate(currency);
    const chargeAmountNGN = calculateDynamicTotal(revenueAmount, currency);

    // 3. Create Order in DB
    // IMPORTANT: We save 'exchangeRateUsed' so we know exactly what the dollar was worth today.
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
      currency: currency, 
      exchangeRate: exchangeRateUsed, // <--- SAVED FOREVER
      status: "pending",
    });

    // 4. Send to Paystack
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Server Error: Missing Key" }, { status: 500 });
    }

    const paystackUrl = "https://api.paystack.co/transaction/initialize";
    const payload = {
      email: email,
      amount: chargeAmountNGN * 100, 
      currency: "NGN", 
      callback_url: `${process.env.NEXTAUTH_URL}/success`,
      metadata: {
        orderId: newOrder._id.toString(),
        originalCurrency: currency 
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