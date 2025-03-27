import prisma from "../config/prismaClient";

export interface CartItem {
    id: string;
    userId: string;
    productId: string;
    amount: number;
    addedAt: Date;
}

const CartModel = {
  async getAllByUser(userId: string): Promise<CartItem[]> {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (!cartItems || cartItems.length === 0) {
      throw new Error("No cart items found for the user");
    }
  
    return cartItems;
  },

  async getById(id: string): Promise<CartItem | null> {
    return await prisma.cartItem.findUnique({
      where: { id },
    });
  },

  async add(userId: string, productId: string, amount: number): Promise<CartItem> {
    return await prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      update: { amount: { increment: amount } },
      create: { userId, productId, amount },
    });
  },

  async updateAmount(userId: string, productId: string, amount: number): Promise<CartItem> {
    if (amount < 1) {
      throw new Error("amount must be at least 1");
    }

    return await prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { amount },
    });
  },

  async delete(userId: string, productId: string): Promise<CartItem | null> {
    return await prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    });
  }
};

export default CartModel;
