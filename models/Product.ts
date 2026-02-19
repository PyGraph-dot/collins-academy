import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priceNGN: { type: Number, required: true },
    priceUSD: { type: Number, required: true },
    image: { type: String, required: true }, 
    
    productType: { 
      type: String, 
      enum: ['ebook', 'audio', 'video', 'course'], 
      default: 'ebook',
      required: true 
    },

    fileUrl: { type: String, required: true }, 
    previewUrl: { type: String }, 
    
    duration: { type: String }, 
    fileSize: { type: String }, 

    // NEW: The Bestseller Tracker
    salesCount: { type: Number, default: 0 },
    
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Performance Index updated to sort bestsellers faster
ProductSchema.index({ isPublished: 1, salesCount: -1, createdAt: -1 });

const Product = models.Product || model("Product", ProductSchema);

export default Product;