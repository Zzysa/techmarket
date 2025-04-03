import { Request, Response, NextFunction } from 'express';
import userController from '../controllers/userController';

jest.mock('../module/userModel', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

jest.mock('../middleware/AppError', () => ({
  AppError: jest.fn().mockImplementation((message, statusCode, errors) => ({
    message,
    statusCode,
    errors: errors || []
  }))
}));

describe('User Controller Tests', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;
  
  const userModel = require('../module/userModel');
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
  
  test('getAllUsers should return users', async () => {
    const mockUsers = [
      { id: '1', username: 'john', email: 'john@example.com' },
      { id: '2', username: 'jane', email: 'jane@example.com' }
    ];
    userModel.getAll.mockResolvedValue(mockUsers);
    
    await userController.getAllUsers(req as Request, res as Response, next);
    
    expect(userModel.getAll).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });
  
  test('getUser should return a user by id', async () => {
    req.params = { id: '123' };
    
    const mockUser = { id: '123', username: 'john', email: 'john@example.com' };
    userModel.getById.mockResolvedValue(mockUser);
    
    await userController.getUser(req as Request, res as Response, next);
    
    expect(userModel.getById).toHaveBeenCalledWith('123');
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });
  
  test('getUser should handle not found', async () => {
    req.params = { id: '123' };
    
    userModel.getById.mockResolvedValue(null);
    
    await userController.getUser(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    expect(AppError).toHaveBeenCalledWith('User not found', 404);
  });
  
  test('createUser should add a new user', async () => {
    req.body = {
      username: 'newuser',
      email: 'new@example.com',
      password_hash: 'hashed_password',
      first_name: 'John',
      last_name: 'Doe'
    };
    
    const mockUser = { id: 'new-id', ...req.body };
    userModel.create.mockResolvedValue(mockUser);
    
    await userController.createUser(req as Request, res as Response, next);
    
    expect(userModel.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });
  
  test('createUser should validate required fields', async () => {
    req.body = {
      email: 'invalid@example.com'
    };
    
    await userController.createUser(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    expect(AppError).toHaveBeenCalledWith('Validation failed', 400, expect.arrayContaining(['Username is required', 'Password is required']));
  });
  
  test('updateUser should modify user fields', async () => {
    req.params = { id: '123' };
    req.body = {
      username: 'updateduser',
      first_name: 'Updated',
      last_name: 'User'
    };
    
    const existingUser = { id: '123', username: 'olduser', email: 'user@example.com' };
    const updatedUser = { ...existingUser, ...req.body };
    
    userModel.getById.mockResolvedValue(existingUser);
    userModel.update.mockResolvedValue(updatedUser);
    
    await userController.updateUser(req as Request, res as Response, next);
    
    expect(userModel.update).toHaveBeenCalledWith('123', req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedUser);
  });
  
  test('updateUser should handle not found', async () => {
    req.params = { id: '123' };
    req.body = { username: 'updated' };
    
    userModel.getById.mockResolvedValue(null);
    
    await userController.updateUser(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    expect(AppError).toHaveBeenCalledWith('User not found', 404);
  });
  
  test('deleteUser should remove a user', async () => {
    req.params = { id: '123' };
    
    const existingUser = { id: '123', username: 'user', email: 'user@example.com' };
    
    userModel.getById.mockResolvedValue(existingUser);
    userModel.delete.mockResolvedValue(true);
    
    await userController.deleteUser(req as Request, res as Response, next);
    
    expect(userModel.delete).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
  });
  
  test('deleteUser should handle not found error', async () => {
    req.params = { id: '123' };
    
    userModel.delete.mockRejectedValue(new Error('User not found'));
    
    await userController.deleteUser(req as Request, res as Response, next);
    
    expect(next).toHaveBeenCalled();
  });
  
  test('updateUser with invalid email should pass through (not validated)', async () => {
    req.params = { id: '123' };
    req.body = {
      email: 'invalid-email',
      username: 'user'
    };
    
    const existingUser = { id: '123', username: 'user', email: 'user@example.com' };
    const updatedUser = { ...existingUser, ...req.body };
    
    userModel.getById.mockResolvedValue(existingUser);
    userModel.update.mockResolvedValue(updatedUser);
    
    await userController.updateUser(req as Request, res as Response, next);
    
    expect(userModel.update).toHaveBeenCalledWith('123', req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updatedUser);
  });
});