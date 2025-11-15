/**
 * Centralized error handling utilities
 */

import { ORPCError } from "@orpc/server";

/**
 * Standard error codes for the API
 */
export enum ErrorCode {
	VALIDATION_ERROR = "VALIDATION_ERROR",
	NOT_FOUND = "NOT_FOUND",
	UNAUTHORIZED = "UNAUTHORIZED",
	FORBIDDEN = "FORBIDDEN",
	RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
	EXTERNAL_API_ERROR = "EXTERNAL_API_ERROR",
	COMPLIANCE_VIOLATION = "COMPLIANCE_VIOLATION",
	GENERATION_FAILED = "GENERATION_FAILED",
	INTERNAL_ERROR = "INTERNAL_ERROR",
}

/**
 * Create a standardized API error
 */
export function createError(code: ErrorCode, message: string) {
	const errorMessages: Record<ErrorCode, string> = {
		[ErrorCode.VALIDATION_ERROR]: "BAD_REQUEST",
		[ErrorCode.NOT_FOUND]: "NOT_FOUND",
		[ErrorCode.UNAUTHORIZED]: "UNAUTHORIZED",
		[ErrorCode.FORBIDDEN]: "FORBIDDEN",
		[ErrorCode.RATE_LIMIT_EXCEEDED]: "TOO_MANY_REQUESTS",
		[ErrorCode.EXTERNAL_API_ERROR]: "INTERNAL_SERVER_ERROR",
		[ErrorCode.COMPLIANCE_VIOLATION]: "BAD_REQUEST",
		[ErrorCode.GENERATION_FAILED]: "INTERNAL_SERVER_ERROR",
		[ErrorCode.INTERNAL_ERROR]: "INTERNAL_SERVER_ERROR",
	};

	const orpcCode = errorMessages[code] || "INTERNAL_SERVER_ERROR";

	// Create error with custom message
	const error = new ORPCError(orpcCode);
	error.message = `${message}`;
	return error;
}

/**
 * Handle external API errors
 */
export function handleExternalApiError(error: unknown, apiName: string) {
	console.error(`External API Error (${apiName}):`, error);

	if (error instanceof Error) {
		return createError(
			ErrorCode.EXTERNAL_API_ERROR,
			`Failed to communicate with ${apiName}: ${error.message}`,
		);
	}

	return createError(
		ErrorCode.EXTERNAL_API_ERROR,
		`Failed to communicate with ${apiName}`,
	);
}

/**
 * Handle validation errors
 */
export function handleValidationError(errors: string[], context?: string) {
	const message = context
		? `Validation failed for ${context}: ${errors.join(", ")}`
		: `Validation failed: ${errors.join(", ")}`;

	return createError(ErrorCode.VALIDATION_ERROR, message);
}

/**
 * Handle AI generation errors
 */
export function handleGenerationError(error: unknown, stage: string) {
	console.error(`Generation Error (${stage}):`, error);

	if (error instanceof Error) {
		return createError(
			ErrorCode.GENERATION_FAILED,
			`Ad generation failed at ${stage}: ${error.message}`,
		);
	}

	return createError(
		ErrorCode.GENERATION_FAILED,
		`Ad generation failed at ${stage}`,
	);
}

/**
 * Handle compliance check errors
 */
export function handleComplianceError(error: unknown, context?: string) {
	console.error("Compliance Check Error:", error);

	if (error instanceof Error) {
		return createError(
			ErrorCode.COMPLIANCE_VIOLATION,
			context
				? `Compliance check failed for ${context}: ${error.message}`
				: `Compliance check failed: ${error.message}`,
		);
	}

	return createError(
		ErrorCode.COMPLIANCE_VIOLATION,
		context
			? `Compliance check failed for ${context}`
			: "Compliance check failed",
	);
}

/**
 * Safe error logging
 */
export function logError(error: unknown, context: string) {
	const timestamp = new Date().toISOString();
	console.error(`[${timestamp}] Error in ${context}:`, error);

	// In production, you might want to send this to a logging service
	if (process.env.NODE_ENV === "production") {
		// Example: Send to logging service
		// loggingService.error({ context, error, timestamp });
	}
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown) {
	if (error instanceof ORPCError) {
		const retryableCodes = [
			"TOO_MANY_REQUESTS",
			"TIMEOUT",
			"INTERNAL_SERVER_ERROR",
		];
		return retryableCodes.includes(error.code);
	}

	if (error instanceof Error) {
		// Network errors are typically retryable
		return (
			error.message.includes("ECONNRESET") ||
			error.message.includes("ETIMEDOUT") ||
			error.message.includes("ENOTFOUND")
		);
	}

	return false;
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries = 3,
	initialDelay = 1000,
) {
	let lastError: unknown;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			if (!isRetryableError(error) || attempt === maxRetries - 1) {
				throw error;
			}

			const delay = initialDelay * 2 ** attempt;
			console.log(
				`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
			);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	throw lastError;
}
