import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product"; 
import Otp from "@/models/Otp";
import Session from "@/models/Session";

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

export async function POST(req: Request) {
  try {
    let { email, code, token } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // THE FIX: Bulletproof Sanitization (Removes ghost spaces and capital letters)
    const cleanEmail = email.trim().toLowerCase();

    await connectDB();
    let generatedToken = null;

    // === PATH A: AUTO-LOGIN VIA VAULT PASS (TOKEN) ===
    if (token) {
        const validSession = await Session.findOne({ email: cleanEmail, token: token });
        if (!validSession) {
            return NextResponse.json({ error: "Session expired. Please log in again." }, { status: 401 });
        }
    } 
    // === PATH B: MANUAL LOGIN VIA OTP CODE ===
    else if (code) {
        const validOtp = await Otp.findOne({ email: cleanEmail, code: code });
        if (!validOtp) {
            return NextResponse.json({ error: "Invalid or expired access code." }, { status: 401 });
        }
        
        // Burn the OTP so it can't be reused
        await Otp.deleteOne({ _id: validOtp._id });

        // THE FIX: Use Web Crypto API (Vercel-Safe) to generate the 30-day token
        generatedToken = crypto.randomUUID() + "-" + Date.now().toString(36);
        await Session.create({ email: cleanEmail, token: generatedToken });
    } 
    // === NO AUTH PROVIDED ===
    else {
        return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // === FETCH THE VAULT ===
    const safeEmailRegex = new RegExp(`^${escapeRegExp(cleanEmail)}$`, 'i');
    const orders = await Order.find({ 
        customerEmail: { $regex: safeEmailRegex }, 
        status: "success" 
    })
    .sort({ createdAt: -1 })
    .populate({
        path: "items.productId",
        model: Product,
        select: "title image fileUrl productType previewUrl" 
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
                    productType: item.productId.productType, 
                    purchasedDate: order.createdAt
                });
                seenIds.add(item.productId._id.toString());
            }
        });
    });

    return NextResponse.json({ books, token: generatedToken });

  } catch (error) {
    console.error("Library Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch library" }, { status: 500 });
  }
}