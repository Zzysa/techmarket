import { Request, Response, NextFunction } from 'express';
import productController from '../controllers/productController';

jest.mock('../module/productModel', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

jest.mock('mongoose', () => ({
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
}));

jest.mock('../middleware/AppError', () => ({
  AppError: jest.fn().mockImplementation((message, statusCode, errors) => ({
    message,
    statusCode,
    errors: errors || []
  }))
}));

describe('Product Controller Tests', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;
  
  const productModel = require('../module/productModel');
  const mongoose = require('mongoose');
  const { AppError } = require('../middleware/AppError');
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });
  
  test('getAllProducts should return products', async () => {
    req.query = {};
    
    const mockProducts = [
      { id: '1', name: 'Product 1', price: 10 },
      { id: '2', name: 'Product 2', price: 20 }
    ];
    productModel.getAll.mockResolvedValue(mockProducts);
    
    await productController.getAllProducts(req as Request, res as Response, next);
    
    expect(productModel.getAll).toHaveBeenCalledWith({});
    expect(res.json).toHaveBeenCalledWith(mockProducts);
  });
  
  test('getAllProducts should filter by availability', async () => {
    req.query = { isAvailable: 'true' };
    
    const mockProducts = [{ id: '1', name: 'Product 1', price: 10, isAvailable: true }];
    productModel.getAll.mockResolvedValue(mockProducts);
    
    await productController.getAllProducts(req as Request, res as Response, next);
    
    expect(productModel.getAll).toHaveBeenCalledWith({ isAvailable: true });
    expect(res.json).toHaveBeenCalledWith(mockProducts);
  });
  
  test('getProduct should return a product by id', async () => {
    req.params = { id: '123' };
    
    const mockProduct = { id: '123', name: 'Product 1', price: 10 };
    productModel.getById.mockResolvedValue(mockProduct);
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    
    await productController.getProduct(req as Request, res as Response, next);
    
    expect(productModel.getById).toHaveBeenCalledWith('123');
    expect(res.json).toHaveBeenCalledWith(mockProduct);
  });
  
  test('getProduct should handle not found', async () => {
    req.params = { id: '123' };
    
    productModel.getById.mockResolvedValue(null);
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    
    await productController.getProduct(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    expect(AppError).toHaveBeenCalledWith('Product not found', 404);
  });
  
  test('postProduct should create a product', async () => {
    req.body = {
      name: 'New Product',
      price: 15.99,
      stockCount: 30,
      isAvailable: true
    };
    
    const expectedData = {
      name: 'New Product',
      price: 15.99,
      stockCount: 30,
      isAvailable: true,
      averageRating: 0,
      reviewsCount: 0,
      description: undefined,
      brand: undefined,
      imageUrl: undefined
    };
    
    const mockProduct = { id: 'new-id', ...req.body };
    productModel.create.mockResolvedValue(mockProduct);
    
    await productController.postProduct(req as Request, res as Response, next);
    
    expect(productModel.create).toHaveBeenCalledWith(expectedData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockProduct);
  });
  
  test('postProduct should validate required fields', async () => {
    req.body = {
      price: -10
    };
    
    await productController.postProduct(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    expect(AppError).toHaveBeenCalledWith('Validation failed', 400, expect.arrayContaining(['Name is required', 'Price must be a positive number']));
  });
  
  test('changeProduct should update a product', async () => {
    req.params = { id: '123' };
    req.body = {
      name: 'Updated Name',
      price: 25.99
    };
    
    const existingProduct = { id: '123', name: 'Original Name', price: 10 };
    const updatedProduct = { ...existingProduct, ...req.body };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    productModel.getById.mockResolvedValue(existingProduct);
    productModel.update.mockResolvedValue(updatedProduct);
    
    await productController.changeProduct(req as Request, res as Response, next);
    
    expect(productModel.update).toHaveBeenCalledWith('123', {
      name: 'Updated Name',
      price: 25.99
    });
    expect(res.json).toHaveBeenCalledWith(updatedProduct);
  });
  
  test('changeProduct should handle not found', async () => {
    req.params = { id: '123' };
    req.body = { name: 'Updated Name' };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    productModel.getById.mockResolvedValue(null);
    
    await productController.changeProduct(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    expect(AppError).toHaveBeenCalledWith('Product not found', 404);
  });
  
  test('deleteProduct should delete a product', async () => {
    req.params = { id: '123' };
    
    const existingProduct = { id: '123', name: 'Product to delete', price: 10 };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    productModel.getById.mockResolvedValue(existingProduct);
    productModel.delete.mockResolvedValue(true);
    
    await productController.deleteProduct(req as Request, res as Response, next);
    
    expect(productModel.delete).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product is deleted' });
  });
  
  test('deleteProduct should handle not found', async () => {
    req.params = { id: '123' };
    
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    productModel.getById.mockResolvedValue(null);
    
    await productController.deleteProduct(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    expect(AppError).toHaveBeenCalledWith('Product not found', 404);
  });
});