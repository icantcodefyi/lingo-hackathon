/**
 * Validation utilities for ad generation and compliance
 */

import { isPlatformSupported } from "../config/platform.config";
import { isLocaleSupported } from "../config/region.config";
import type { PlatformConstraints } from "../types/ad-generation.types";

/**
 * Validation result interface
 */
export interface ValidationResult {
	valid: boolean;
	errors: string[];
}

/**
 * Validate locale codes
 */
export function validateLocales(locales: string[]) {
	const errors: string[] = [];

	if (!locales || locales.length === 0) {
		errors.push("At least one locale must be specified");
		return { valid: false, errors };
	}

	for (const locale of locales) {
		if (!isLocaleSupported(locale)) {
			errors.push(`Unsupported locale: ${locale}`);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Validate platform IDs
 */
export function validatePlatforms(platforms: string[]) {
	const errors: string[] = [];

	if (!platforms || platforms.length === 0) {
		errors.push("At least one platform must be specified");
		return { valid: false, errors };
	}

	for (const platform of platforms) {
		if (!isPlatformSupported(platform)) {
			errors.push(`Unsupported platform: ${platform}`);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Validate ad copy against platform constraints
 */
export function validateAdCopy(
	adCopy: Record<string, string>,
	constraints: PlatformConstraints,
) {
	const errors: string[] = [];

	for (const [field, value] of Object.entries(adCopy)) {
		if (value && constraints[field]) {
			const maxLength = constraints[field];
			if (value.length > maxLength) {
				errors.push(
					`${field} exceeds maximum length of ${maxLength} (current: ${value.length})`,
				);
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Validate email format
 */
export function isValidEmail(email: string) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string) {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validate industry type
 */
export function validateIndustry(industry: string) {
	const validIndustries = [
		"finance",
		"crypto",
		"health",
		"weight-loss",
		"technology",
		"retail",
		"education",
		"real-estate",
		"general",
	];

	if (!industry || industry.trim().length === 0) {
		return {
			valid: false,
			errors: ["Industry must be specified"],
		};
	}

	if (!validIndustries.includes(industry.toLowerCase())) {
		return {
			valid: true, // Allow other industries but with warning
			errors: [
				`Industry '${industry}' not recognized. Using general compliance rules.`,
			],
		};
	}

	return { valid: true, errors: [] };
}

/**
 * Validate product details completeness
 */
export function validateProductDetails(product: {
	name?: string;
	category?: string;
	features?: string[];
	benefits?: string[];
}) {
	const errors: string[] = [];

	if (!product.name || product.name.trim().length === 0) {
		errors.push("Product name is required");
	}

	if (!product.category || product.category.trim().length === 0) {
		errors.push("Product category is required");
	}

	if (!product.features || product.features.length === 0) {
		errors.push("At least one product feature is required");
	}

	if (!product.benefits || product.benefits.length === 0) {
		errors.push("At least one product benefit is required");
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Sanitize and validate string input
 */
export function sanitizeString(input: string, maxLength?: number) {
	let sanitized = input.trim();
	let hadIssues = false;

	// Remove potential XSS vectors
	if (/<script|javascript:|onerror=/i.test(sanitized)) {
		sanitized = sanitized.replace(/<script|javascript:|onerror=/gi, "");
		hadIssues = true;
	}

	// Normalize whitespace
	if (/\s{2,}/.test(sanitized)) {
		sanitized = sanitized.replace(/\s+/g, " ");
		hadIssues = true;
	}

	// Apply length limit if specified
	if (maxLength && sanitized.length > maxLength) {
		sanitized = sanitized.substring(0, maxLength);
		hadIssues = true;
	}

	return { sanitized, hadIssues };
}
