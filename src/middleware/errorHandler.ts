import type { ErrorRequestHandler } from "express";
import { logger } from "../lib/logger.js";
import { ApiError } from "../lib/errors.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ApiError) {
    logger.warn(
      err.details ? { details: err.details } : {},
      `[${err.code}] ${err.message}`
    );

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.isOperational ? err.code : "INTERNAL_SERVER_ERROR",
        message: err.isOperational ? err.message : "Internal Server Error",
        ...(err.details && err.isOperational ? { details: err.details } : {}),
      },
    });
  }

  logger.error({
    err,
    method: req.method,
    url: req.url,
  });

  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected error occurred",
    },
  });
};
