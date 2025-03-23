import prisma from "../config/prismaClient";

export interface Review {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    comment?: string;
    createdAt?: Date;
}

const reviewModel = {
    async getAll() {
        return await prisma.review.findMany();
    },

    async getById(id: string) {
        return await prisma.review.findUnique({
            where: { id }
        });
    },

    async create(review: Omit<Review, "id">) {
        return await prisma.review.create({
            data: review
        });
    },

    async update(id: string, updates: Partial<Omit<Review, "id">>) {
        return await prisma.review.update({
            where: { id },
            data: updates
        });
    },

    async delete(id: string) {
        const deleted = await prisma.review.delete({
            where: { id }
        });

        return deleted ? true : false;
    }
};

export default reviewModel;
