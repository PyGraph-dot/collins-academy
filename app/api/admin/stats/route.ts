import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectDB();

    // Run all counting queries at the same time for speed
    const [totalProducts, activeProducts, totalOrders] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ isPublished: true }),
      Order.countDocuments({ status: "success" }), // Only count successful orders
    ]);

    return NextResponse.json({
      totalProducts,
      activeProducts,
      totalOrders,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}