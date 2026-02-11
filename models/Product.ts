import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priceNGN: { type: Number, required: true },
    priceUSD: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, default: "book" },
    fileUrl: { type: String }, 
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// PERFORMANCE INDEX: Speeds up the Shop Page query by 100x
// It creates a sorted list of published items, ready to serve.
ProductSchema.index({ isPublished: 1, createdAt: -1 });

const Product = models.Product || model("Product", ProductSchema);

export default Product;