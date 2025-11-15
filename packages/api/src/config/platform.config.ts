/**
 * Platform-specific configurations and constraints
 * Based on official platform advertising guidelines
 */

import type { PlatformConfig, PlatformId } from "../types/ad-generation.types";

/**
 * Character limits and formatting rules for each advertising platform
 * Updated as of 2024 based on official documentation
 */
export const PLATFORM_CONFIGS: Record<PlatformId, PlatformConfig> = {
	google: {
		name: "Google Ads",
		constraints: {
			headline1: 30,
			headline2: 30,
			headline3: 30,
			description1: 90,
			description2: 90,
		},
	},
	meta: {
		name: "Facebook/Instagram Ads",
		constraints: {
			primaryText: 125, // Recommended for best performance
			headline: 40,
			description: 30,
		},
	},
	linkedin: {
		name: "LinkedIn Ads",
		constraints: {
			introText: 600,
			headline: 70,
			description: 100,
		},
	},
	tiktok: {
		name: "TikTok Ads",
		constraints: {
			adText: 100,
			displayName: 40,
		},
	},
};

/**
 * Platform-specific best practices and formatting guidelines
 */
export const PLATFORM_BEST_PRACTICES: Record<
	PlatformId,
	{
		toneGuidelines: string[];
		contentRules: string[];
		ctaFormat: string;
	}
> = {
	google: {
		toneGuidelines: [
			"Direct and clear messaging",
			"Focus on benefits over features",
			"Include specific numbers when possible",
		],
		contentRules: [
			"Avoid excessive punctuation",
			"No gimmicky formatting",
			"Include keywords naturally",
		],
		ctaFormat: "Action-oriented, specific",
	},
	meta: {
		toneGuidelines: [
			"Conversational and engaging",
			"Visual storytelling compatible",
			"Emotional connection focus",
		],
		contentRules: [
			"Mobile-first formatting",
			"Short paragraphs",
			"Emoji usage appropriate",
		],
		ctaFormat: "Social proof incorporated",
	},
	linkedin: {
		toneGuidelines: [
			"Professional and authoritative",
			"Industry-specific language",
			"B2B focus",
		],
		contentRules: [
			"Longer form acceptable",
			"Data and statistics valued",
			"Professional tone mandatory",
		],
		ctaFormat: "Value proposition clear",
	},
	tiktok: {
		toneGuidelines: [
			"Authentic and relatable",
			"Trend-aware",
			"Entertainment value",
		],
		contentRules: [
			"Ultra-concise messaging",
			"Youth culture awareness",
			"Video-first mindset",
		],
		ctaFormat: "Casual and inviting",
	},
};

/**
 * Get platform configuration by ID
 */
export function getPlatformConfig(platformId: string) {
	return PLATFORM_CONFIGS[platformId as PlatformId] || null;
}

/**
 * Get all supported platform IDs
 */
export function getSupportedPlatforms() {
	return Object.keys(PLATFORM_CONFIGS) as PlatformId[];
}

/**
 * Validate if a platform ID is supported
 */
export function isPlatformSupported(platformId: string) {
	return platformId in PLATFORM_CONFIGS;
}
