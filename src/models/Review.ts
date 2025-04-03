import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  verifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  content: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 2000
  },
  pros: [{ 
    type: String,
    trim: true,
    maxlength: 200
  }],
  cons: [{ 
    type: String,
    trim: true,
    maxlength: 200
  }],
  verifiedPurchase: { 
    type: Boolean, 
    default: false 
  },
  helpfulVotes: { 
    type: Number, 
    default: 0 
  }
}, { 
  timestamps: true 
});

ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);