import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Product from "@/models/Product";
import connectDB from "@/lib/db";

export const dynamic = 'force-dynamic'; // Prevent caching issues

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    // 1. Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    
    const paystackData = await verifyRes.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    await connectDB();

    // --- CRITICAL FIX: Check if Order Already Exists ---
    // This prevents the "Server Error" when the page is refreshed
    const existingOrder = await Order.findOne({ transactionId: reference });
    
    if (existingOrder) {
      console.log("Order already exists, returning it.");
      
      // We need to fetch product details again to populate the response for the UI
      const itemIds = existingOrder.items.map((i: any) => i.productId);
      const products = await Product.find({ _id: { $in: itemIds } });

      const enrichedOrder = {
        ...existingOrder.toObject(),
        items: existingOrder.items.map((item: any) => {
          const product = products.find((p: any) => p._id.toString() === item.productId.toString());
          return {
             ...item,
             title: product?.title || item.title, // Fallback to item title
             productId: {
                image: product?.image,
                fileUrl: product?.fileUrl
             }
          };
        })
      };
      
      return NextResponse.json({ success: true, order: enrichedOrder });
    }

    // --- Create New Order (Only if it doesn't exist) ---
    const meta = paystackData.data.metadata;
    const cartIds = meta?.cart_ids || [];

    if (!cartIds.length) {
       return NextResponse.json({ error: "No products found in transaction" }, { status: 400 });
    }

    const products = await Product.find({ _id: { $in: cartIds } });

    // Create the Order
    const newOrder = await Order.create({
      customerEmail: paystackData.data.customer.email,
      transactionId: reference,
      amount: paystackData.data.amount / 100, // Convert kobo to currency
      currency: paystackData.data.currency,
      status: "completed",
      items: products.map((p: any) => ({
        productId: p._id, // Use the ID, not the whole object
        title: p.title,
        price: p.priceUSD, // Or logic for NGN
        quantity: 1
      }))
    });

    // Format response for the frontend
    const orderResponse = {
        _id: newOrder._id,
        customerEmail: newOrder.customerEmail,
        transactionId: newOrder.transactionId,
        items: products.map((p: any) => ({
            title: p.title,
            productId: {
                image: p.image,
                fileUrl: p.fileUrl
            }
        }))
    };

    return NextResponse.json({ success: true, order: orderResponse });

  } catch (error: any) {
    console.error("Verification Server Error:", error);
    // Return the actual error message for debugging
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}