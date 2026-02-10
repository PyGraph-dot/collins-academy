import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DailyDrop from "@/models/DailyDrop";

// 1. GET: Hero section calls this to find the latest word
export async function GET() {
  try {
    await connectDB();
    const latest = await DailyDrop.findOne().sort({ createdAt: -1 });
    return NextResponse.json(latest || {});
  } catch (error) {
    return NextResponse.json({ error: "Error fetching daily drop" }, { status: 500 });
  }
}

// 2. POST: Admin calls this to save a new word
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();
    
    // Create new drop
    const newDrop = await DailyDrop.create({
        word: body.word,
        audioUrl: body.audioUrl
    });
    
    return NextResponse.json(newDrop, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error saving drop" }, { status: 500 });
  }
}