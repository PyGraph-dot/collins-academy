import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Product from "@/models/Product";
import connectDB from "@/lib/db";

/**
 * VERIFICATION API
 * 
 * This is the brains of the new payment flow:
 * 1. User pays on frontend (via Paystack)
 * 2. We verify the payment here with Paystack
 * 3. We extract the cart_ids from metadata
 * 4. We fetch those products and create the order
 * 5. Success page queries this to show order details
 */

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference parameter" },
        { status: 400 }
      );
    }

    // Step 1: Verify with Paystack
    const paystackVerifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
    const paystackResponse = await fetch(paystackVerifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const paystackData = await paystackResponse.json();

    // Safety check: Make sure payment was successful
    if (!paystackData.status || !paystackData.data) {
      console.error("Paystack verification failed:", paystackData);
      return NextResponse.json(
        { error: "Payment verification failed", details: paystackData.message },
        { status: 400 }
      );
    }

    const transaction = paystackData.data;

    // Safety check: Payment status must be "success"
    if (transaction.status !== "success") {
      return NextResponse.json(
        { error: `Payment status is ${transaction.status}, not success` },
        { status: 400 }
      );
    }

    // Step 2: Extract metadata
    const cartIds = transaction.metadata?.cart_ids || [];
    const email = transaction.customer?.email || "unknown@example.com";

    if (cartIds.length === 0) {
      return NextResponse.json(
        { error: "No items found in payment metadata" },
        { status: 400 }
      );
    }

    console.log("2. Payment Verified ✓");
    console.log("   Cart IDs:", cartIds);
    console.log("   Email:", email);

    // Step 3: Connect to DB & fetch products
    await connectDB();

    // Fetch all products that match the cart IDs
    const products = await Product.find({ _id: { $in: cartIds } });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "Products not found in database" },
        { status: 404 }
      );
    }

    console.log("3. Products Found ✓");
    console.log("   Count:", products.length);

    // Step 4: Build order from verified payment + products
    const totalAmount = transaction.amount; // Already in kobo from Paystack
    const currency = transaction.currency || "NGN";

    const orderItems = products.map((product: any) => ({
      productId: product, // Include full product object with fileUrl
      title: product.title,
      price: currency === "NGN" ? product.priceNGN : product.priceUSD,
      quantity: 1, // Each product appears once in this cart
    }));

    // Step 5: Create the order
    const newOrder = await Order.create({
      customerEmail: email,
      customerName: email.split("@")[0],
      items: orderItems,
      totalAmount: totalAmount / 100, // Convert from kobo back to normal units
      currency: currency,
      status: "completed", // Payment was verified, so mark as completed
      transactionId: reference, // Store reference for future lookups
    });

    console.log("4. Order Created ✓");
    console.log("   Order ID:", newOrder._id);

    // Step 6: Return the order so Success Page can display it
    return NextResponse.json({
      success: true,
      message: "Payment verified and order created",
      order: {
        _id: newOrder._id,
        customerEmail: newOrder.customerEmail,
        customerName: newOrder.customerName,
        items: newOrder.items.map((item: any, idx: number) => {
          const product = products[idx];
          return {
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            productId: {
              _id: product._id,
              image: product.image,
              fileUrl: product.fileUrl,
            },
          };
        }),
        totalAmount: newOrder.totalAmount,
        currency: newOrder.currency,
        status: newOrder.status,
        createdAt: newOrder.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Verification Error:", error);
    return NextResponse.json(
      {
        error: "Verification failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}