import { Request, Response, NextFunction } from 'express';
import reviewController from '../controllers/reviewController';
import mongoose from 'mongoose';

jest.mock('../module/reviewModel', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  findByUserAndProduct: jest.fn(),
  getProductStats: jest.fn(),
  hasUserVoted: jest.fn(),
  vote: jest.fn()
}));

jest.mock('../module/productModel', () => ({
  getById: jest.fn(),
  update: jest.fn()
}));

jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
}));

jest.mock('../controllers/reviewValidator', () => ({
  validateReview: jest.fn()
}));

jest.mock('../middleware/AppError', () => ({
  AppError: jest.fn().mockImplementation((message, statusCode, errors) => ({
    message,
    statusCode,
    errors: errors || []
  }))
}));

describe('Review Controller Tests', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;
  
  const reviewModel = require('../module/reviewModel');
  const productModel = require('../module/productModel');
  const mongoose = require('mongoose');
  const { validateReview } = require('../controllers/reviewValidator');
  const { AppError } = require('../middleware/AppError');
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });
  
  test('postReview should create a new review', async () => {
    req.body = {
      productId: 'valid-product-id',
      userId: 'valid-user-id',
      rating: 4,
      title: 'Great product',
      content: 'Very happy with this purchase',
      pros: ['Fast delivery', 'Good quality'],
      cons: ['Expensive']
    };
    
    validateReview.mockReturnValue({ error: null, value: req.body });
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    productModel.getById.mockResolvedValue({ _id: 'valid-product-id', name: 'Test Product' });
    reviewModel.findByUserAndProduct.mockResolvedValue(null);
    reviewModel.create.mockResolvedValue({ _id: 'new-review-id', ...req.body });
    reviewModel.getProductStats.mockResolvedValue({ averageRating: 4.5, totalReviews: 10 });
    
    await reviewController.postReview(req as Request, res as Response, next);
    
    expect(validateReview).toHaveBeenCalledWith(req.body);
    expect(productModel.getById).toHaveBeenCalledWith('valid-product-id');
    expect(reviewModel.findByUserAndProduct).toHaveBeenCalledWith('valid-user-id', 'valid-product-id');
    expect(reviewModel.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });
  
  test('postReview should validate review data', async () => {
    req.body = { productId: 'invalid-id', rating: 6 };
    
    validateReview.mockReturnValue({ 
      error: { 
        details: [
          { message: 'Rating must be between 1 and 5' },
          { message: 'Title is required' }
        ] 
      } 
    });
    
    await reviewController.postReview(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    expect(AppError).toHaveBeenCalledWith('Validation failed', 400, ['Rating must be between 1 and 5', 'Title is required']);
  });
  
  test('getAllReviews should return reviews with pagination', async () => {
    req.query = {
      page: '1',
      limit: '10',
      productId: 'valid-product-id'
    };
    
    const mockReviews = [
      { _id: 'review1', title: 'Review 1', rating: 5 },
      { _id: 'review2', title: 'Review 2', rating: 4 }
    ];
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    reviewModel.getAll.mockResolvedValue(mockReviews);
    reviewModel.count.mockResolvedValue(2);
    
    await reviewController.getAllReviews(req as Request, res as Response, next);
    
    expect(reviewModel.getAll).toHaveBeenCalledWith(
      { productId: 'valid-product-id' },  
      {                                   
        page: 1,
        limit: 10,
        sort: { createdAt: -1 }  
      }
    );
  });
  
  test('getReview should return a review by id', async () => {
    req.params = { id: 'valid-review-id' };
    
    const mockReview = { _id: 'valid-review-id', title: 'Review', rating: 4 };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    reviewModel.getById.mockResolvedValue(mockReview);
    
    await reviewController.getReview(req as Request, res as Response, next);
    
    expect(reviewModel.getById).toHaveBeenCalledWith('valid-review-id');
    expect(res.json).toHaveBeenCalledWith(mockReview);
  });
  
  test('getReview should handle not found', async () => {
    req.params = { id: 'nonexistent-id' };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    reviewModel.getById.mockResolvedValue(null);
    
    await reviewController.getReview(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    expect(AppError).toHaveBeenCalledWith('Review not found', 404);
  });
  
  test('changeReview should update a review', async () => {
    req.params = { id: 'valid-review-id' };
    req.body = {
      rating: 3,
      title: 'Updated Title'
    };
    
    const existingReview = { 
      _id: 'valid-review-id', 
      userId: {
        toString: () => 'user-id'
      }, 
      productId: 'product-id',
      rating: 4, 
      title: 'Original Title' 
    };
    
    const updatedReview = { ...existingReview, ...req.body };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    reviewModel.getById.mockResolvedValue(existingReview);
    reviewModel.update.mockResolvedValue(updatedReview);
    
    await reviewController.changeReview(req as Request, res as Response, next);
    
    expect(reviewModel.update).toHaveBeenCalledWith('valid-review-id', {
      rating: 3,
      title: 'Updated Title'
    });
    expect(res.json).toHaveBeenCalledWith(updatedReview);
  });
  
  test('deleteReview should delete a review', async () => {
    req.params = { id: 'valid-review-id' };
    
    const mockReview = { 
      _id: 'valid-review-id', 
      productId: 'product-id' 
    };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    reviewModel.getById.mockResolvedValue(mockReview);
    reviewModel.delete.mockResolvedValue(true);
    
    await reviewController.deleteReview(req as Request, res as Response, next);
    
    expect(reviewModel.delete).toHaveBeenCalledWith('valid-review-id');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Review deleted successfully' });
  });
  
  test('getProductReviewStats should return stats', async () => {
    req.params = { productId: 'valid-product-id' };
    
    const mockStats = {
      averageRating: 4.2,
      totalReviews: 5,
      ratingDistribution: { '5': 2, '4': 2, '3': 1, '2': 0, '1': 0 },
      verifiedCount: 3,
      verifiedPercentage: 60
    };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    productModel.getById.mockResolvedValue({ _id: 'valid-product-id' });
    reviewModel.getProductStats.mockResolvedValue(mockStats);
    
    await reviewController.getProductReviewStats(req as Request, res as Response, next);
    
    expect(reviewModel.getProductStats).toHaveBeenCalledWith('valid-product-id');
    expect(res.json).toHaveBeenCalledWith(mockStats);
  });
  
  test('voteForReview should add a vote', async () => {
    req.params = { id: 'valid-review-id' };
    req.body = {
      userId: 'voter-id',
      helpful: true
    };
    
    const mockReview = {
      _id: 'valid-review-id',
      userId: {
        toString: () => 'author-id'
      },
      helpfulVotes: 5
    };
    
    const updatedReview = {
      ...mockReview,
      helpfulVotes: 6
    };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    reviewModel.getById.mockResolvedValue(mockReview);
    reviewModel.vote.mockResolvedValue(updatedReview);
    
    await reviewController.voteForReview(req as Request, res as Response, next);
    
    expect(reviewModel.vote).toHaveBeenCalledWith('valid-review-id', 'voter-id', true);
    expect(res.json).toHaveBeenCalledWith(updatedReview);
  });
});