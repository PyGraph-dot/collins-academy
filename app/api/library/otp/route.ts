import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Otp from "@/models/Otp";
import Order from "@/models/Order";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
}

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

        await connectDB();

        // 1. Verify they actually own resources before spamming emails
        const safeEmailRegex = new RegExp(`^${escapeRegExp(email)}$`, 'i');
        const hasOrders = await Order.exists({ customerEmail: { $regex: safeEmailRegex }, status: "success" });
        
        if (!hasOrders) {
            return NextResponse.json({ error: "No purchases found for this email address." }, { status: 404 });
        }

        // 2. Generate Secure 6-Digit Code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Save to DB (Overwrite any old codes for this email)
        await Otp.findOneAndUpdate(
            { email: email.toLowerCase() },
            { code, createdAt: new Date() },
            { upsert: true, new: true }
        );

        // 4. Send the Email
        await resend.emails.send({
            from: "Collins Academy <onboarding@resend.dev>", // NOTE: See crucial info at the bottom of this message!
            to: email.toLowerCase(),
            subject: "Your Vault Access Code",
            html: `
                <div style="font-family: sans-serif; max-w: 500px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 12px; background: #ffffff;">
                    <h2 style="color: #111111; margin-bottom: 10px; font-size: 24px;">Academy Vault Login</h2>
                    <p style="color: #555555; font-size: 15px; line-height: 1.5;">Enter the secure access code below to unlock your digital library. For your security, this code expires in 10 minutes.</p>
                    <div style="background: #f9f9f9; padding: 24px; text-align: center; border-radius: 8px; margin: 30px 0; border: 1px dashed #cccccc;">
                        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #d4af37;">${code}</span>
                    </div>
                    <p style="color: #888888; font-size: 12px;">If you did not request this code, please ignore this email. Your Vault remains secure.</p>
                </div>
            `
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("OTP Generation Error:", error);
        return NextResponse.json({ error: "Failed to send access code. Please try again." }, { status: 500 });
    }
}