jest.mock("../config/prismaClient", () => require("../__mocks__/prismaClient"));
import request from "supertest";
import { app, server } from "../server";
import mockPrisma from "../__mocks__/prismaClient";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../middleware/AppError";

describe("Cart Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /cartItem", () => {
    test("should add a product to the cart", async () => {
      const userId = uuidv4();
      const productId = uuidv4();
      const cartItemId = uuidv4();
      const cartItem = { id: cartItemId, userId, productId, amount: 2, addedAt: new Date() };

      mockPrisma.cartItem.upsert.mockResolvedValueOnce(cartItem);

      const response = await request(app).post("/cartItem").send({ userId, productId, amount: 2 });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe(cartItemId);
      expect(response.body.amount).toBe(2);
      expect(mockPrisma.cartItem.upsert).toHaveBeenCalledTimes(1);
    });

    test("should return 400 if amount is less than 1", async () => {
      const userId = uuidv4();
      const productId = uuidv4();

      const response = await request(app).post("/cartItem").send({ userId, productId, amount: 0 });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /cartItem/:userId", () => {
    test("should return cart items for the user", async () => {
      const userId = uuidv4();
      const cartItems = [
        {
          id: uuidv4(),
          userId,
          productId: uuidv4(),
          amount: 2,
          addedAt: new Date(),
        },
        {
          id: uuidv4(),
          userId,
          productId: uuidv4(),
          amount: 1,
          addedAt: new Date(),
        },
      ];

      mockPrisma.cartItem.findMany.mockResolvedValueOnce(cartItems);

      const response = await request(app).get(`/cartItem/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(mockPrisma.cartItem.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe("PATCH /cartItem", () => {
    test("should update the amount of a cart item", async () => {
      const userId = uuidv4();
      const productId = uuidv4();
      const updatedCartItem = { id: uuidv4(), userId, productId, amount: 5, addedAt: new Date() };

      mockPrisma.cartItem.update.mockResolvedValueOnce(updatedCartItem);

      const response = await request(app).patch("/cartItem").send({ userId, productId, amount: 5 });

      console.log(response.body);

      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(5);
      expect(mockPrisma.cartItem.update).toHaveBeenCalledTimes(1);
    });

    test("should return 400 if amount is less than 1", async () => {
      const userId = uuidv4();
      const productId = uuidv4();

      const response = await request(app)
        .patch("/cartItem")
        .send({ userId, productId, amount: 0 });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /cartItem", () => {
    test("should remove an item from the cart", async () => {
      const userId = uuidv4();
      const productId = uuidv4();
      const cartItem = { id: uuidv4(), userId, productId, amount: 1, addedAt: new Date() };

      mockPrisma.cartItem.delete.mockResolvedValueOnce(cartItem);

      const response = await request(app)
        .delete("/cartItem")
        .send({ userId, productId });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Item removed from cart/i);
      expect(mockPrisma.cartItem.delete).toHaveBeenCalledTimes(1);
    });

    test("should return 404 if cart item is not found", async () => {
      const userId = uuidv4();
      const productId = uuidv4();

      mockPrisma.cartItem.delete.mockRejectedValueOnce(new AppError("Cart item not found", 404));

      const response = await request(app).delete("/cartItem").send({ userId, productId });

      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/Cart item not found/i);
    });
  });

  afterAll(() => {
    server.close();
  });
});
