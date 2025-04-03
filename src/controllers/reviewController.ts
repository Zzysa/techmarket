import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/AppError";
import reviewModel from "../module/reviewModel";
import productModel from "../module/productModel";
import mongoose from "mongoose";
import { validateReview } from "./reviewValidator";

const postReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { error, value } = validateReview(req.body);
        
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return next(new AppError("Validation failed", 400, errors));
        }
        
        const { productId, userId, rating, title, content, pros, cons, verifiedPurchase } = value;
        
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(new AppError("Invalid product ID format", 400));
        }
        
        const product = await productModel.getById(productId);
        if (!product) {
            return next(new AppError("Product not found", 404));
        }
        
        const existingReview = await reviewModel.findByUserAndProduct(userId, productId);
        if (existingReview) {
            return next(new AppError("You have already reviewed this product", 400));
        }
        
        const review = await reviewModel.create({
            productId,
            userId,
            rating,
            title,
            content,
            pros: pros || [],
            cons: cons || [],
            verifiedPurchase: verifiedPurchase || false,
            helpfulVotes: 0
        });
        
        await updateProductReviewStats(productId);
        
        res.status(201).json(review);
    } catch (err) {
        next(err);
    }
};

const getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
            productId,
            userId,
            minRating,
            maxRating,
            verifiedOnly,
            searchQuery
        } = req.query;
        
        const filters: any = {};
        
        if (productId) {
            if (!mongoose.Types.ObjectId.isValid(productId as string)) {
                return next(new AppError("Invalid product ID format", 400));
            }
            filters.productId = productId;
        }
        
        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId as string)) {
                return next(new AppError("Invalid user ID format", 400));
            }
            filters.userId = userId;
        }
        
        if (minRating) {
            filters.rating = { $gte: Number(minRating) };
        }
        
        if (maxRating) {
            filters.rating = { ...filters.rating, $lte: Number(maxRating) };
        }
        
        if (verifiedOnly === "true") {
            filters.verifiedPurchase = true;
        }
        
        if (searchQuery) {
            const query = searchQuery as string;
            filters.$or = [
                { title: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } }
            ];
        }
        
        const sortOptions: any = {};
        sortOptions[sortBy as string] = sortOrder === "asc" ? 1 : -1;
        
        const options = {
            page: Number(page),
            limit: Number(limit),
            sort: sortOptions
        };
        
        const reviews = await reviewModel.getAll(filters, options);
        const total = await reviewModel.count(filters);
        const totalPages = Math.ceil(total / Number(limit));
        
        res.json({
            reviews,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages
            }
        });
    } catch (err) {
        next(err);
    }
};

const getReview = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError("Invalid review ID format", 400));
        }
        
        const review = await reviewModel.getById(id);
        
        if (!review) {
            return next(new AppError("Review not found", 404));
        }
        
        res.json(review);
    } catch (err) {
        next(err);
    }
};

const changeReview = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError("Invalid review ID format", 400));
        }
        
        const existingReview = await reviewModel.getById(id);
        if (!existingReview) {
            return next(new AppError("Review not found", 404));
        }
        
        const userId = req.body.userId || existingReview.userId;
        if (userId.toString() !== existingReview.userId.toString()) {
            return next(new AppError("You can only update your own reviews", 403));
        }
        
        const allowedUpdates = {
            rating: req.body.rating,
            title: req.body.title,
            content: req.body.content,
            pros: req.body.pros,
            cons: req.body.cons
        };
        
        Object.keys(allowedUpdates).forEach(key => {
            if (allowedUpdates[key as keyof typeof allowedUpdates] === undefined) {
                delete allowedUpdates[key as keyof typeof allowedUpdates];
            }
        });
        
        if (Object.keys(allowedUpdates).length === 0) {
            return next(new AppError("No valid fields to update", 400));
        }
        
        if (allowedUpdates.rating && (allowedUpdates.rating < 1 || allowedUpdates.rating > 5)) {
            return next(new AppError("Rating must be between 1 and 5", 400));
        }
        
        const updatedReview = await reviewModel.update(id, allowedUpdates);
        
        await updateProductReviewStats(existingReview.productId);
        
        res.json(updatedReview);
    } catch (err) {
        next(err);
    }
};

const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError("Invalid review ID format", 400));
        }
        
        const review = await reviewModel.getById(id);
        if (!review) {
            return next(new AppError("Review not found", 404));
        }
        
        const productId = review.productId;
        
        const deleted = await reviewModel.delete(id);
        if (!deleted) {
            return next(new AppError("Failed to delete review", 500));
        }
        
        await updateProductReviewStats(productId);
        
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (err) {
        next(err);
    }
};

const getProductReviewStats = async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    
    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return next(new AppError("Invalid product ID format", 400));
        }
        
        const product = await productModel.getById(productId);
        if (!product) {
            return next(new AppError("Product not found", 404));
        }
        
        const stats = await reviewModel.getProductStats(productId);
        
        res.json(stats);
    } catch (err) {
        next(err);
    }
};

const voteForReview = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { userId, helpful } = req.body;
    
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError("Invalid review ID format", 400));
        }
        
        if (!userId) {
            return next(new AppError("User ID is required", 400));
        }
        
        if (helpful === undefined) {
            return next(new AppError("Helpful flag is required", 400));
        }
        
        const review = await reviewModel.getById(id);
        if (!review) {
            return next(new AppError("Review not found", 404));
        }
        
        if (review.userId.toString() === userId) {
            return next(new AppError("You cannot vote for your own review", 400));
        }
        
        const hasVoted = await reviewModel.hasUserVoted(id, userId);
        if (hasVoted) {
            return next(new AppError("You have already voted for this review", 400));
        }
        
        const updatedReview = await reviewModel.vote(id, userId, helpful);
        
        res.json(updatedReview);
    } catch (err) {
        next(err);
    }
};

const updateProductReviewStats = async (productId: mongoose.Types.ObjectId | string) => {
    try {
        const stats = await reviewModel.getProductStats(productId);
        await productModel.update(productId.toString(), {
            averageRating: stats.averageRating,
            reviewsCount: stats.totalReviews
        });
    } catch (error) {
        console.error("Failed to update product review stats:", error);
    }
};

export default {
    getAllReviews,
    getReview,
    postReview,
    changeReview,
    deleteReview,
    getProductReviewStats,
    voteForReview
};