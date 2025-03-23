import prisma from "../config/prismaClient";

export interface Category {
    id: string;
    name: string;
    description?: string | null;
}

const categoryModel = {
  async getAll(): Promise<Category[]> {
    return await prisma.category.findMany();
  },

  async getById(id: string): Promise<Category | null> {
    return await prisma.category.findUnique({
      where: { id },
    });
  },

  async create(category: Omit<Category, "id">): Promise<Category> {
    return await prisma.category.create({
      data: category,
    });
  },

  async update(id: string, updates: Partial<Omit<Category, "id">>): Promise<Category> {

    if (Object.keys(updates).length === 0) throw new Error("No fields to update");
    
    return await prisma.category.update({
      where: { id },
      data: updates,
    });
  },

  async delete(id: string): Promise<Category | null> {
    return await prisma.category.delete({
      where: { id },
    });
  }
};

export default categoryModel;
