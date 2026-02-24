import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler and forwards any thrown errors to Express's
 * next() so they are picked up by the global error handler.
 */
const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        fn(req, res, next).catch(next);
    };
};

export default asyncHandler;
