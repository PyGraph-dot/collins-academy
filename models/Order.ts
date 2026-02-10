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
    
    // <--- NEW FIELD: Stores the rate at the moment of purchase
    exchangeRate: { type: Number, default: 1 }, 

    status: { type: String, default: "pending" }, // pending, success, failed
    transactionId: { type: String },
  },
  { timestamps: true }
);

const Order = models.Order || model("Order", OrderSchema);

export default Order;