import mongoose, { Schema, model, models } from "mongoose";

const OrderSchema = new Schema(
  {
    customerEmail: { type: String, required: true },
    customerName: { type: String, required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        title: { type: String },
        price: { type: Number },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    status: { type: String, default: "pending" }, // pending, success, failed
    transactionId: { type: String }, // From Paystack/Stripe
  },
  { timestamps: true }
);

const Order = models.Order || model("Order", OrderSchema);

export default Order;