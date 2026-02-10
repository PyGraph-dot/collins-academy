import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product"; // Required for population

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    // Find all successful orders for this email
    const orders = await Order.find({ 
        customerEmail: { $regex: new RegExp(`^${email}$`, 'i') }, // Case-insensitive match
        status: "success" 
    })
    .sort({ createdAt: -1 }) // Newest first
    .populate({
        path: "items.productId",
        model: Product,
        select: "title image fileUrl"
    });

    // Flatten the list: We just want a list of books, not a list of orders
    const books: any[] = [];
    const seenIds = new Set(); // Avoid duplicates if they bought the same book twice

    orders.forEach((order) => {
        order.items.forEach((item: any) => {
            if (item.productId && !seenIds.has(item.productId._id.toString())) {
                books.push({
                    _id: item.productId._id,
                    title: item.title,
                    image: item.productId.image,
                    fileUrl: item.productId.fileUrl,
                    purchasedDate: order.createdAt
                });
                seenIds.add(item.productId._id.toString());
            }
        });
    });

    return NextResponse.json({ books });

  } catch (error) {
    console.error("Library Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch library" }, { status: 500 });
  }
}