import Review, { IReview } from '../models/Review';
import mongoose from 'mongoose';

interface ReviewFilters {
  productId?: string;
  userId?: string;
  rating?: { $gte?: number; $lte?: number };
  verifiedPurchase?: boolean;
  $or?: Array<{ [key: string]: any }>;
}

interface PaginationOptions {
  page: number;
  limit: number;
  sort: { [key: string]: mongoose.SortOrder };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: string]: number };
  verifiedCount: number;
  verifiedPercentage: number;
}

const reviewModel = {
  async getAll(filters: ReviewFilters, options: PaginationOptions): Promise<IReview[]> {
    const skip = (options.page - 1) * options.limit;
    
    return await Review.find(filters)
      .sort(options.sort)
      .skip(skip)
      .limit(options.limit)
      .populate('userId', 'username first_name last_name')
      .exec();
  },
  
  async count(filters: ReviewFilters): Promise<number> {
    return await Review.countDocuments(filters).exec();
  },

  async getById(id: string): Promise<IReview | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Review.findById(id)
      .populate('userId', 'username first_name last_name')
      .exec();
  },
  
  async findByUserAndProduct(userId: string, productId: string): Promise<IReview | null> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return null;
    }
    
    return await Review.findOne({ userId, productId }).exec();
  },

  async create(review: any): Promise<IReview> {
    const newReview = new Review(review);
    return await newReview.save();
  },

  async update(id: string, updates: any): Promise<IReview | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    return await Review.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).populate('userId', 'username first_name last_name').exec();
  },

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    
    const result = await Review.findByIdAndDelete(id).exec();
    return !!result;
  },
  
  async getProductStats(productId: string | mongoose.Types.ObjectId): Promise<ReviewStats> {
    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId.toString()) } },
      { 
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          verifiedCount: { $sum: { $cond: ['$verifiedPurchase', 1, 0] } },
          ratings: { $push: '$rating' }
        }
      }
    ]).exec();
    
    if (!stats.length) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        verifiedCount: 0,
        verifiedPercentage: 0
      };
    }
    
    const ratingDistribution: { [key: string]: number } = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    stats[0].ratings.forEach((rating: number) => {
      ratingDistribution[rating.toString()]++;
    });
    
    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      ratingDistribution,
      verifiedCount: stats[0].verifiedCount,
      verifiedPercentage: stats[0].totalReviews > 0 
        ? Math.round((stats[0].verifiedCount / stats[0].totalReviews) * 100) 
        : 0
    };
  },
  
  async hasUserVoted(reviewId: string, userId: string): Promise<boolean> {
    return false;
  },
  
  async vote(reviewId: string, userId: string, helpful: boolean): Promise<IReview | null> {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return null;
    }
    
    const update = helpful 
      ? { $inc: { helpfulVotes: 1 } } 
      : { $inc: { helpfulVotes: -1 } };
    
    return await Review.findByIdAndUpdate(
      reviewId,
      update,
      { new: true }
    ).populate('userId', 'username first_name last_name').exec();
  }
};

export default reviewModel;