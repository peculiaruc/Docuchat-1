export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;
    public readonly details?: any;

    constructor(
        message: string,
        code: string,
        statusCode: number,
        details?: any
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends ApiError {
    constructor(message: string, details?: any) {
        super(message, 'VALIDATION_ERROR', 400, details);
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message = 'Authentication required') {
        super(message, 'UNAUTHORIZED', 401);
    }
}

export class ForbiddenError extends ApiError {
    constructor(message = 'Access denied') {
        super(message, 'FORBIDDEN', 403);
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string, details?: any) {
        super(message, 'NOT_FOUND', 404, details);
    }
}

export class ConflictError extends ApiError {
    constructor(message: string, details?: any) {
        super(message, 'CONFLICT', 409, details);
    }
}

export class InternalServerError extends ApiError {
    constructor(message: string, details?: any) {
        super(message, 'INTERNAL_SERVER_ERROR', 500, details);
    }
}
