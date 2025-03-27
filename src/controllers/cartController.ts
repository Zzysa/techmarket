import { Request, Response, NextFunction } from "express";
import cartModel from "../module/cartModel";
import { AppError } from "../middleware/AppError";

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, productId, amount } = req.body;
  if (!userId || !productId || amount < 1) {
    return next(new AppError("Invalid data", 400, ["userId, productId are required, amount must be at least 1"]));
  }

  try {
    const cartItem = await cartModel.add(userId, productId, amount);
    console.log(cartItem)
    res.status(201).json(cartItem);
  } catch (err) {
    next(err);
  }
};

const getCart = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  try {
    const cart = await cartModel.getAllByUser(userId);
    
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

const updateCart = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, productId, amount } = req.body;
  if (amount < 1) {
    return next(new AppError("Invalid amount", 400, ["amount must be at least 1"]));
  }

  try {
    const updatedItem = await cartModel.updateAmount(userId, productId, amount);
    res.status(200).json(updatedItem);
  } catch (err) {
    next(err);
  }
};

const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, productId } = req.body;
  try {
    const result = await cartModel.delete(userId, productId);
    if (!result) {
      return next(new AppError("Cart item not found", 404));
    }
    res.status(200).json({ message: "Item removed from cart" });
  } catch (err) {
    next(err);
  }
};

export default {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
};
