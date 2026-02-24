import Joi from 'joi';


const saleItemSchema = Joi.object({
    productId: Joi.string().required().messages({
        'string.empty': 'Product ID is required',
        'any.required': 'Product ID is required',
    }),
    name: Joi.string().trim().required().messages({
        'string.empty': 'Product name is required',
        'any.required': 'Product name is required',
    }),
    quantity: Joi.number().integer().min(1).required().messages({
        'number.base': 'Quantity must be a number',
        'number.integer': 'Quantity must be a whole number',
        'number.min': 'Quantity must be at least 1',
        'any.required': 'Quantity is required',
    }),
    unitPrice: Joi.number().min(0).required().messages({
        'number.base': 'Unit price must be a number',
        'number.min': 'Unit price cannot be negative',
        'any.required': 'Unit price is required',
    }),
});

export const createSaleSchema = Joi.object({
    items: Joi.array().items(saleItemSchema).min(1).required().messages({
        'array.min': 'At least one item is required',
        'any.required': 'Items are required',
    }),
    payment: Joi.string()
        .valid('cash', 'card', 'transfer', 'other')
        .required()
        .messages({
            'any.only': "Payment must be 'cash', 'card', 'transfer', or 'other'",
            'any.required': 'Payment method is required',
        }),
    date: Joi.string().isoDate().optional().messages({
        'string.isoDate': 'Date must be a valid ISO 8601 string',
    }),
    time: Joi.string()
        .pattern(/^\d{2}:\d{2}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Time must be in HH:MM format',
        }),
});


export const getSalesQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    payment: Joi.string().valid('cash', 'card', 'transfer', 'other').optional(),
    from: Joi.string().isoDate().optional(),
    to: Joi.string().isoDate().optional(),
    search: Joi.string().trim().optional(),
});
