import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import productModel, { Product } from "../module/productModel";

const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    const { sortByPrice, isAvailable } = req.query;

    try {
        const filters: { sortByPrice?: 'ASC' | 'DESC'; isAvailable?: boolean } = {};

        if (sortByPrice) {
            if (sortByPrice === 'ASC') {
                filters.sortByPrice = "ASC"
            } else if (sortByPrice === 'DESC') {
                filters.sortByPrice = 'DESC';
            } else {
                const error = new Error("Incorrect argument, sortByPrice must be ASC or DESC");
                (error as any).status = 400;
                return next(error);
            } 
        }

        if (isAvailable) {
            if (isAvailable === 'true') {
                filters.isAvailable = true
            } else if (isAvailable === 'false') {
                filters.isAvailable = false;
            } else {
                const error = new Error("Incorrect argument, isAvailable must be true or false");
                (error as any).status = 400;
                return next(error);
            } 
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
        const product = await productModel.getById(id); 
        if (!product) {
            const error = new Error("Product not found");
            (error as any).status = 404;
            return next(error);
        }

        res.json(product);
    } catch (err) {
        next(err);
    }
};

const postProduct = async (req: Request, res: Response, next: NextFunction) => {
    const {
        name, category, description, price, stockCount, brand, imageUrl, isAvailable
    } = req.body;

    try {
        const product = await productModel.create({
            name,
            category,
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
    const { name, category, description, price, stockCount, brand, imageUrl, isAvailable }: Omit<Product, "id"> = req.body;

    try {
        const product = await productModel.update(id, { 
            name, category, description, price, stockCount, brand, imageUrl, isAvailable
        });

        res.status(200).json(product);
    } catch (err) {
        next(err);
    }
};


const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const isDeleted = await productModel.delete(id);

        if (!isDeleted) {
            const error = new Error("Product not found");
            (error as any).status = 404;
            return next(error);
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
