import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import productRoutes from './routes/productRoutes';
import errorHandler from './middleware/errorHandler';

dotenv.config();

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techmarket');
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    return false;
  }
};

const app = express();

connectToDatabase();

app.use(express.json());
app.use('/products', productRoutes);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app, server };