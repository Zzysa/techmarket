import request from "supertest";
import { app, server } from "../server";
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/prismaClient";

let testUserId: string;
let testProductId: string;
let testProductId2: string;

describe("Cart Integration Tests", () => {
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        username: "testuser",
        email: `test-${uuidv4()}@example.com`,
        password_hash: "hashedpassword"
      }
    });
    testUserId = user.id;

    const product1 = await prisma.product.create({
      data: {
        name: "Test Product 1",
        price: 100,
        stockCount: 10,
        isAvailable: true
      }
    });
    testProductId = product1.id;

    const product2 = await prisma.product.create({
      data: {
        name: "Test Product 2",
        price: 200,
        stockCount: 5,
        isAvailable: true
      }
    });
    testProductId2 = product2.id;
  });

  afterEach(async () => {
    await prisma.cartItem.deleteMany({
      where: { userId: testUserId }
    });
  });

  describe("POST /cartItem", () => {
    test("should add a product to the cart", async () => {
        const response = await request(app).post("/cartItem").send({
            userId: testUserId,
            productId: testProductId,
            amount: 2
        });

      expect(response.status).toBe(201);
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.productId).toBe(testProductId);
      expect(response.body.amount).toBe(2);
      
      const cartItem = await prisma.cartItem.findUnique({
        where: { 
            userId_productId: { 
                userId: testUserId, 
                productId: testProductId 
            } 
        }
      });
      
      expect(cartItem).not.toBeNull();
      expect(cartItem?.amount).toBe(2);
    });

    test("should increment amount if product already in cart", async () => {
      await request(app).post("/cartItem").send({
            userId: testUserId,
            productId: testProductId,
            amount: 2
        });

      const response = await request(app).post("/cartItem").send({
            userId: testUserId,
            productId: testProductId,
            amount: 3
        });

      expect(response.status).toBe(201);
      expect(response.body.amount).toBe(5);
    });
  });

  describe("GET /cartItem/:userId", () => {
    test("should get all cart items for the user", async () => {
        await prisma.cartItem.createMany({
            data: [
                { userId: testUserId, productId: testProductId, amount: 2 },
                { userId: testUserId, productId: testProductId2, amount: 1 }
            ]
        });

      const response = await request(app).get(`/cartItem/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].productId).toBeDefined();
      expect(response.body[1].productId).toBeDefined();
    });
  });

  describe("PATCH /cartItem", () => {
    test("should update the amount of a cart item", async () => {
        await prisma.cartItem.create({
            data: {
                userId: testUserId,
                productId: testProductId,
                amount: 2
            }
        });

        const response = await request(app).patch("/cartItem").send({
            userId: testUserId,
            productId: testProductId,
            amount: 5
        });

      expect(response.status).toBe(200);
      expect(response.body.amount).toBe(5);
      
      const cartItem = await prisma.cartItem.findUnique({
        where: { 
          userId_productId: { 
            userId: testUserId, 
            productId: testProductId 
          } 
        }
      });
      
      expect(cartItem?.amount).toBe(5);
    });
  });

  describe("DELETE /cartItem", () => {
    test("should remove an item from the cart", async () => {
        await prisma.cartItem.create({
            data: {
                userId: testUserId,
                productId: testProductId,
                amount: 2
            }
        });

        const response = await request(app).delete("/cartItem").send({
            userId: testUserId,
            productId: testProductId
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toMatch(/Item removed from cart/i);
      
        const cartItem = await prisma.cartItem.findUnique({
            where: { 
                userId_productId: { 
                    userId: testUserId, 
                    productId: testProductId 
                } 
            }
        });
      
        expect(cartItem).toBeNull();
    });

    afterAll(async () => {
        await prisma.cartItem.deleteMany({
            where: { userId: testUserId }
        });
        
        await prisma.product.deleteMany({
            where: { id: { in: [testProductId, testProductId2] } }
        });
        
        await prisma.user.delete({
            where: { id: testUserId }
        });
    
        if (server) {
            server.close();
        }
    });
  });
});