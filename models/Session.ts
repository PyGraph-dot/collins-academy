import mongoose, { Schema, model, models } from "mongoose";

const SessionSchema = new Schema({
  email: { type: String, required: true, lowercase: true },
  token: { type: String, required: true, unique: true },
  // TTL Index: Automatically expires the session after 30 days (2,592,000 seconds)
  createdAt: { type: Date, expires: 2592000, default: Date.now } 
});

const Session = models.Session || model("Session", SessionSchema);

export default Session;