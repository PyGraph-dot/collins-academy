import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";

export async function GET() {
  try {
    await connectDB();

    const [totalProducts, totalOrders] = await Promise.all([
      Product.countDocuments({}),
      Order.countDocuments({ status: "success" }),
    ]);

    // Calculate Revenue using the SAVED exchange rate for each order
    const revenueStats = await Order.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: [
                "$totalAmount",
                {
                   // Logic: Use the saved 'exchangeRate'. 
                   // If it's missing (for old orders), check currency:
                   // IF USD -> Use 1700. IF NGN -> Use 1.
                   $ifNull: [ 
                     "$exchangeRate", 
                     { 
                       $cond: { if: { $eq: ["$currency", "USD"] }, then: 1700, else: 1 }
                     }
                   ] 
                }
              ]
            }
          }
        }
      }
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].total : 0;

    return NextResponse.json({
      totalProducts,
      totalRevenue, 
      totalOrders,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}