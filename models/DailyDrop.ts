import mongoose, { Schema, model, models } from "mongoose";

const DailyDropSchema = new Schema(
  {
    word: { type: String, required: true },       // e.g. "Entrepreneur"
    audioUrl: { type: String, required: true },   // The MP3 link
    date: { type: Date, default: Date.now }       // When it was dropped
  },
  { timestamps: true }
);

const DailyDrop = models.DailyDrop || model("DailyDrop", DailyDropSchema);

export default DailyDrop;