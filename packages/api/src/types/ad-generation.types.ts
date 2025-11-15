/**
 * Type definitions for Ad Generation functionality
 */

import { z } from "zod";

// ============================================================================
// Platform Types
// ============================================================================

export type PlatformId = "google" | "meta" | "linkedin" | "tiktok";

export interface PlatformConstraints {
	[key: string]: number;
}

export interface PlatformConfig {
	name: string;
	constraints: PlatformConstraints;
}

export interface GoogleAdFormat {
	headline1?: string;
	headline2?: string;
	headline3?: string;
	description1?: string;
	description2?: string;
}

export interface MetaAdFormat {
	primaryText?: string;
	headline?: string;
	description?: string;
}

export interface LinkedInAdFormat {
	introText?: string;
	headline?: string;
	description?: string;
}

export interface TikTokAdFormat {
	adText?: string;
	displayName?: string;
}

export type PlatformAdFormat =
	| GoogleAdFormat
	| MetaAdFormat
	| LinkedInAdFormat
	| TikTokAdFormat;

// ============================================================================
// Regional Types
// ============================================================================

export type LocaleCode =
	| "en-US"
	| "en-GB"
	| "es-MX"
	| "ja-JP"
	| "de-DE"
	| "fr-FR"
	| "ar-SA"
	| "hi-IN"
	| "pt-BR"
	| "zh-CN";

export type EmojiTolerance = "none" | "very-low" | "low" | "medium" | "high";
export type FormalityLevel = "very-formal" | "formal" | "casual";

export interface RegionConfig {
	tone: string;
	emojiTolerance: EmojiTolerance;
	formality: FormalityLevel;
	cta: string;
	culturalNotes?: string[];
}

// ============================================================================
// Product Types
// ============================================================================

export interface ProductDetails {
	name: string;
	category: string;
	features: string[];
	benefits: string[];
	targetAudience?: string;
	pricePoint?: string;
	uniqueSellingPoints?: string[];
}

// ============================================================================
// Translation Types
// ============================================================================

export interface TranslationResult {
	translation: string;
	culturalNotes: string;
	confidence?: number;
	alternatives?: string[];
}

export interface LocalizedAdVariant {
	locale: LocaleCode;
	translatedCopy: string;
	culturalNotes: string;
	platformAds: Record<PlatformId, PlatformAdFormat>;
	config: RegionConfig;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface AdGenerationRequest {
	baseCopy: string;
	productDetails: ProductDetails;
	targetLocales: LocaleCode[];
	targetPlatforms: PlatformId[];
	industry: string;
	brandVoice?: string;
	additionalContext?: string;
}

export interface AdGenerationResponse {
	success: boolean;
	results: LocalizedAdVariant[];
	timestamp: string;
	metadata?: {
		totalVariants: number;
		processingTimeMs: number;
	};
}

export interface LocaleInfo {
	code: LocaleCode;
	name: string;
	region: string;
	config: RegionConfig;
}

export interface PlatformInfo {
	id: PlatformId;
	name: string;
	constraints: PlatformConstraints;
}

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

const localeCodeEnum = z.enum([
	"en-US",
	"en-GB",
	"es-MX",
	"ja-JP",
	"de-DE",
	"fr-FR",
	"ar-SA",
	"hi-IN",
	"pt-BR",
	"zh-CN",
]);

const platformIdEnum = z.enum(["google", "meta", "linkedin", "tiktok"]);

export const productDetailsSchema = z.object({
	name: z.string().min(1, "Product name is required"),
	category: z.string().min(1, "Category is required"),
	features: z.array(z.string()).min(1, "At least one feature is required"),
	benefits: z.array(z.string()).min(1, "At least one benefit is required"),
	targetAudience: z.string().optional(),
	pricePoint: z.string().optional(),
	uniqueSellingPoints: z.array(z.string()).optional(),
});

export const adGenerationInputSchema = z.object({
	baseCopy: z
		.string()
		.min(10, "Base copy must be at least 10 characters")
		.max(1000, "Base copy must not exceed 1000 characters"),
	productDetails: productDetailsSchema,
	targetLocales: z
		.array(localeCodeEnum)
		.min(1, "At least one target locale is required"),
	targetPlatforms: z
		.array(platformIdEnum)
		.min(1, "At least one target platform is required"),
	industry: z.string().min(1, "Industry is required"),
	brandVoice: z.string().optional(),
	additionalContext: z.string().optional(),
});

export const translationOutputSchema = z.object({
	translation: z.string(),
	culturalNotes: z.string(),
	confidence: z.number().min(0).max(1).optional(),
	alternatives: z.array(z.string()).optional(),
});

export const platformAdSchema = z.object({
	headline1: z.string().optional(),
	headline2: z.string().optional(),
	headline3: z.string().optional(),
	description1: z.string().optional(),
	description2: z.string().optional(),
	primaryText: z.string().optional(),
	headline: z.string().optional(),
	description: z.string().optional(),
	introText: z.string().optional(),
	adText: z.string().optional(),
	displayName: z.string().optional(),
});
