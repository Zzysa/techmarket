import products from "../data/products";
import { v4 as uuidv4 } from "uuid";
import { Product } from "../data/products";
import { NextFunction } from "express";

const getAllProducts = (req: any, res: any) => {
    res.json(products);
};

const getProduct = (req: any, res: any, next: NextFunction) => {
    const { id } = req.params;

    if (!id) {
        const error = new Error("Product ID is required");
        (error as any).status = 400; 
        return next(error); 
    }

    const product = products.find(el => el.id === id); 
    
    if (!product) {
        const error = new Error("Product not found");
        (error as any).status = 404; 
        return next(error); 
    }

    res.json(product);
};

const postProduct = (req: any, res: any) => {
    const { 
        name,
        category,
        description,
        price,
        stockCount,
        brand,
        imageUrl,
        isAvailable,
        createdAt
    }: Omit<Product, "id"> = req.body;

    const id = uuidv4();
    const newProduct: Product = { 
        id, 
        name,
        category,
        description,
        price,
        stockCount,
        brand,
        imageUrl,
        isAvailable,
        createdAt
    };

    products.push(newProduct)
    res.status(201).json(newProduct);
}

const changeProduct = (req: any, res: any, next: NextFunction) => {
    const { id } = req.params;
    const updatedData: Partial<Omit<Product, "id">> = req.body; 

    const productToChange = products.find(el => el.id === id)

    if (!productToChange) {
        const error = new Error("Product not found");
        (error as any).status = 404; 
        return next(error); 
    }

    Object.entries(updatedData).forEach(([key, value]) => {
        if (value !== undefined) {
            (productToChange as any)[key] = value;
        }
    });

    res.status(200).json(productToChange);
}

const deleteProduct = (req: any, res: any, next: NextFunction) => {
    const { id } = req.params;
    const index = products.findIndex(el => el.id === id);

    if (index === -1) {
        const error = new Error("Product not found");
        (error as any).status = 404; 
        return next(error); 
    }

    products.splice(index, 1);

    res.status(200).json({ message: "Product is deleted" });
};


export default {
    getAllProducts,
    getProduct,
    postProduct,
    changeProduct,
    deleteProduct
}

