import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// GET: Fetch products or a single product by ID
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    await connectDB();
    
    if (id) {
      // Fetch a single product by ID
      const product = await Product.findById(id);
      return NextResponse.json(product);
    } else {
      // Fetch all published products
      const products = await Product.find({ isPublished: true }).sort({ createdAt: -1 });
      return NextResponse.json(products);
    }
  } catch (error: any) {
    console.error("❌ DATABASE ERROR DETAILS:", error.message);
    
    // NEW: Send the error to the browser so we can see it!
    return NextResponse.json(
      { error: "Database Connection Failed", details: error.message }, 
      { status: 500 }
    ); 
  }
}

// POST: Create a new product (Admin Only - we will secure this later)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectDB();
    
    // Log what we are trying to save (for debugging)
    console.log("Attempting to create:", body);

    const newProduct = await Product.create(body);
    return NextResponse.json({ message: "Product Created", product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("❌ CREATE ERROR:", error);
    
    // Send the ACTUAL error message back to the browser
    return NextResponse.json(
      { error: error.message || "Unknown Server Error" }, 
      { status: 500 }
    );
  }
}

// UPDATE a product
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    
    await connectDB();
    
    // Update the product by ID
    await Product.findByIdAndUpdate(id, body);
    
    return NextResponse.json({ message: "Updated" });
  } catch (error: any) {
    console.error("❌ UPDATE ERROR:", error.message);
    return NextResponse.json({ error: error.message || "Update failed" }, { status: 500 });
  }
}

// DELETE a product
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    await connectDB();
    await Product.findByIdAndDelete(id);
    
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    console.error("❌ DELETE ERROR:", error.message);
    return NextResponse.json({ error: error.message || "Delete failed" }, { status: 500 });
  }
}