import Joi from 'joi';

const passwordComplexity = Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .messages({
        'string.pattern.base':
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password cannot exceed 128 characters',
    });

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).trim().required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required',
    }),

    email: Joi.string().email().lowercase().trim().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
    }),

    password: passwordComplexity.required().messages({
        'any.required': 'Password is required',
    }),

    role: Joi.string().valid('admin', 'manager').default('admin').messages({
        'any.only': 'Role must be one of: admin, manager',
    }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
    }),

    password: Joi.string().required().messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
    }),
});

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        'string.empty': 'Refresh token is required',
        'any.required': 'Refresh token is required',
    }),
});
