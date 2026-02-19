import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Product from "@/models/Product";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });
    
    const paystackData = await verifyRes.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    await connectDB();

    const existingOrder = await Order.findOne({ transactionId: reference });
    if (existingOrder) {
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
                fileUrl: product?.fileUrl,
                productType: product?.productType 
             }
          };
        })
      };
      return NextResponse.json({ success: true, order: enrichedOrder });
    }

    const meta = paystackData.data.metadata;
    const cartIds = meta?.cart_ids || [];

    const validIds = Array.isArray(cartIds) 
      ? cartIds.filter((id: string) => mongoose.Types.ObjectId.isValid(id))
      : [];

    if (validIds.length === 0) {
       return NextResponse.json({ error: "No valid products found in transaction" }, { status: 400 });
    }

    const products = await Product.find({ _id: { $in: validIds } });

    if (products.length !== validIds.length) {
       return NextResponse.json({ error: "Product mismatch or invalid ID" }, { status: 400 });
    }

    const paidAmountKobo = paystackData.data.amount;
    const paidCurrency = paystackData.data.currency; 

    const expectedTotal = products.reduce((acc: number, product: any) => {
      const price = paidCurrency === 'NGN' ? product.priceNGN : product.priceUSD;
      return acc + price;
    }, 0);

    const expectedTotalKobo = Math.round(expectedTotal * 100);

    if (Math.abs(paidAmountKobo - expectedTotalKobo) > 50) {
       console.error(`🚨 FRAUD DETECTED: Paid ${paidAmountKobo}, Expected ${expectedTotalKobo}`);
       return NextResponse.json({ error: "Payment amount mismatch. Order rejected." }, { status: 400 });
    }

    const newOrder = await Order.create({
      customerName: paystackData.data.customer.email.split("@")[0], 
      customerEmail: paystackData.data.customer.email,
      transactionId: reference,
      totalAmount: paidAmountKobo / 100, 
      currency: paidCurrency,
      status: "success",
      items: products.map((p: any) => ({
        productId: p._id,
        title: p.title,
        price: paidCurrency === 'NGN' ? p.priceNGN : p.priceUSD, 
        quantity: 1
      }))
    });

    // === NEW: THE ALGORITHM UPDATER ===
    // Increment the salesCount for all products in this successful order
    await Product.updateMany(
        { _id: { $in: validIds } },
        { $inc: { salesCount: 1 } }
    );
    // ==================================

    const orderResponse = {
        _id: newOrder._id,
        customerEmail: newOrder.customerEmail,
        transactionId: newOrder.transactionId,
        items: products.map((p: any) => ({
            title: p.title,
            productId: {
                image: p.image,
                fileUrl: p.fileUrl,
                productType: p.productType 
            }
        }))
    };

    return NextResponse.json({ success: true, order: orderResponse });

  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}