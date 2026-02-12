import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priceNGN: { type: Number, required: true },
    priceUSD: { type: Number, required: true },
    image: { type: String, required: true }, // Cover Art
    
    // NEW: What are we selling?
    productType: { 
      type: String, 
      enum: ['ebook', 'audio', 'video', 'course'], 
      default: 'ebook',
      required: true 
    },

    // NEW: The Main File (Secure)
    fileUrl: { type: String, required: true }, 

    // NEW: The Teaser (Public) - e.g. 30s audio clip or YouTube trailer
    previewUrl: { type: String }, 
    
    // NEW: Metadata for UI
    duration: { type: String }, // e.g. "150 pages" or "2h 30m"
    fileSize: { type: String }, // e.g. "1.2 GB"
    
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Performance Index
ProductSchema.index({ isPublished: 1, createdAt: -1 });

const Product = models.Product || model("Product", ProductSchema);

export default Product;