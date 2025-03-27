import express from 'express';
import cartController from "../controllers/cartController";

const cartRouter = express.Router();

cartRouter.post("/", cartController.addToCart);
cartRouter.get("/:userId", cartController.getCart);
cartRouter.patch("/", cartController.updateCart);
cartRouter.delete("/", cartController.removeFromCart);

export default cartRouter;
