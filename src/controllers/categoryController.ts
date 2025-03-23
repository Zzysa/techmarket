import { Request, Response, NextFunction } from "express";
import categoryModel, { Category } from "../module/categoryModel";
import { AppError } from "../middleware/AppError";

const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await categoryModel.getAll();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const category = await categoryModel.getById(id);
    if (!category) {
      return next(new AppError(`Category not found`, 404));
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
};

const postCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { name, description } = req.body;
  let errors: string[] = [];
  if (!name) errors.push("Name is required");

  if (errors.length > 0) {
    return next(new AppError("Validation failed", 400, errors));
  }

  try {
    const category = await categoryModel.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

const changeCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;  
  const { name, description } = req.body;

  let errors: string[] = [];
  if (!name) errors.push("Name is required");

  if (errors.length > 0) {
    return next(new AppError("Validation failed", 400, errors));
  }

  try {
    const category = await categoryModel.getById(id);
    if (!category) {
      return next(new AppError("Category not found", 404));  
    }

    const updatedCategory = await categoryModel.update(id, { name, description });
    res.status(200).json({ data: updatedCategory });  
  } catch (err) {
    next(err); 
  }
};


const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const result = await categoryModel.delete(id);
    if (!result) {
      return next(new AppError(`Category not found`, 404));
    }
    
    res.status(200).json({ message: "Category is deleted" });
  } catch (err) {
    next(err);
  }
};

export default {
  getAllCategories,
  getCategory,
  postCategory,
  changeCategory,
  deleteCategory,
};
