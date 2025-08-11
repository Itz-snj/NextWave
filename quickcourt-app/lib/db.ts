import mongoose, { Schema, model, models } from 'mongoose';

const MONGO_URL = process.env.MONGO_URL || '';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (!MONGO_URL) {
    throw new Error('Please define the MONGO_URL environment variable');
  }
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

const VenueSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String, required: true },
  sports: [{ type: String }],
  priceRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  courtCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  image: { type: String }, // legacy single image
  images: { type: [String], default: [] },
  amenities: [{ type: String }],
  status: { type: String, enum: ['approved', 'pending'], default: 'pending' },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const Venue = models.Venue || model('Venue', VenueSchema);

const CourtSchema = new Schema({
  venue: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
  name: { type: String, required: true },
  sport: { type: String, required: true },
  basePricePerHour: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Court = models.Court || model('Court', CourtSchema);

const TimeSlotSchema = new Schema({
  venue: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
  court: { type: Schema.Types.ObjectId, ref: 'Court', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // HH:mm
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

TimeSlotSchema.index({ court: 1, date: 1, time: 1 }, { unique: true });

export const TimeSlot = models.TimeSlot || model('TimeSlot', TimeSlotSchema);

