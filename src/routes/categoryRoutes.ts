import categoryController from "../controllers/categoryController";
import express from 'express';

const categoryRouter = express.Router();

categoryRouter.get("/", categoryController.getAllCategories);
categoryRouter.post("/", categoryController.postCategory);
categoryRouter.get('/:id', categoryController.getCategory);
categoryRouter.patch('/:id', categoryController.changeCategory)
categoryRouter.delete('/:id', categoryController.deleteCategory)


export default categoryRouter;