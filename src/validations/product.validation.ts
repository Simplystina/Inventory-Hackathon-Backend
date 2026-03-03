import Joi from 'joi';

export const createProductSchema = Joi.object({
    name: Joi.string().min(2).max(200).trim().required().messages({
        'string.empty': 'Product name is required',
        'string.min': 'Product name must be at least 2 characters',
        'string.max': 'Product name cannot exceed 200 characters',
        'any.required': 'Product name is required',
    }),

    sku: Joi.string().uppercase().trim().optional().messages({
        'string.base': 'SKU must be a string',
    }),

    category: Joi.string().trim().required().messages({
        'string.empty': 'Category is required',
        'any.required': 'Category is required',
    }),

    price: Joi.number().min(0).required().messages({
        'number.base': 'Price must be a number',
        'number.min': 'Price cannot be negative',
        'any.required': 'Price is required',
    }),

    cost: Joi.number().min(0).required().messages({
        'number.base': 'Cost must be a number',
        'number.min': 'Cost cannot be negative',
        'any.required': 'Cost is required',
    }),

    quantity: Joi.number().integer().min(0).default(0).messages({
        'number.base': 'Initial stock must be a number',
        'number.integer': 'Initial stock must be a whole number',
        'number.min': 'Initial stock cannot be negative',
    }),

    lowStockAlert: Joi.number().integer().min(0).default(5).messages({
        'number.base': 'Low stock alert must be a number',
        'number.integer': 'Low stock alert must be a whole number',
        'number.min': 'Low stock alert cannot be negative',
    }),

    description: Joi.string().max(1000).trim().allow('').optional().messages({
        'string.max': 'Description cannot exceed 1000 characters',
    }),
});

export const getProductsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    category: Joi.string().trim().optional(),
    search: Joi.string().trim().optional(),
    isActive: Joi.boolean().optional(),
});

export const updateProductSchema = Joi.object({
    name: Joi.string().min(2).max(200).trim().optional().messages({
        'string.min': 'Product name must be at least 2 characters',
        'string.max': 'Product name cannot exceed 200 characters',
    }),

    sku: Joi.string().uppercase().trim().optional().messages({
        'string.base': 'SKU must be a string',
    }),

    category: Joi.string().trim().optional(),

    price: Joi.number().min(0).optional().messages({
        'number.base': 'Price must be a number',
        'number.min': 'Price cannot be negative',
    }),

    cost: Joi.number().min(0).optional().messages({
        'number.base': 'Cost must be a number',
        'number.min': 'Cost cannot be negative',
    }),

    quantity: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be a whole number',
        'number.min': 'Quantity cannot be negative',
    }),

    lowStockAlert: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Low stock alert must be a number',
        'number.integer': 'Low stock alert must be a whole number',
        'number.min': 'Low stock alert cannot be negative',
    }),

    description: Joi.string().max(1000).trim().allow('').optional().messages({
        'string.max': 'Description cannot exceed 1000 characters',
    }),

    isActive: Joi.boolean().optional(),
}).min(1).messages({
    'object.min': 'At least one field must be provided for update.',
});
