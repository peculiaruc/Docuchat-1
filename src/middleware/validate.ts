import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate = (schema: z.ZodType) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!result.success) {
            const errors = result.error.issues.map((err) => ({
                field: err.path.slice(1).join("."),
                message: err.message,
            }));

            return res.status(400).json({
                success: false,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "Validation failed",
                    details: errors,
                },
            });
        }

        const data = result.data as {
            params?: Request["params"];
            query?: unknown;
            body?: unknown;
        };

        if (data.params) req.params = data.params;
        if (data.body !== undefined) req.body = data.body;
        req.validatedQuery = data.query;

        next();
    };
};
