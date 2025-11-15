/**
 * Platform-specific ad formatting service
 * Converts translated copy into platform-specific ad formats
 */

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import type {
	PlatformId,
	PlatformAdFormat,
	PlatformConfig,
	RegionConfig,
	LocaleCode,
} from "../types/ad-generation.types";
import { platformAdSchema } from "../types/ad-generation.types";
import { PLATFORM_BEST_PRACTICES } from "../config/platform.config";
import {
	handleGenerationError,
	retryWithBackoff,
} from "../utils/error-handler";
import { validateAdCopy } from "../utils/validation-utils";

/**
 * Platform formatter configuration
 */
const FORMATTER_CONFIG = {
	model: "gpt-4o",
	maxRetries: 3,
};

/**
 * Format ad copy for a specific platform
 */
export async function formatAdForPlatform(params: {
	translatedCopy: string;
	platform: PlatformId;
	platformConfig: PlatformConfig;
	locale: LocaleCode;
	regionConfig: RegionConfig;
	productName: string;
	additionalGuidelines?: string;
}) {
	const {
		translatedCopy,
		platform,
		platformConfig,
		locale,
		regionConfig,
		productName,
		additionalGuidelines,
	} = params;

	try {
		const result = await retryWithBackoff(async () => {
			const { object } = await generateObject({
				model: openai(FORMATTER_CONFIG.model),
				schema: platformAdSchema,
				prompt: buildFormatterPrompt({
					translatedCopy,
					platform,
					platformConfig,
					locale,
					regionConfig,
					productName,
					additionalGuidelines,
				}),
			});

			return object;
		}, FORMATTER_CONFIG.maxRetries);

		// Validate the generated ad against constraints
		const validation = validateAdCopy(
			result as Record<string, string>,
			platformConfig.constraints,
		);

		if (!validation.valid) {
			console.warn(
				`Ad format validation warnings for ${platform}:`,
				validation.errors,
			);
			// Could attempt to regenerate or truncate here
		}

		return result;
	} catch (error) {
		throw handleGenerationError(
			error,
			`formatting ad for ${platformConfig.name}`,
		);
	}
}

/**
 * Build the formatting prompt for the AI
 */
function buildFormatterPrompt(params: {
	translatedCopy: string;
	platform: PlatformId;
	platformConfig: PlatformConfig;
	locale: LocaleCode;
	regionConfig: RegionConfig;
	productName: string;
	additionalGuidelines?: string;
}): string {
	const {
		translatedCopy,
		platform,
		platformConfig,
		locale,
		regionConfig,
		productName,
		additionalGuidelines,
	} = params;

	const bestPractices = PLATFORM_BEST_PRACTICES[platform];

	return `You are an expert at creating ${platformConfig.name} advertisements that convert.

## Base Translated Copy
"${translatedCopy}"

## Product
${productName}

## Target Market
Locale: ${locale}
Cultural Tone: ${regionConfig.tone}
Call-to-Action: "${regionConfig.cta}"

## Platform: ${platformConfig.name}

### Character Constraints (STRICT - DO NOT EXCEED)
${Object.entries(platformConfig.constraints)
	.map(([field, limit]) => `- ${field}: Maximum ${limit} characters`)
	.join("\n")}

### Best Practices for ${platformConfig.name}
**Tone Guidelines:**
${bestPractices.toneGuidelines.map((guideline) => `- ${guideline}`).join("\n")}

**Content Rules:**
${bestPractices.contentRules.map((rule) => `- ${rule}`).join("\n")}

**CTA Format:** ${bestPractices.ctaFormat}

${additionalGuidelines ? `### Additional Guidelines\n${additionalGuidelines}\n` : ""}

## Your Mission
1. **Respect Character Limits**: NEVER exceed the specified character counts for each field
2. **Include Strong CTA**: Incorporate "${regionConfig.cta}" or culturally equivalent
3. **Highlight Benefits**: Focus on key benefits, not just features
4. **Follow Platform Best Practices**: Adhere to ${platformConfig.name} specific guidelines
5. **Maintain Cultural Tone**: Keep the tone consistent with ${locale} expectations
6. **Be Concise**: Use every character wisely - cut fluff, keep power words
7. **Test Each Field**: Count characters to ensure you're within limits

## Format-Specific Tips

${getFormatSpecificTips(platform)}

Generate a complete, platform-optimized ad with ALL required fields populated.
Each field must be complete, compelling, and within character limits.`;
}

/**
 * Get format-specific tips for each platform
 */
function getFormatSpecificTips(platform: PlatformId): string {
	const tips: Record<PlatformId, string> = {
		google: `**Google Ads Tips:**
- Use all 3 headlines to test different angles
- Include keywords naturally in headlines
- Descriptions should complement each other, not repeat
- First headline is most important - make it count
- Use numbers and statistics when possible`,

		meta: `**Facebook/Instagram Ads Tips:**
- Primary text is the hook - make it scroll-stopping
- Headline should be punchy and benefit-focused
- Description adds urgency or social proof
- Think mobile-first (users are scrolling fast)
- Emoji can work well if culturally appropriate`,

		linkedin: `**LinkedIn Ads Tips:**
- Intro text can be longer - use it to tell a story
- Professional tone is crucial
- Include data and statistics for credibility
- Speak to business outcomes and ROI
- Use industry-specific language`,

		tiktok: `**TikTok Ads Tips:**
- Ad text is ultra-concise - every word matters
- Display name should be memorable and branded
- Think like native TikTok content, not traditional ads
- Casual, authentic tone works best
- Assume video is the star, text is supporting`,
	};

	return tips[platform];
}

/**
 * Batch format ads for multiple platforms
 */
export async function batchFormatAds(
	translatedCopy: string,
	platforms: PlatformId[],
	platformConfigs: Record<PlatformId, PlatformConfig>,
	locale: LocaleCode,
	regionConfig: RegionConfig,
	productName: string,
) {
	const results: Record<string, PlatformAdFormat> = {};

	// Process platforms in parallel for better performance
	await Promise.all(
		platforms.map(async (platform) => {
			const platformConfig = platformConfigs[platform];
			if (!platformConfig) return;

			const formattedAd = await formatAdForPlatform({
				translatedCopy,
				platform,
				platformConfig,
				locale,
				regionConfig,
				productName,
			});

			results[platform] = formattedAd;
		}),
	);

	return results;
}

/**
 * Optimize ad copy for character constraints
 */
export function optimizeForLength(text: string, maxLength: number) {
	if (text.length <= maxLength) {
		return { optimized: text, wasOptimized: false };
	}

	// Try to intelligently truncate
	const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

	// Try to fit complete sentences
	let optimized = "";
	for (const sentence of sentences) {
		const withSentence = optimized + sentence.trim() + ".";
		if (withSentence.length <= maxLength) {
			optimized = withSentence;
		} else {
			break;
		}
	}

	// If no complete sentences fit, truncate with ellipsis
	if (!optimized) {
		optimized = text.substring(0, maxLength - 3).trim() + "...";
	}

	return {
		optimized: optimized || text.substring(0, maxLength),
		wasOptimized: true,
	};
}

/**
 * Calculate ad format quality score
 */
export function calculateAdQualityScore(
	adFormat: PlatformAdFormat,
	constraints: PlatformConfig["constraints"],
) {
	const issues: string[] = [];
	const recommendations: string[] = [];
	let score = 100;

	const adObject = adFormat as Record<string, string | undefined>;

	// Check character limits
	for (const [field, value] of Object.entries(adObject)) {
		if (value && constraints[field]) {
			const maxLength = constraints[field];
			const utilization = (value.length / maxLength) * 100;

			if (value.length > maxLength) {
				issues.push(
					`${field} exceeds limit by ${value.length - maxLength} chars`,
				);
				score -= 20;
			} else if (utilization < 50) {
				recommendations.push(
					`${field} only uses ${Math.round(utilization)}% of available space`,
				);
				score -= 5;
			}
		}
	}

	// Check for empty required fields
	const emptyFields = Object.entries(adObject).filter(
		([_, value]) => !value || value.trim().length === 0,
	);
	if (emptyFields.length > 0) {
		issues.push(`Empty fields: ${emptyFields.map(([k]) => k).join(", ")}`);
		score -= emptyFields.length * 10;
	}

	return {
		score: Math.max(0, score),
		issues,
		recommendations,
	};
}
