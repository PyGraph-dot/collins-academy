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

    // 2. Check for Duplicate Order (Idempotency)
    const existingOrder = await Order.findOne({ transactionId: reference });
    
    if (existingOrder) {
      // Re-populate product details for the UI
      const itemIds = existingOrder.items.map((i: any) => i.productId);
      const products = await Product.find({ _id: { $in: itemIds } });

      const enrichedOrder = {
        ...existingOrder.toObject(),
        items: existingOrder.items.map((item: any) => {
          const product = products.find((p: any) => p._id.toString() === item.productId.toString());
          return {
             ...item,
             title: product?.title || item.title,
             productId: {
                image: product?.image,
                fileUrl: product?.fileUrl
             }
          };
        })
      };
      return NextResponse.json({ success: true, order: enrichedOrder });
    }

    // 3. Prepare New Order Data
    const meta = paystackData.data.metadata;
    const cartIds = meta?.cart_ids || [];

    if (!cartIds.length) {
       return NextResponse.json({ error: "No products found in transaction" }, { status: 400 });
    }

    const products = await Product.find({ _id: { $in: cartIds } });

    // Determine Currency & Price
    const currency = paystackData.data.currency; // NGN or USD

    // 4. Create Order (FIXED FIELDS HERE)
    const newOrder = await Order.create({
      // REQUIRED FIELD 1: customerName
      // Fallback: Use the part of the email before the "@" since we don't ask for a name
      customerName: paystackData.data.customer.email.split("@")[0],
      
      customerEmail: paystackData.data.customer.email,
      
      transactionId: reference,
      
      // REQUIRED FIELD 2: totalAmount (DB expects 'totalAmount', not 'amount')
      totalAmount: paystackData.data.amount / 100, 
      
      currency: currency,
      
      status: "success", // Matches your schema comment "pending, success, failed"
      
      items: products.map((p: any) => ({
        productId: p._id,
        title: p.title,
        // Dynamically choose the correct price based on the currency paid
        price: currency === 'NGN' ? p.priceNGN : p.priceUSD, 
        quantity: 1
      }))
    });

    // 5. Format Response
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
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
