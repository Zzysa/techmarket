import prisma from "../config/prismaClient";

export interface Product {
    id: string;
    name: string;
    categoryId?: string;
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
        let categoryId: string | null = null;
    
        if (product.categoryId) {
            const categoryRecord = await prisma.category.findFirst({
                where: { name: product.categoryId },  
                select: { id: true }
            });
    
            if (!categoryRecord) {
                throw new Error(`Category "${product.categoryId}" not found`);
            }
    
            categoryId = categoryRecord.id;  
        }
    
        return await prisma.product.create({
            data: {
                ...product,
                categoryId  
            }
        });
    },
    
    async update(id: string, updates: Partial<Product>) {
        const { categoryId, ...rest } = updates;

        return await prisma.product.update({
            where: { id },
            data: {
                ...rest,
                category: categoryId ? { connect: { id: categoryId } } : undefined 
            }
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
