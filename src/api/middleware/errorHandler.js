const errorHandler = (logger) => {
    return (error, req, res, next) => {
        // Log the error
        logger.error('Error occurred:', {
            error: error.message,
            stack: error.stack,
            url: req.url,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        });

        // Default error response
        let statusCode = 500;
        let message = 'Internal Server Error';

        // Handle specific error types
        if (error.name === 'ValidationError') {
            statusCode = 400;
            message = 'Validation Error';
        } else if (error.name === 'CastError') {
            statusCode = 400;
            message = 'Invalid ID format';
        } else if (error.name === 'MongoError' && error.code === 11000) {
            statusCode = 409;
            message = 'Duplicate entry';
        } else if (error.name === 'JsonWebTokenError') {
            statusCode = 401;
            message = 'Invalid token';
        } else if (error.name === 'TokenExpiredError') {
            statusCode = 401;
            message = 'Token expired';
        } else if (error.name === 'UnauthorizedError') {
            statusCode = 401;
            message = 'Unauthorized';
        } else if (error.name === 'ForbiddenError') {
            statusCode = 403;
            message = 'Forbidden';
        } else if (error.name === 'NotFoundError') {
            statusCode = 404;
            message = 'Resource not found';
        } else if (error.name === 'ConflictError') {
            statusCode = 409;
            message = 'Resource conflict';
        } else if (error.name === 'RateLimitError') {
            statusCode = 429;
            message = 'Too many requests';
        }

        // Don't expose internal errors in production
        if (process.env.NODE_ENV === 'production' && statusCode === 500) {
            message = 'Internal Server Error';
        }

        // Send error response
        res.status(statusCode).json({
            error: {
                message,
                status: statusCode,
                timestamp: new Date().toISOString(),
                path: req.url,
                method: req.method
            }
        });
    };
};

module.exports = errorHandler;
