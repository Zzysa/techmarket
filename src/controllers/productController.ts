import { Request, Response, NextFunction } from "express";
import productModel, { Product } from "../module/productModel";
import { AppError } from "../middleware/AppError";

const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    const { sortByPrice, isAvailable } = req.query;
    let errors: string[] = [];

    try {
        const filters: {
            sortByPrice?: 'ASC' | 'DESC';
            isAvailable?: boolean;
        } = {};

        if (sortByPrice) {
            if (sortByPrice === 'ASC') {
                filters.sortByPrice = 'ASC';
            } else if (sortByPrice === 'DESC') {
                filters.sortByPrice ='DESC';
            } else {
                errors.push("Incorrect argument, sortByPrice must be ASC or DESC")
            }
        }

        if (isAvailable) {
            if (isAvailable === 'true') {
                filters.isAvailable = true ;
            } else if (isAvailable === 'false') {
                filters.isAvailable = false;
            } else {
                errors.push("Incorrect argument, isAvailable must be true or false")
            }
        }

        if (errors.length > 0) {
            return next(new AppError("Validation failed", 400, errors))
        }

        const products = await productModel.getAll(filters);
        res.json(products);
    } catch (err) {
        next(err);
    }
};


const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const product = await productModel.getById(id)

        if (!product) {
            return next(new AppError("/Product not found/", 404));
        }

        res.json(product);
    } catch (err) {
        next(err);
    }
};

const postProduct = async (req: Request, res: Response, next: NextFunction) => {
    const {
        name, categoryId, description, price, stockCount, brand, imageUrl, isAvailable
    }: Omit<Product, "id"> = req.body;

    let errors: string[] = [];

    if (!name) errors.push("Name is required");
    if (!price || isNaN(price) || price < 0) errors.push("Price must be a valid number");
    if (stockCount !== undefined && stockCount < 0) errors.push("Stock count is required and cannot be negative");
    if (isAvailable === undefined) errors.push("Product availability is required");

    if (errors.length > 0) {
        return next(new AppError("Validation failed", 400, errors));
    }

    try {
        const product = await productModel.create({
            name,
            categoryId,
            description,
            price,
            stockCount,
            brand,
            imageUrl,
            isAvailable
        });

        res.status(201).json(product);
    } catch (err) {
        next(err);
    }
};

const changeProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const {
        name, categoryId, description, price, stockCount, brand, imageUrl, isAvailable 
    }: Partial<Omit<Product, "id">> = req.body;

    let errors: string[] = [];

    const numericPrice = price !== undefined ? Number(price) : undefined;
    if (numericPrice !== undefined && (isNaN(numericPrice) || numericPrice < 0)) errors.push("Price must be a valid number and cannot be negative");

    const numericStockCount = price !== undefined ? Number(price) : undefined;
    if (numericStockCount !== undefined && (isNaN(numericStockCount) || numericStockCount < 0)) errors.push("Stock count must be a valid number and cannot be negative");

    if (errors.length > 0) {
        return next(new AppError("Validation failed", 400, errors));
    }

    try {
        const productTest = await productModel.getById(id);
        
        if (!productTest) {
            return next(new AppError("Product not found", 404));  
        }

        const product = await productModel.update(id, {
            name,
            categoryId,
            description,
            price,
            stockCount,
            brand,
            imageUrl,
            isAvailable
        });

        res.status(200).json(product);
    } catch (err) {
        next(err);
    }
};

const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        await productModel.delete(id);

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
