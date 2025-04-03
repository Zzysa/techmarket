import { Request, Response, NextFunction } from "express";
import productModel from "../module/productModel";
import { AppError } from "../middleware/AppError";
import mongoose from "mongoose";

const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    const { 
        sortByPrice, 
        isAvailable, 
        minPrice, 
        maxPrice, 
        brand, 
        search,
        page = "1",
        limit = "10"
    } = req.query;

    let errors: string[] = [];
    
    try {
        const filters: any = {};
        
        if (sortByPrice) {
            if (sortByPrice === 'ASC' || sortByPrice === 'DESC') {
                filters.sortByPrice = sortByPrice;
            } else {
                errors.push("sortByPrice must be ASC or DESC");
            }
        }
        
        if (isAvailable !== undefined) {
            if (isAvailable === 'true') {
                filters.isAvailable = true;
            } else if (isAvailable === 'false') {
                filters.isAvailable = false;
            } else {
                errors.push("isAvailable must be true or false");
            }
        }
        
        if (errors.length > 0) {
            return next(new AppError("Validation failed", 400, errors));
        }
        
        const products = await productModel.getAll(filters);
        
        res.json(products);
    } catch (err) {
        next(err);
    }
};

const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid product ID format", 400));
    }
    
    try {
        const product = await productModel.getById(id);
        
        if (!product) {
            return next(new AppError("Product not found", 404));
        }
        
        res.json(product);
    } catch (err) {
        next(err);
    }
};

const postProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, price, stockCount, brand, imageUrl, isAvailable } = req.body;
    
    let errors: string[] = [];
    
    if (!name) errors.push("Name is required");
    if (!price || isNaN(Number(price)) || Number(price) < 0) errors.push("Price must be a positive number");
    if (stockCount !== undefined && (isNaN(Number(stockCount)) || Number(stockCount) < 0)) errors.push("Stock count must be a non-negative number");
    
    if (errors.length > 0) {
        return next(new AppError("Validation failed", 400, errors));
    }
    
    try {
        const product = await productModel.create({
            name,
            description,
            price: Number(price),
            stockCount: stockCount !== undefined ? Number(stockCount) : 0,
            brand,
            imageUrl,
            isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
            averageRating: 0,
            reviewsCount: 0
        });
        
        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

const changeProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, description, price, stockCount, brand, imageUrl, isAvailable } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid product ID format", 400));
    }
    
    let errors: string[] = [];
    
    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
        errors.push("Price must be a positive number");
    }
    
    if (stockCount !== undefined && (isNaN(Number(stockCount)) || Number(stockCount) < 0)) {
        errors.push("Stock count must be a non-negative number");
    }
    
    if (errors.length > 0) {
        return next(new AppError("Validation failed", 400, errors));
    }
    
    try {
        const existingProduct = await productModel.getById(id);
        
        if (!existingProduct) {
            return next(new AppError("Product not found", 404));
        }
        
        const updatedFields: any = {};
        
        if (name !== undefined) updatedFields.name = name;
        if (description !== undefined) updatedFields.description = description;
        if (price !== undefined) updatedFields.price = Number(price);
        if (stockCount !== undefined) updatedFields.stockCount = Number(stockCount);
        if (brand !== undefined) updatedFields.brand = brand;
        if (imageUrl !== undefined) updatedFields.imageUrl = imageUrl;
        if (isAvailable !== undefined) updatedFields.isAvailable = Boolean(isAvailable);
        
        const updatedProduct = await productModel.update(id, updatedFields);
        
        res.json(updatedProduct);
    } catch (err) {
        next(err);
    }
};

const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid product ID format", 400));
    }
    
    try {
        const product = await productModel.getById(id);
        
        if (!product) {
            return next(new AppError("Product not found", 404));
        }
        
        const deleted = await productModel.delete(id);
        
        if (!deleted) {
            return next(new AppError("Failed to delete product", 500));
        }
        
        res.status(200).json({ message: "Product is deleted" });
    } catch (err) {
        next(err);
    }
};

export default {
    getAllProducts,
    getProduct,
    postProduct,
    changeProduct,
    deleteProduct
};