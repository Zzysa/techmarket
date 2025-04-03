import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  first_name: { type: String },
  last_name: { type: String }
});

export default mongoose.model<IUser>('User', UserSchema);