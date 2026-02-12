import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    await connectDB();
    
    if (id) {
      const product = await Product.findById(id);
      return NextResponse.json(product);
    } else {
      // Sort by newest first
      const products = await Product.find({ isPublished: true }).sort({ createdAt: -1 });
      return NextResponse.json(products);
    }
  } catch (error: any) {
    console.error("❌ DATABASE ERROR:", error.message);
    return NextResponse.json(
      { error: "Database Connection Failed", details: error.message }, 
      { status: 500 }
    ); 
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();
    
    console.log("Creating Product:", body.title, body.productType);

    const newProduct = await Product.create({
        title: body.title,
        description: body.description,
        priceNGN: Number(body.priceNGN),
        priceUSD: Number(body.priceUSD),
        image: body.image,
        productType: body.productType, // 'ebook' | 'audio' | 'video'
        fileUrl: body.fileUrl,
        previewUrl: body.previewUrl,
        duration: body.duration,
        fileSize: body.fileSize,
        isPublished: true
    });

    return NextResponse.json({ message: "Product Created", product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("❌ CREATE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await connectDB();
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}