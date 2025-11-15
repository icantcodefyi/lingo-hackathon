/**
 * Main ad generation orchestration service
 * Coordinates translation and platform formatting
 */

import type {
	AdGenerationRequest,
	LocalizedAdVariant,
	LocaleCode,
} from "../types/ad-generation.types";
import { getRegionConfig } from "../config/region.config";
import { getPlatformConfig, PLATFORM_CONFIGS } from "../config/platform.config";
import { translateAdCopy } from "./translation.service";
import { formatAdForPlatform } from "./platform-formatter.service";
import {
	validateLocales,
	validatePlatforms,
	validateProductDetails,
} from "../utils/validation-utils";
import { handleValidationError, logError } from "../utils/error-handler";

/**
 * Generate localized ads for multiple platforms and locales
 */
export async function generateAds(request: AdGenerationRequest) {
	const startTime = Date.now();

	// Validate inputs
	validateRequest(request);

	const results: LocalizedAdVariant[] = [];
	const errors: Array<{ locale: string; error: string }> = [];

	// Process each locale
	for (const locale of request.targetLocales) {
		try {
			const variant = await generateLocaleVariant(request, locale);
			results.push(variant);
		} catch (error) {
			logError(error, `generateAds for locale ${locale}`);
			errors.push({
				locale,
				error: error instanceof Error ? error.message : "Unknown error",
			});
			// Continue with other locales even if one fails
		}
	}

	// If all locales failed, throw error
	if (results.length === 0) {
		throw new Error(
			`Failed to generate ads for all locales: ${errors.map((e) => `${e.locale}: ${e.error}`).join(", ")}`,
		);
	}

	const processingTimeMs = Date.now() - startTime;

	return {
		success: true,
		results,
		timestamp: new Date().toISOString(),
		metadata: {
			totalVariants: results.length,
			processingTimeMs,
		},
	};
}

/**
 * Generate ad variant for a specific locale
 */
async function generateLocaleVariant(
	request: AdGenerationRequest,
	locale: LocaleCode,
) {
	// Get region configuration
	const regionConfig = getRegionConfig(locale);
	if (!regionConfig) {
		throw new Error(`Unsupported locale: ${locale}`);
	}

	// Step 1: Translate and culturally adapt the base copy
	const translationResult = await translateAdCopy({
		baseCopy: request.baseCopy,
		locale,
		productDetails: request.productDetails,
		regionConfig,
		brandVoice: request.brandVoice,
		additionalContext: request.additionalContext,
	});

	// Step 2: Format for each target platform
	const platformAds: Record<string, any> = {};

	for (const platformId of request.targetPlatforms) {
		const platformConfig = getPlatformConfig(platformId);
		if (!platformConfig) {
			console.warn(`Skipping unsupported platform: ${platformId}`);
			continue;
		}

		try {
			const formattedAd = await formatAdForPlatform({
				translatedCopy: translationResult.translation,
				platform: platformId,
				platformConfig,
				locale,
				regionConfig,
				productName: request.productDetails.name,
			});

			platformAds[platformId] = formattedAd;
		} catch (error) {
			logError(error, `formatAdForPlatform ${platformId} for ${locale}`);
			// Continue with other platforms even if one fails
			platformAds[platformId] = {
				error: "Failed to generate ad for this platform",
			};
		}
	}

	return {
		locale,
		translatedCopy: translationResult.translation,
		culturalNotes: translationResult.culturalNotes,
		platformAds,
		config: regionConfig,
	};
}

/**
 * Validate ad generation request
 */
function validateRequest(request: AdGenerationRequest) {
	const errors: string[] = [];

	// Validate base copy
	if (!request.baseCopy || request.baseCopy.trim().length === 0) {
		errors.push("Base copy is required");
	}

	if (request.baseCopy && request.baseCopy.length < 10) {
		errors.push("Base copy must be at least 10 characters");
	}

	if (request.baseCopy && request.baseCopy.length > 1000) {
		errors.push("Base copy must not exceed 1000 characters");
	}

	// Validate product details
	const productValidation = validateProductDetails(request.productDetails);
	if (!productValidation.valid) {
		errors.push(...productValidation.errors);
	}

	// Validate locales
	const localeValidation = validateLocales(request.targetLocales);
	if (!localeValidation.valid) {
		errors.push(...localeValidation.errors);
	}

	// Validate platforms
	const platformValidation = validatePlatforms(request.targetPlatforms);
	if (!platformValidation.valid) {
		errors.push(...platformValidation.errors);
	}

	// Validate industry
	if (!request.industry || request.industry.trim().length === 0) {
		errors.push("Industry is required");
	}

	if (errors.length > 0) {
		throw handleValidationError(errors, "ad generation request");
	}
}

/**
 * Get all supported locales with metadata
 */
export function getSupportedLocales() {
	const { REGION_CONFIGS } = require("../config/region.config");

	return Object.keys(REGION_CONFIGS).map((code) => {
		const parts = code.split("-");
		const languageCode = parts[0] || code;
		const regionCode = parts[1] || code;

		const languageDisplay = new Intl.DisplayNames(["en"], { type: "language" });
		const regionDisplay = new Intl.DisplayNames(["en"], { type: "region" });

		return {
			code,
			name: languageDisplay.of(languageCode) || languageCode,
			region: regionDisplay.of(regionCode) || regionCode,
			config: REGION_CONFIGS[code],
		};
	});
}

/**
 * Get all supported platforms with metadata
 */
export function getSupportedPlatforms() {
	return Object.entries(PLATFORM_CONFIGS).map(([id, config]) => ({
		id,
		name: config.name,
		constraints: config.constraints,
	}));
}

/**
 * Estimate generation cost and time
 */
export function estimateGeneration(request: AdGenerationRequest) {
	const localeCount = request.targetLocales.length;
	const platformCount = request.targetPlatforms.length;
	const totalGenerations = localeCount * (1 + platformCount); // 1 translation + N platform formats per locale

	// Rough estimates
	const tokensPerGeneration = 500; // Average tokens per API call
	const secondsPerGeneration = 3; // Average time per API call
	const costPerMillion = 5; // Approximate cost per million tokens in USD

	const estimatedTokens = totalGenerations * tokensPerGeneration;
	const estimatedTimeSeconds = totalGenerations * secondsPerGeneration;
	const estimatedCostUSD = (estimatedTokens / 1_000_000) * costPerMillion;

	return {
		estimatedTimeSeconds,
		estimatedTokens,
		estimatedCostUSD: Number.parseFloat(estimatedCostUSD.toFixed(4)),
	};
}
