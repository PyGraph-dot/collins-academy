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
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      return NextResponse.json(product);
    } else {
      // FIX: Find ALL products, even if they have broken/missing fields
      const products = await Product.find({}).sort({ createdAt: -1 });
      return NextResponse.json(products);
    }
  } catch (error: any) {
    console.error("❌ DATABASE ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 }); 
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();
    
    // FIX: Fallback values ensure valid database entry
    const newProduct = await Product.create({
        title: body.title,
        description: body.description,
        priceNGN: Number(body.priceNGN),
        priceUSD: Number(body.priceUSD),
        image: body.image,
        productType: body.productType || 'ebook', // Default to ebook if missing
        fileUrl: body.fileUrl,
        duration: body.duration || "", 
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