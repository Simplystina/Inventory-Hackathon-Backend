 // eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

/**
 * Global error handler middleware.
 * Handles:
 *  - AppError instances  → structured operational error response
 *  - Mongoose validation → 422 with field-level details
 *  - Mongoose duplicate  → 409 with friendly message
 *  - JWT errors          → 401
 *  - Unknown errors      → 500 (hides internal details in production)
 */
const globalErrorHandler = (
    err: Error,
    _req: Request,
    res: Response,
   
    _next: NextFunction
): void => {
    const isProd = process.env.NODE_ENV === 'production';

    // Operational errors 
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }

    // Mongoose validation error 
    if (err.name === 'ValidationError') {
        const mongooseErr = err as unknown as {
            errors: Record<string, { message: string }>;
        };
        const errors = Object.values(mongooseErr.errors).map((e) => ({
            message: e.message,
        }));
        res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
        return;
    }

    // Mongoose duplicate key (e.g. unique email) 
    if ((err as NodeJS.ErrnoException).code === '11000') {
        const keyValueMatch = err.message.match(/dup key: { (.+?): "(.+?)" }/);
        const field = keyValueMatch ? keyValueMatch[1] : 'field';
        res.status(409).json({
            success: false,
            message: `Duplicate value for '${field}'. Please use a different value.`,
        });
        return;
    }

    // JWT errors 
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ success: false, message: 'Invalid token.' });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
        return;
    }
    console.error(' Unhandled Error:', err);

    res.status(500).json({
        success: false,
        message: isProd ? 'Something went wrong. Please try again later.' : err.message,
        ...(isProd ? {} : { stack: err.stack }),
    });
};

export default globalErrorHandler;
