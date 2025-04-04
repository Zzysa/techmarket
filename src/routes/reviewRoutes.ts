import express from "express";
import reviewController from "../controllers/reviewController";

const reviewRouter = express.Router();

reviewRouter.get("/", reviewController.getAllReviews);
reviewRouter.post("/", reviewController.postReview);
reviewRouter.get("/:id", reviewController.getReview);
reviewRouter.patch("/:id", reviewController.changeReview);
reviewRouter.delete("/:id", reviewController.deleteReview);
reviewRouter.get("/product/:productId/stats", reviewController.getProductReviewStats);
reviewRouter.post("/:id/vote", reviewController.voteForReview);

export default reviewRouter;