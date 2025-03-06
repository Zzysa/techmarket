import express from 'express';
import productRoutes from './routes/productRoutes';
import dotenv from "dotenv"
import errorHandler from './middleware/errorHandler';

dotenv.config()
const app = express();

app.use(express.json());
app.use('/products', productRoutes);
app.use(errorHandler);

app.listen( process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
