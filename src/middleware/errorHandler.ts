import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/AppError";

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const response = {
        error: err.message || "Internal Server Error",
        errors: err.errors || [],
    };

    res.status(statusCode).json(response);
};

export default errorHandler;
