import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/AppError";
import reviewModel from "../module/reviewModel";

const getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reviews = await reviewModel.getAll();
        res.json(reviews);
    } catch (err) {
        next(err);
    }
};

const getReview = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const review = await reviewModel.getById(id);

        if (!review) {
            return next(new AppError("Review not found", 404));
        }

        res.json(review);
    } catch (err) {
        next(err);
    }
};

const postReview = async (req: Request, res: Response, next: NextFunction) => {
    const { productId, userId, rating, comment } = req.body;
    let errors: string[] = [];

    if (!productId) errors.push("Product ID is required");
    if (!userId) errors.push("User ID is required");
    if (rating === undefined || isNaN(rating) || rating < 1 || rating > 5) {
        errors.push("Rating must be a number between 1 and 5");
    }

    if (errors.length > 0) {
        return next(new AppError("Validation failed", 400, errors));
    }

    try {
        const review = await reviewModel.create({ productId, userId, rating, comment });
        res.status(201).json(review);
    } catch (err) {
        next(err);
    }
};

const changeReview = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    let errors: string[] = [];

    if (rating !== undefined && (isNaN(rating) || rating < 1 || rating > 5)) {
        errors.push("Rating must be a number between 1 and 5");
    }

    if (errors.length > 0) {
        return next(new AppError("Validation failed", 400, errors));
    }

    try {
        const reviewTest = await reviewModel.getById(id);
        
        if (!reviewTest) {
            return next(new AppError("Product not found", 404));  
        }

        const review = await reviewModel.update(id, { rating, comment });

        if (!review) {
            return next(new AppError("Review not found", 404));
        }

        res.status(200).json(review);
    } catch (err) {
        next(err);
    }
};

const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const deleted = await reviewModel.delete(id);

        if (!deleted) {
            return next(new AppError("Review not found", 404));
        }

        res.status(200).json({ message: "Review deleted" });
    } catch (err) {
        next(err);
    }
};

export default {
    getAllReviews,
    getReview,
    postReview,
    changeReview,
    deleteReview
};
