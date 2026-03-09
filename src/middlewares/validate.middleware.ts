import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

/**
 * Middleware factory that validates req.body/query/params against a Joi schema.
 * Returns 422 with structured field errors on failure.
 */
export const validate = (schema: ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false,
            stripUnknown: true,
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

        // Safely update the request object (req.query is a getter in Express, so we must mutate, not reassign)
        if (source === 'body') {
            req.body = value;
        } else {
            Object.keys(req[source]).forEach((key) => delete req[source][key]); // clear old values
            Object.assign(req[source], value); // apply validated/defaulted values
        }
        next();
    };
};