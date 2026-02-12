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
      // Find ALL products, even if they have some missing fields
      // We sort by creation date to show newest first
      const products = await Product.find({}).sort({ createdAt: -1 });
      
      return NextResponse.json(products);
    }
  } catch (error: any) {
    console.error("❌ DATABASE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", details: error.message }, 
      { status: 500 }
    ); 
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();
    
    // DEBUG: Log exactly what we received
    console.log("📝 Incoming Product Data:", body);

    // Validation: Ensure description is not empty string
    if (!body.description || body.description.trim() === "") {
        return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const newProduct = await Product.create({
        title: body.title,
        description: body.description,
        priceNGN: Number(body.priceNGN),
        priceUSD: Number(body.priceUSD),
        image: body.image,
        
        // Critical Fix: Ensure we use the Type from the wizard, or default to ebook
        productType: body.productType || 'ebook', 
        
        fileUrl: body.fileUrl,
        duration: body.duration || "", // Optional metadata
        isPublished: true
    });

    return NextResponse.json({ message: "Product Created", product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("❌ CREATE ERROR:", error);
    // Send exact error to frontend for debugging
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