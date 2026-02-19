import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product"; 
import Otp from "@/models/Otp"; // NEW: Import OTP Model

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json(); // NEW: Expect the code

    // NEW: Strict Gateway
    if (!email || typeof email !== 'string' || !code) {
      return NextResponse.json({ error: "Email and access code are required" }, { status: 400 });
    }

    await connectDB();

    // === NEW: OTP VERIFICATION INTERCEPTOR ===
    const validOtp = await Otp.findOne({ email: email.toLowerCase(), code: code });
    
    if (!validOtp) {
        return NextResponse.json({ error: "Invalid or expired access code." }, { status: 401 });
    }

    // Burn the OTP so it can never be used twice
    await Otp.deleteOne({ _id: validOtp._id });
    // =========================================

    const safeEmailRegex = new RegExp(`^${escapeRegExp(email)}$`, 'i');

    const orders = await Order.find({ 
        customerEmail: { $regex: safeEmailRegex }, 
        status: "success" 
    })
    .sort({ createdAt: -1 })
    .populate({
        path: "items.productId",
        model: Product,
        // THE FIX: Added productType to the selection
        select: "title image fileUrl productType" 
    });

    const books: any[] = [];
    const seenIds = new Set();

    orders.forEach((order) => {
        order.items.forEach((item: any) => {
            if (item.productId && !seenIds.has(item.productId._id.toString())) {
                books.push({
                    _id: item.productId._id,
                    title: item.title,
                    image: item.productId.image,
                    fileUrl: item.productId.fileUrl,
                    productType: item.productId.productType, // THE FIX: Map it to the array
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