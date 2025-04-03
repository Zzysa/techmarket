import User, { IUser } from '../models/User';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
}

const userModel = {
  async getAll(): Promise<IUser[]> {
    return await User.find().exec();
  },

  async getById(id: string): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await User.findById(id).exec();
  },

  async create(user: Omit<User, "id">): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(user.password_hash, 10);
    const newUser = new User({
      ...user,
      password_hash: hashedPassword
    });
    return await newUser.save();
  },

  async update(id: string, updates: Partial<User>): Promise<IUser | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    if (updates.password_hash) {
      updates.password_hash = await bcrypt.hash(updates.password_hash, 10);
    }
    
    return await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).exec();
  },

  async delete(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    
    const result = await User.findByIdAndDelete(id).exec();
    return !!result;
  }
};

export default userModel;