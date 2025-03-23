jest.mock("../config/prismaClient", () => require("../__mocks__/prismaClient"));
import request from "supertest";
import { app, server } from "../server";
import mockPrisma from "../__mocks__/prismaClient";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../middleware/AppError";

describe("Review Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /reviews", () => {
        test("should return a list of reviews", async () => {
            mockPrisma.review.findMany.mockResolvedValueOnce([
                { id: uuidv4(), content: "Great product!", rating: 5 },
                { id: uuidv4(), content: "Not bad.", rating: 3 },
            ]);

            const response = await request(app).get("/reviews");

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].content).toBe("Great product!");
            expect(mockPrisma.review.findMany).toHaveBeenCalledTimes(1);
        });
    });

    describe("GET /reviews/:id", () => {
        test("should return 200 if found", async () => {
            const reviewId = uuidv4();

            mockPrisma.review.findUnique.mockResolvedValueOnce({
                id: reviewId,
                content: "Great product!",
                rating: 5,
            });

            const response = await request(app).get(`/reviews/${reviewId}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(reviewId);
        });

        test("should return 404 if not found", async () => {
            mockPrisma.review.findFirst.mockResolvedValueOnce(null);

            const response = await request(app).get("/reviews/999");
            expect(response.status).toBe(404);
            expect(response.body.error).toMatch(/Review not found/i);
        });
    });

    describe("DELETE /reviews/:id", () => {
        test("should delete review if exists", async () => {
            mockPrisma.review.delete.mockResolvedValueOnce({
                id: 9,
                content: "To be deleted",
            });

            const response = await request(app).delete("/reviews/9");
            expect(response.status).toBe(200);
            expect(response.body.message).toMatch(/Review deleted/);
            expect(mockPrisma.review.delete).toHaveBeenCalledTimes(1);
        });

        test("should return 404 if review not found", async () => {
            mockPrisma.review.delete.mockRejectedValueOnce(new AppError("Review not found", 404));
        
            const response = await request(app).delete("/reviews/999");
        
            expect(response.status).toBe(404);
            expect(response.body.error).toMatch(/Review not found/i);
        });
    });

    describe("PATCH /reviews/:id", () => {
        test("should update partial review fields", async () => {
            const id = uuidv4();

            mockPrisma.review.findUnique.mockResolvedValueOnce(
                { id: uuidv4(), comment: "Great product!", rating: 5 },
            );

            mockPrisma.review.update.mockResolvedValueOnce(
                { id: uuidv4(), comment: "New opinion!", rating: 2 },
            );

            const response = await request(app).patch(`/reviews/${id}`).send({
                comment: "New opinion!",
                rating: 2,
            });

            expect(response.status).toBe(200);
            expect(response.body.comment).toBe("New opinion!");
            expect(mockPrisma.review.update).toHaveBeenCalledWith({
                where: { id: id },
                data: { 
                    comment: "New opinion!",
                    rating: 2,
                },
            });
        });
    });


    describe("POST /reviews", () => {
        test("should create a new review", async () => {
            const newReview = {
                comment: "Amazing product!",
                rating: 5,
                productId: uuidv4(),
                userId: uuidv4(),
            };

            mockPrisma.review.create.mockResolvedValueOnce({
                id: uuidv4(),
                ...newReview,
            });

            const response = await request(app).post("/reviews").send(newReview);

            expect(response.status).toBe(201);
            expect(response.body.comment).toBe(newReview.comment);
            expect(response.body.rating).toBe(newReview.rating);
            expect(mockPrisma.review.create).toHaveBeenCalledTimes(1);
        });
    });

    beforeAll(() => {
        server.close()
    });
});
