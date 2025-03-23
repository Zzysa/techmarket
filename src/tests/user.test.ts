jest.mock("../config/prismaClient", () => require("../__mocks__/prismaClient"));
import request from "supertest";
import { app, server } from "../server";
import mockPrisma from "../__mocks__/prismaClient";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../middleware/AppError";

describe("User Routes", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /users", () => {
        test("should return a list of users", async () => {
            mockPrisma.user.findMany.mockResolvedValueOnce([
                { id: uuidv4(), username: "John Doe", email: "john@example.com", password_hash: "123" },
                { id: uuidv4(), username: "Jane Smith", email: "jane@example.com", password_hash: "123" },
            ]);

            const response = await request(app).get("/users");

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].username).toBe("John Doe");
            expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1);
        });
    });

    describe("GET /users/:id", () => {
        test("should return 200 if found", async () => {
            const userId = uuidv4();

            mockPrisma.user.findUnique.mockResolvedValueOnce({ 
                id: userId,
                username: "John Doe",
                email: "john@example.com",
                password_hash: "123" 
            })

            const response = await request(app).get(`/users/${userId}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(userId);
        });

        test("should return 404 if not found", async () => {
            mockPrisma.user.findUnique.mockResolvedValueOnce(null);
            const response = await request(app).get("/users/999");
            console.log(response.body); 
            expect(response.status).toBe(404);
            expect(response.body.error).toMatch(/User not found/i);
        });
    });

    describe("DELETE /users/:userId", () => {
        test("should delete user if exists", async () => {
            mockPrisma.user.delete.mockResolvedValueOnce({
                id: 9,
                name: "To be deleted",
            });

            const response = await request(app).delete("/users/9");
            expect(response.status).toBe(200);
            expect(response.body.message).toMatch(/User deleted successfully/);
            expect(mockPrisma.user.delete).toHaveBeenCalledTimes(1);
        });

        test("should return 404 if user not found", async () => {
            mockPrisma.user.delete.mockRejectedValueOnce(new AppError("User not found", 404));
        
            const response = await request(app).delete("/users/999");
        
            expect(response.status).toBe(404);
            expect(response.body.error).toMatch(/User not found/i);
        });
    });

    describe("PATCH /users/:id", () => {
        test("should update partial user fields", async () => {
            const id = uuidv4();

            mockPrisma.user.findUnique.mockResolvedValueOnce({ 
                id: id,
                username: "John Doe",
                email: "john@example.com",
                password_hash: "123",
            })

            mockPrisma.user.update.mockResolvedValueOnce({ 
                id: id,
                username: "Stas Doe",
                password_hash: "55555" 
            })

            const response = await request(app).patch(`/users/${id}`).send({
                username: "Stas Doe",
                password_hash: "55555" 
            });

            console.log(response.body)

            expect(response.status).toBe(200);
            expect(response.body.username).toBe("Stas Doe");
            expect(mockPrisma.user.update).toHaveBeenCalledWith({
                where: { id: id },
                data: { 
                    username: "Stas Doe",
                    password_hash: "55555" 
                },
            });
        });
    });


    describe("POST /users", () => {
        test("should create a new user", async () => {  
            const newUser = {
                username: "John Doe",
                email: "john@example.com",
                password_hash: "123",
            };

            mockPrisma.user.create.mockResolvedValueOnce({
                id: uuidv4(),
                ...newUser,
            });

            const response = await request(app).post("/users").send(newUser);

            expect(response.status).toBe(201);
            expect(response.body.username).toBe(newUser.username);
            expect(response.body.email).toBe(newUser.email);
            expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
        });
    });

    beforeAll(() => {
        server.close()
    });
});
