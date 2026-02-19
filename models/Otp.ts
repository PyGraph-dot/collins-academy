import mongoose, { Schema, model, models } from "mongoose";

const OtpSchema = new Schema({
  email: { type: String, required: true, lowercase: true },
  code: { type: String, required: true },
  // TTL Index: This tells MongoDB to automatically delete the document after 10 minutes (600 seconds)
  createdAt: { type: Date, expires: 600, default: Date.now } 
});

const Otp = models.Otp || model("Otp", OtpSchema);

export default Otp;