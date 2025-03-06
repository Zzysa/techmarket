import { Request, Response, NextFunction} from "express";

export interface Error {
    status: number
    message: string
}

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({ error: message });
};

export default errorHandler;
