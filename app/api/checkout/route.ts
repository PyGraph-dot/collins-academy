import { NextResponse } from "next/server";
import Order from "@/models/Order"; 
import connectDB from "@/lib/db";

const CURRENT_MARKET_RATE = 1700; 

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

function getExchangeRate(currency: string) {
  if (currency === "USD") return CURRENT_MARKET_RATE;
  return 1; 
}

function calculateDynamicTotal(amount: number, currency: string) {
  let effectiveAmount = amount;
  if (currency === "USD") {
     effectiveAmount = amount * CURRENT_MARKET_RATE;
  }

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

    const cleanEmail = email.trim().toLowerCase();
    await connectDB();

    // === NEW: BULLETPROOF DUPLICATE INTERCEPTOR ===
    const cartProductIds = items.map((i: any) => i._id);
    const safeEmailRegex = new RegExp(`^${escapeRegExp(cleanEmail)}$`, 'i');

    const existingOrders = await Order.find({
        customerEmail: { $regex: safeEmailRegex },
        status: "success",
        "items.productId": { $in: cartProductIds }
    });

    if (existingOrders.length > 0) {
        let ownedItemTitle = "an item in your cart";
        
        existingOrders.forEach(order => {
            order.items.forEach((item: any) => {
                if (cartProductIds.includes(item.productId?.toString())) {
                    ownedItemTitle = item.title;
                }
            });
        });

        return NextResponse.json(
            { error: `You already own "${ownedItemTitle}". Please remove it from your cart to continue, or head to your Library Vault to access it.` }, 
            { status: 400 }
        );
    }
    // === END INTERCEPTOR ===

    let revenueAmount = 0;
    items.forEach((item: any) => {
      const price = currency === "NGN" ? item.priceNGN : item.priceUSD;
      revenueAmount += price * (item.quantity || 1);
    });

    const exchangeRateUsed = getExchangeRate(currency);
    const chargeAmountNGN = calculateDynamicTotal(revenueAmount, currency);

    const newOrder = await Order.create({
      customerEmail: cleanEmail,
      customerName: cleanEmail.split("@")[0],
      items: items.map((i: any) => ({
        productId: i._id,
        title: i.title,
        price: currency === "NGN" ? i.priceNGN : i.priceUSD,
        quantity: i.quantity || 1,
      })),
      totalAmount: revenueAmount, 
      currency: currency, 
      exchangeRate: exchangeRateUsed, 
      status: "pending",
    });

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Server Error: Missing Key" }, { status: 500 });
    }

    const paystackUrl = "https://api.paystack.co/transaction/initialize";
    const payload = {
      email: cleanEmail,
      amount: chargeAmountNGN * 100, 
      currency: "NGN", 
      callback_url: `${process.env.NEXTAUTH_URL}/success`,
      metadata: {
        orderId: newOrder._id.toString(),
        originalCurrency: currency,
        cart_ids: cartProductIds 
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