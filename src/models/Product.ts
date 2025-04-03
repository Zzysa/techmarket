import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  stockCount: number;
  brand?: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
  averageRating: number;
  reviewsCount: number; 
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stockCount: { type: Number, required: true, default: 0 },
  brand: { type: String },
  imageUrl: { type: String },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  averageRating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 }
});

export default mongoose.model<IProduct>('Product', ProductSchema);