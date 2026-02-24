import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

/**
 * Middleware factory that validates req.body against a Joi schema.
 * Returns 422 with structured field errors on failure.
 */
export const validate = (schema: ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        // if (!req.body) {
        //     res.status(422).json({
        //         success: false,
        //         message: 'Validation failed',
        //         errors: [{ field: 'body', message: 'Request body is required' }],
        //     });
        //     return;
        // }
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,   // collect ALL errors, not just the first
            stripUnknown: true,  // remove fields not in schema
        });

        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));

            res.status(422).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
            return;
        }

        // Replace req.body with the validated (and stripped) value
        req.body = value;
        next();
    };
};
