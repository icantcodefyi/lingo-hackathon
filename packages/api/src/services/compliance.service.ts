/**
 * Main compliance orchestration service
 * Coordinates pattern validation and AI analysis
 */

import type {
	ComplianceCheckRequest,
	ComplianceCheckResult,
} from "../types/compliance.types";
import { handleValidationError, logError } from "../utils/error-handler";
import { analyzeComplianceWithAI } from "./compliance-ai.service";
import {
	calculateComplianceScore,
	isSafeToPublish,
	validateCompliance,
} from "./compliance-validator.service";

/**
 * Perform comprehensive compliance check
 */
export async function checkCompliance(request: ComplianceCheckRequest) {
	const startTime = Date.now();

	// Validate inputs
	validateComplianceRequest(request);

	try {
		// Step 1: Pattern-based validation
		const { issues: patternMatchedIssues } = validateCompliance({
			adCopy: request.adCopy,
			locale: request.locale,
			platform: request.platform,
			industry: request.industry,
			strictMode: request.strictMode,
		});

		// Step 2: AI-powered deep analysis
		const aiAnalysis = await analyzeComplianceWithAI({
			adCopy: request.adCopy,
			locale: request.locale,
			platform: request.platform,
			industry: request.industry,
			patternMatchedIssues,
			strictMode: request.strictMode,
		});

		// Step 3: Calculate metadata
		const _complianceScore = calculateComplianceScore(patternMatchedIssues);
		const _publishStatus = isSafeToPublish(
			patternMatchedIssues,
			!request.strictMode,
		);

		const processingTimeMs = Date.now() - startTime;

		return {
			success: true,
			adCopy: request.adCopy,
			locale: request.locale,
			platform: request.platform,
			industry: request.industry,
			patternMatchedIssues,
			aiAnalysis,
			timestamp: new Date().toISOString(),
			metadata: {
				totalIssues: patternMatchedIssues.length + aiAnalysis.issues.length,
				criticalIssues: [...patternMatchedIssues, ...aiAnalysis.issues].filter(
					(issue) => issue.severity === "high",
				).length,
				processingTimeMs,
			},
		};
	} catch (error) {
		logError(error, "checkCompliance");
		throw error;
	}
}

/**
 * Validate compliance check request
 */
function validateComplianceRequest(request: ComplianceCheckRequest) {
	const errors: string[] = [];

	// Validate ad copy
	if (!request.adCopy || request.adCopy.trim().length === 0) {
		errors.push("Ad copy is required");
	}

	if (request.adCopy && request.adCopy.length > 5000) {
		errors.push("Ad copy must not exceed 5000 characters");
	}

	// Validate locale
	if (!request.locale || request.locale.trim().length === 0) {
		errors.push("Locale is required");
	}

	// Validate platform
	if (!request.platform || request.platform.trim().length === 0) {
		errors.push("Platform is required");
	}

	// Validate industry
	if (!request.industry || request.industry.trim().length === 0) {
		errors.push("Industry is required");
	}

	if (errors.length > 0) {
		throw handleValidationError(errors, "compliance check request");
	}
}

/**
 * Get compliance rules for specific parameters
 */
export function getComplianceRules(params: {
	locale?: string;
	platform?: string;
	industry?: string;
}) {
	const { locale, platform, industry } = params;

	const {
		PLATFORM_RULES,
		COUNTRY_RULES,
		INDUSTRY_RULES,
	} = require("../config/compliance-rules.config");

	const rules: {
		platform: Record<string, unknown> | unknown[];
		country: Record<string, unknown> | unknown[];
		industry: Record<string, unknown> | unknown[];
	} = {
		platform: {},
		country: {},
		industry: {},
	};

	// Get platform rules
	if (platform) {
		rules.platform = PLATFORM_RULES[platform] || [];
	} else {
		rules.platform = PLATFORM_RULES;
	}

	// Get country rules
	if (locale) {
		rules.country = COUNTRY_RULES[locale] || null;
	} else {
		rules.country = COUNTRY_RULES;
	}

	// Get industry rules
	if (industry) {
		rules.industry = INDUSTRY_RULES[industry] || [];
	} else {
		rules.industry = INDUSTRY_RULES;
	}

	return rules;
}

/**
 * Batch compliance checks for multiple ad copies
 */
export async function batchCheckCompliance(requests: ComplianceCheckRequest[]) {
	const results = await Promise.all(
		requests.map(async (request) => {
			try {
				return await checkCompliance(request);
			} catch (error) {
				logError(error, `batchCheckCompliance for ${request.platform}`);
				// Return error result
				return {
					success: false,
					adCopy: request.adCopy,
					locale: request.locale,
					platform: request.platform,
					industry: request.industry,
					patternMatchedIssues: [],
					aiAnalysis: {
						issues: [],
						overallRisk: "high" as const,
						autoFixedCopy: request.adCopy,
						explanation: `Error processing compliance check: ${error instanceof Error ? error.message : "Unknown error"}`,
					},
					timestamp: new Date().toISOString(),
				} as ComplianceCheckResult;
			}
		}),
	);

	return results;
}

/**
 * Compare compliance across different locales/platforms
 */
export async function compareCompliance(params: {
	adCopy: string;
	locales: string[];
	platforms: string[];
	industry: string;
}) {
	const { adCopy, locales, platforms, industry } = params;

	// Generate all combinations
	const requests: ComplianceCheckRequest[] = [];
	for (const locale of locales) {
		for (const platform of platforms) {
			requests.push({
				adCopy,
				locale,
				platform,
				industry,
			});
		}
	}

	const results = await batchCheckCompliance(requests);

	// Analyze results to find safest options
	const localeScores = new Map<string, number>();
	const platformScores = new Map<string, number>();

	for (const result of results) {
		const score = calculateComplianceScore(result.patternMatchedIssues);
		localeScores.set(
			result.locale,
			(localeScores.get(result.locale) || 0) + score,
		);
		platformScores.set(
			result.platform,
			(platformScores.get(result.platform) || 0) + score,
		);
	}

	const safestLocale =
		Array.from(localeScores.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
		"unknown";
	const safestPlatform =
		Array.from(platformScores.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
		"unknown";

	// Calculate overall risk
	const avgScore =
		results.reduce(
			(sum, r) => sum + calculateComplianceScore(r.patternMatchedIssues),
			0,
		) / results.length;
	const overallRisk = avgScore > 80 ? "low" : avgScore > 60 ? "medium" : "high";

	return {
		results,
		summary: {
			safestLocale,
			safestPlatform,
			overallRisk,
		},
	};
}
