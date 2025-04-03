import Joi from 'joi';

export const reviewSchema = Joi.object({
  productId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid product ID format',
      'any.required': 'Product ID is required'
    }),
    
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format',
      'any.required': 'User ID is required'
    }),
    
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': 'Rating must be a number',
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'any.required': 'Rating is required'
    }),
    
  title: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Title is required'
    }),
    
  content: Joi.string()
    .trim()
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Content is required',
      'string.max': 'Content cannot exceed 2000 characters',
      'any.required': 'Content is required'
    }),
    
  pros: Joi.array()
    .items(
      Joi.string()
        .trim()
        .max(200)
    )
    .default([]),
    
  cons: Joi.array()
    .items(
      Joi.string()
        .trim()
        .max(200)
    )
    .default([]),
    
  verifiedPurchase: Joi.boolean()
    .default(false)
});

export const validateReview = (data: any) => {
  return reviewSchema.validate(data, { abortEarly: false });
};