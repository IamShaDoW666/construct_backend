import { Response } from "express";
import type { BaseResponse } from "@/types";

// Success Response
export function sendSuccess<T>(res: Response, data: T, message = "Success", statusCode = 200) {
  const response: BaseResponse<T> = {
    status: true,
    statusCode,
    data,
    message,
  };
  return res.status(statusCode).json(response);
}

// Error Response
export function sendError(res: Response, message = "Something went wrong", statusCode = 500, error?: any) {
  const response: BaseResponse = {
    status: false,
    statusCode,
    message,
    error,
  };
  return res.status(statusCode).json(response);
}
