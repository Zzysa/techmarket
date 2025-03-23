jest.mock("../config/prismaClient", () => require("../__mocks__/prismaClient"));
import request from "supertest";
import { app, server} from "../server";
import mockPrisma from "../__mocks__/prismaClient";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../middleware/AppError";

describe("Category Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /categories", () => {
        test("should return a list of categories", async () => {
            mockPrisma.category.findMany.mockResolvedValueOnce([
                { id: uuidv4(), name: "Cat A", description: "Desc A" },
                { id: uuidv4(), name: "Cat B", description: "Desc B" },
            ]);

            const response = await request(app).get("/categories");

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].name).toBe("Cat A");
            expect(mockPrisma.category.findMany).toHaveBeenCalledTimes(1);
        });
    });

    describe("GET /categories/:id", () => {
        test("should return 200 if found", async () => {
            const category1Id = uuidv4();
    
            mockPrisma.category.findUnique.mockResolvedValueOnce(
                { id: category1Id, name: "Cat A", description: "Desc A" },
            );
    
            const response = await request(app).get(`/categories/${category1Id}`);
    
            expect(response.status).toBe(200);
            expect(response.body.id).toBe(category1Id);
        });

        test("should return 404 if not found", async () => {
            mockPrisma.category.findUnique.mockResolvedValueOnce(null);

            const response = await request(app).get("/categories/999");
            expect(response.status).toBe(404);
            expect(response.body.error).toMatch(/Category not found/i);
        });
    });

    describe("PATCH /categories/:id", () => {
        test("should update partial category fields", async () => {
            const id = uuidv4();

            mockPrisma.category.findUnique.mockResolvedValueOnce({
                id: id, name: "Cat A", description: "Desc A",
            });

            mockPrisma.category.update.mockResolvedValueOnce({
                id: id, name: "Updated Name", description: "Update A",
            });

            const response = await request(app).patch(`/categories/${id}`).send({
                name: "Updated Name",
                description: "Update A",
            });

            expect(response.status).toBe(200);
            expect(response.body.data.name).toBe("Updated Name");
            expect(mockPrisma.category.update).toHaveBeenCalledWith({
                where: { id: id },
                data: { 
                    name: "Updated Name",
                    description: "Update A",
                },
            });
        });
    });

    describe("POST /categories", () => {
        test("should create a category", async () => {
            const category1Id = uuidv4();

            mockPrisma.category.create.mockResolvedValueOnce({
                id: category1Id,
                name: "New Category",
                description: "Cat desc",
            });

            const response = await request(app).post("/categories").send({
                name: "New Category",
                description: "Cat desc",
            });

            expect(response.status).toBe(201);
            expect(response.body.id).toBe(category1Id);
            expect(mockPrisma.category.create).toHaveBeenCalledTimes(1);
        });
    });  
    
    describe("DELETE /categories/:categoryId", () => {
        test("should delete category if exists", async () => {
            mockPrisma.category.delete.mockResolvedValueOnce({
                id: 9,
                name: "To be deleted",
            });

            const response = await request(app).delete("/categories/9");
            expect(response.status).toBe(200);
            expect(response.body.message).toMatch(/Category is deleted/);
            expect(mockPrisma.category.delete).toHaveBeenCalledTimes(1);
        });

        test("should return 404 if category not found", async () => {
            mockPrisma.category.delete.mockRejectedValueOnce(new AppError("Category not found", 404));
        
            const response = await request(app).delete("/categories/999");
        
            expect(response.status).toBe(404);
            expect(response.body.error).toMatch(/Category not found/i);
        });
    });

    afterAll(() => {
        server.close();
    });
});

