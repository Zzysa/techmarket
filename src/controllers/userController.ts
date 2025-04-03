import { Request, Response, NextFunction } from "express";
import userModel from "../module/userModel";
import { AppError } from "../middleware/AppError";
import { User } from "../module/userModel";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userModel.getAll();
        res.json(users);
    } catch (err) {
        next(err);
    }
};

const getUser = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const user = await userModel.getById(id);
        if (!user || user === undefined) {
            return next(new AppError("User not found", 404));
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password_hash, first_name, last_name } = req.body;
    let errors: string[] = [];

    if (!username) errors.push("Username is required");
    if (!email) errors.push("Email is required");
    if (!password_hash) errors.push("Password is required");

    if (errors.length > 0) {
        return next(new AppError("Validation failed", 400, errors));
    }

    try {
        const user = await userModel.create({ username, email, password_hash, first_name, last_name });
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { username, email, password_hash, first_name, last_name }: Partial<Omit<User, "id">> = req.body;

    try {
        const userTest = await userModel.getById(id);
        
        if (!userTest) {
            return next(new AppError("User not found", 404));  
        }

        const user = await userModel.update(id, {
            username,
            email,
            password_hash,
            first_name,
            last_name,
        });

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        await userModel.delete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        next(err);
    }
};

export default {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};
