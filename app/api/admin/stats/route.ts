import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectDB();

    // 1. Count Total Products
    const totalProducts = await Product.countDocuments({});
    
    // 2. Count Total Orders (Success only)
    const totalOrders = await Order.countDocuments({ status: "success" });

    // 3. Calculate Total Revenue (Sum of all successful orders)
    // We use MongoDB Aggregation to sum the 'totalAmount' field
    const revenueStats = await Order.aggregate([
      { $match: { status: "success" } }, // Filter only successful
      { $group: { _id: null, total: { $sum: "$totalAmount" } } } // Sum the totalAmount
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;

    return NextResponse.json({
      totalProducts,
      totalRevenue, // <--- This replaced activeProducts
      totalOrders,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}