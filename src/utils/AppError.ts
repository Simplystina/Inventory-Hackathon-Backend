/**
 * Custom application error class.
 */
class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // known, expected errors 

        // Maintain proper stack trace 
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
