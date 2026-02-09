import mongoose, { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    priceNGN: { type: Number, required: true },
    priceUSD: { type: Number, required: true },
    image: { type: String, required: true },
    category: { type: String, default: "book" },
    // We make this OPTIONAL (no 'required: true') so the form doesn't crash
    fileUrl: { type: String }, 
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Product = models.Product || model("Product", ProductSchema);

export default Product;