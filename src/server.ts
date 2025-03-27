import express from 'express';
import productRoutes from './routes/productRoutes';
import dotenv from "dotenv"
import errorHandler from './middleware/errorHandler';
import reviewRouter from './routes/reviewRoutes';
import userRouter from './routes/userRoutes';
import categoryRouter from './routes/categoryRoutes';
import cartRouter from './routes/cartRoutes';

dotenv.config()
const app = express();

app.use(express.json());
app.use("/categories", categoryRouter);
app.use('/products', productRoutes);
app.use("/reviews", reviewRouter);
app.use("/users", userRouter);
app.use("/cartItem", cartRouter);
app.use(errorHandler);

const startServer = (port: number) => {
  const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      const newPort = port + 1;
      console.log(`Port ${port} is in use, trying port ${newPort}...`);
      startServer(newPort); 
    } else {
      console.error("Server error:", err);
    }
  });

  return server;
};

const PORT = Number(process.env.SERVER_PORT) || 3001;
const server = startServer(PORT);

export { app, server };