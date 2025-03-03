import products from "../data/products";

const getAllProducts = (req: any, res: any) => {
    res.json(products);
};

export default {
    getAllProducts
}