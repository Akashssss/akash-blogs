import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    // Handle MongoDB duplicate key error (code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
        error = new ApiError(409, `${field.replace('personal_info.', '')} already exists.`);
    }

    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors || [],
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    };

    return res.status(error.statusCode || 500).json(response);
};

export default errorHandler;
