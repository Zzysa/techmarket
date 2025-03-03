import products from "../data/products";
import { v4 as uuidv4 } from "uuid";

const getAllProducts = (req: any, res: any) => {
    res.json(products);
};

const getProduct = (req: any, res: any) => {
    const { id } = req.params;
    const product = products.find(el => el.id === id); 
    
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
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
    } = req.body;

    const id = uuidv4();
    const newProduct = { 
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

export default {
    getAllProducts,
    getProduct,
    postProduct
}