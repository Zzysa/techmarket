import prisma from "../config/prisma";

export interface Product {
    id: string;
    name: string;
    category?: string;
    description?: string;
    price: number;
    stockCount: number;
    brand?: string;
    imageUrl?: string;
    isAvailable: boolean;
    createdAt?: Date;
}

const productModel = {
    async getAll(filters: { sortByPrice?: 'ASC' | 'DESC'; isAvailable?: boolean }) {
        const orderBy = filters.sortByPrice ? { price: filters.sortByPrice.toLowerCase() as 'asc' | 'desc' } : undefined;
        const where = filters.isAvailable !== undefined ? { isAvailable: filters.isAvailable } : undefined;
    
        return await prisma.product.findMany({
            where,
            orderBy
        });
    },
    
    async getById(id: string) {
        return await prisma.product.findUnique({
            where: { id }
        });
    },

    async create(product: Omit<Product, "id">) {
        return await prisma.product.create({
            data: product
        });
    },

    async update(id: string, updates: Partial<Product>) {
        return await prisma.product.update({
            where: { id },
            data: updates
        });
    },

    async delete(id: string) {
        await prisma.product.delete({
            where: { id }
        });
        return true; 
    }
};

export default productModel;
