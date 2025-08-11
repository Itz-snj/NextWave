import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import mongoose, { Schema, model, models } from 'mongoose';

const MONGO_URL = process.env.MONGO_URL || '';

if (!MONGO_URL) {
  throw new Error('Please define the MONGO_URL environment variable');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URL, {
      bufferCommands: false,
    }).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export const User = models.User || model('User', UserSchema);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
