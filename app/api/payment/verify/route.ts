import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Product from "@/models/Product";
import connectDB from "@/lib/db";

export const dynamic = 'force-dynamic'; // Ensure this route is never cached

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ success: false, error: "Missing reference" }, { status: 400 });
    }

    // 1. Verify with Paystack
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    
    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
    }

    await connectDB();

    // 2. Check for Duplicate Order
    const existingOrder = await Order.findOne({ transactionId: reference });
    if (existingOrder) {
      // If order exists, fetch full details to return to success page
      const populatedOrder = await Order.findById(existingOrder._id);
      // We manually fetch products to populate item details for the frontend
      const itemIds = existingOrder.items.map((i: any) => i.productId);
      const products = await Product.find({ _id: { $in: itemIds } });
      
      const enrichedOrder = {
        ...populatedOrder.toObject(),
        items: populatedOrder.items.map((item: any) => {
          const product = products.find((p: any) => p._id.toString() === item.productId.toString());
          return {
             ...item,
             productId: product || null // Ensure product details are attached
          };
        })
      };

      return NextResponse.json({ success: true, order: enrichedOrder });
    }

    // 3. New Order Logic
    const meta = paystackData.data.metadata;
    const cartIds = meta?.cart_ids || [];

    if (!cartIds.length) {
       return NextResponse.json({ success: false, error: "No products in metadata" }, { status: 400 });
    }

    // Fetch Products
    const products = await Product.find({ _id: { $in: cartIds } });

    // Create Order
    const newOrder = await Order.create({
      customerEmail: paystackData.data.customer.email,
      transactionId: reference,
      amount: paystackData.data.amount / 100,
      currency: paystackData.data.currency,
      status: "completed",
      items: products.map((p: any) => ({
        productId: p._id,
        title: p.title,
        price: p.priceUSD, // Defaulting to USD price for record, or check currency
        quantity: 1
      }))
    });

    // 4. Return Enriched Order for Success Page
    // We construct the response manually to ensure the Success Page has image/fileUrl
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
    console.error("Verification Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}