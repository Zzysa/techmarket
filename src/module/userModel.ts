import prisma from "../config/prismaClient";
import bcrypt from "bcrypt";

export interface User {
    id: string;
    username: string;
    email: string;
    password_hash: string;
    first_name?: string;
    last_name?: string;
}

const userModel = {
    async getAll() {
        return await prisma.user.findMany();
    },

    async getById(id: string) {
        return await prisma.user.findUnique({
            where: { id }
        });
    },

    async create(user: Omit<User, "id">) {
        const hashedPassword = await bcrypt.hash(user.password_hash, 10);
        return await prisma.user.create({
            data: {
                username: user.username,
                email: user.email,
                password_hash: hashedPassword,
                first_name: user.first_name,
                last_name: user.last_name
            },
        });
    },

    async update(id: string, updates: Partial<User>) {
        return await prisma.user.update({
            where: { id },
            data: updates,
        });
    },

    async delete(id: string) {
        await prisma.user.delete({
            where: { id }
        });
    }
};

export default userModel;
