import Product, { IProduct } from '../models/Product';
import mongoose from 'mongoose';

type CreateProductData = Omit<IProduct, '_id' | 'createdAt' | 'updatedAt' | keyof mongoose.Document>;
type UpdateProductData = Partial<CreateProductData>;

const productModel = {
  async getAll(filters: { sortByPrice?: 'ASC' | 'DESC'; isAvailable?: boolean }) {
    const query = Product.find();
    
    if (filters.isAvailable !== undefined) {
      query.where('isAvailable').equals(filters.isAvailable);
    }
    
    if (filters.sortByPrice) {
      const sortDirection = filters.sortByPrice === 'ASC' ? 1 : -1;
      query.sort({ price: sortDirection });
    }
    
    return await query.exec();
  },
  
  async getById(id: string): Promise<IProduct | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Product.findById(id).exec();
  },
  
  async create(productData: CreateProductData): Promise<IProduct> {
    const product = new Product(productData);
    return await product.save();
  },
  
  async update(id: string, productData: UpdateProductData): Promise<IProduct | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    return await Product.findByIdAndUpdate(
      id,
      { $set: productData },
      { new: true }
    ).exec();
  },
  
  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    
    const result = await Product.findByIdAndDelete(id).exec();
    return !!result;
  }
};

export default productModel;