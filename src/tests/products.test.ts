jest.mock("../config/prismaClient", () => require("../__mocks__/prismaClient"));
import request from "supertest";
import { app, server } from "../server";
import mockPrisma from "../__mocks__/prismaClient";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../middleware/AppError";

describe("Product Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /products", () => {
        test("should return a list of products", async () => {
            mockPrisma.product.findMany.mockResolvedValueOnce([
                { id: uuidv4(), name: "Product A", description: "Desc A", price: 10.0, stockCount: 100, isAvailable: true },
                { id: uuidv4(), name: "Product B", description: "Desc B", price: 20.0, stockCount: 50, isAvailable: false },
            ]);

            const response = await request(app).get("/products");

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].name).toBe("Product A");
            expect(mockPrisma.product.findMany).toHaveBeenCalledTimes(1);
        });
    });

    describe("GET /products/:id", () => {
        test("should return 200 if found", async () => {
            const productId = uuidv4();
    
            mockPrisma.product.findUnique.mockResolvedValueOnce(
                {
                    id: productId,
                    name: "Product A",
                    price: 10.0,
                    stockCount: 100, 
                    isAvailable: true
                }
            );
    
            const response = await request(app).get(`/products/${productId}`);
    
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(productId);
        });

        test("should return 404 if not found", async () => {
            mockPrisma.product.findUnique.mockResolvedValueOnce(null);

            const response = await request(app).get("/products/999");
            expect(response.status).toBe(404);
            expect(response.body.error).toMatch(/Product not found/i);
        });
    });

    describe("PATCH /products/:id", () => {
        test("should update partial category fields", async () => {
            const id = uuidv4();

            mockPrisma.product.findUnique.mockResolvedValueOnce(
                {
                    id: id,
                    name: "Product A",
                    price: 10.0,
                    stockCount: 100, 
                    isAvailable: true
                }
            );

            mockPrisma.product.update.mockResolvedValueOnce(
                {
                    id: id,
                    name: "Updated Name",
                    stockCount: 200, 
                }
            );

            const response = await request(app).patch(`/products/${id}`).send({
                name: "Updated Name",
                stockCount: 200,
            });

            console.log(response.body)

            expect(response.status).toBe(200);
            expect(response.body.name).toBe("Updated Name");
            expect(mockPrisma.product.update).toHaveBeenCalledWith({
                where: { id: id },
                data: { 
                    name: "Updated Name",
                    stockCount: 200,
                },
            });
        });
    });

    describe("POST /products/:id", () => {
        test("should create a product", async () => {
            const productId = uuidv4();

            mockPrisma.product.create.mockResolvedValueOnce({
                id: productId,
                name: "New Product",
                description: "Product desc",
                price: 15.99,
                stockCount: 30,
                isAvailable: true
            });

            const response = await request(app).post("/products").send({
                name: "New Product",
                description: "Product desc",
                price: 15.99,
                stockCount: 30,
                isAvailable: true
            });

            expect(response.status).toBe(201);
            expect(response.body.id).toBe(productId);
            expect(mockPrisma.product.create).toHaveBeenCalledTimes(1);
        });
    });  
    
    describe("DELETE /products/:id", () => {
        test("should delete product if exists", async () => {
            mockPrisma.product.delete.mockResolvedValueOnce({
                id: 9,
                name: "To be deleted"
            });

            const response = await request(app).delete("/products/9");
            expect(response.status).toBe(200);
            expect(response.body.message).toMatch(/Product is deleted/);
            expect(mockPrisma.product.delete).toHaveBeenCalledTimes(1);
        });

        test("should return 404 if product not found", async () => {
            mockPrisma.product.delete.mockRejectedValueOnce(new AppError("Product not found", 404));
        
            const response = await request(app).delete("/products/999");
        
            expect(response.status).toBe(404);
            expect(response.body.error).toMatch(/Product not found/i);
        });
    });

    afterAll(() => {
        server.close();
    });
});
