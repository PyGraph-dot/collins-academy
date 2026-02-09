import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  await connectDB();

  // Check if admin already exists
  const existingUser = await User.findOne({ email: "admin@collins.com" });
  if (existingUser) {
    return NextResponse.json({ message: "Admin already exists" });
  }

  // Create Admin User
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  await User.create({
    email: "admin@collins.com",
    password: hashedPassword,
    role: "admin",
  });

  return NextResponse.json({ message: "Admin Account Created Successfully" });
}