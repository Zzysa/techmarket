import express from 'express';
import userController from '../controllers/userController';

const userRouter = express.Router();

userRouter.get("/", userController.getAllUsers);
userRouter.post("/", userController.createUser);
userRouter.get("/:id", userController.getUser);
userRouter.patch("/:id", userController.updateUser);
userRouter.delete("/:id", userController.deleteUser);

export default userRouter;
