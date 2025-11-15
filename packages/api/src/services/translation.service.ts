/**
 * Translation service for culturally-adapted ad copy
 * Handles translation and cultural localization using Lingo.dev SDK
 */

import { LingoDotDevEngine } from "lingo.dev/sdk";
import type {
	TranslationResult,
	LocaleCode,
	ProductDetails,
	RegionConfig,
} from "../types/ad-generation.types";
import {
	handleGenerationError,
	retryWithBackoff,
} from "../utils/error-handler";

/**
 * Initialize Lingo.dev SDK instance
 */
const getLingoEngine = (() => {
	let engine: LingoDotDevEngine | null = null;
	return () => {
		if (!engine) {
			const apiKey = process.env.LINGODOTDEV_API_KEY;
			if (!apiKey) {
				throw new Error(
					"LINGODOTDEV_API_KEY environment variable is required",
				);
			}
			engine = new LingoDotDevEngine({
				apiKey,
				batchSize: 100,
				idealBatchItemSize: 1000,
			});
		}
		return engine;
	};
})();

/**
 * Convert locale code from format "en-US" to "en" for Lingo.dev
 */
function convertLocaleForLingo(locale: LocaleCode): string {
	// Extract language code from locale (e.g., "en-US" -> "en")
	const languageCode = locale.split("-")[0];
	if (!languageCode) {
		throw new Error(`Invalid locale format: ${locale}`);
	}
	return languageCode.toLowerCase();
}

/**
 * Get source locale for translation
 * Base copy is always assumed to be in English
 */
function getSourceLocale(): string {
	// Base copy is always in English, so source is always "en"
	return "en";
}

/**
 * Translate and culturally adapt ad copy using Lingo.dev
 */
export async function translateAdCopy(params: {
	baseCopy: string;
	locale: LocaleCode;
	productDetails: ProductDetails;
	regionConfig: RegionConfig;
	brandVoice?: string;
	additionalContext?: string;
}) {
	const {
		baseCopy,
		locale,
		productDetails: _productDetails, // Keep for API compatibility but not used in Lingo.dev translation
		regionConfig,
		brandVoice,
		additionalContext,
	} = params;

	try {
		const lingoEngine = getLingoEngine();
		const sourceLocale = getSourceLocale();
		const targetLocale = convertLocaleForLingo(locale);

		// Use Lingo.dev to translate the text
		const translatedText = await retryWithBackoff(
			async () => {
				return await lingoEngine.localizeText(baseCopy, {
					sourceLocale,
					targetLocale,
					fast: false, // Prioritize quality for ad copy
				});
			},
			3, // maxRetries
		);

		// Generate cultural notes based on region config and adaptations
		const culturalNotes = buildCulturalNotes({
			regionConfig,
			originalCopy: baseCopy,
			translatedCopy: translatedText,
			brandVoice,
			additionalContext,
		});

		const result: TranslationResult = {
			translation: translatedText,
			culturalNotes,
			confidence: 0.9, // Lingo.dev provides high-quality translations
		};

		return result;
	} catch (error) {
		throw handleGenerationError(error, `translation to ${locale}`);
	}
}

/**
 * Build cultural notes based on region config and translation
 */
function buildCulturalNotes(params: {
	regionConfig: RegionConfig;
	originalCopy: string;
	translatedCopy: string;
	brandVoice?: string;
	additionalContext?: string;
}): string {
	const { regionConfig, brandVoice, additionalContext } = params;

	const notes: string[] = [];

	// Add region-specific cultural notes
	if (regionConfig.culturalNotes && regionConfig.culturalNotes.length > 0) {
		notes.push(...regionConfig.culturalNotes);
	}

	// Add tone and formality information
	notes.push(`Translation adapted for ${regionConfig.tone} tone`);
	notes.push(`Formality level: ${regionConfig.formality}`);
	notes.push(`Emoji tolerance: ${regionConfig.emojiTolerance}`);

	// Add brand voice context if provided
	if (brandVoice) {
		notes.push(`Brand voice considerations: ${brandVoice}`);
	}

	// Add additional context if provided
	if (additionalContext) {
		notes.push(`Additional context: ${additionalContext}`);
	}



	return notes.join(". ") + ".";
}

/**
 * Batch translate multiple ad copies using Lingo.dev
 */
export async function batchTranslate(
	copies: string[],
	locale: LocaleCode,
	productDetails: ProductDetails, // Keep for API compatibility but not used in Lingo.dev translation
	regionConfig: RegionConfig,
) {
	// productDetails is kept for API compatibility but not used in Lingo.dev translation
	void productDetails;
	try {
		const lingoEngine = getLingoEngine();
		const sourceLocale = getSourceLocale();
		const targetLocale = convertLocaleForLingo(locale);

		// Use Lingo.dev batch translation for efficiency
		const translatedTexts = await retryWithBackoff(
			async () => {
				// Translate all copies in parallel using batchLocalizeText
				const results = await Promise.all(
					copies.map((copy) =>
						lingoEngine.localizeText(copy, {
							sourceLocale,
							targetLocale,
							fast: false,
						}),
					),
				);
				return results;
			},
			3, // maxRetries
		);

		// Build translation results with cultural notes
		const translations: TranslationResult[] = translatedTexts.map(
			(translatedText, index) => {
				const originalCopy = copies[index];
				if (!originalCopy) {
					throw new Error(`Missing original copy at index ${index}`);
				}
				const culturalNotes = buildCulturalNotes({
					regionConfig,
					originalCopy,
					translatedCopy: translatedText,
				});

				return {
					translation: translatedText,
					culturalNotes,
					confidence: 0.9,
				};
			},
		);

		return translations;
	} catch (error) {
		throw handleGenerationError(error, `batch translation to ${locale}`);
	}
}

/**
 * Validate translation quality
 */
export function validateTranslation(original: string, translation: string) {
	const issues: string[] = [];
	let score = 100;

	// Check if translation is empty
	if (!translation || translation.trim().length === 0) {
		issues.push("Translation is empty");
		return { valid: false, issues, score: 0 };
	}

	// Check if translation is identical to original (possible error)
	if (original === translation) {
		issues.push("Translation appears identical to original");
		score -= 30;
	}

	// Check for reasonable length (translation should be within 50-200% of original)
	const lengthRatio = translation.length / original.length;
	if (lengthRatio < 0.5 || lengthRatio > 2.0) {
		issues.push("Translation length seems unusual");
		score -= 20;
	}

	// Check for untranslated common English words (very basic check)
	const commonEnglishWords = [
		"the",
		"and",
		"or",
		"but",
		"click",
		"here",
		"buy",
		"now",
	];
	const untranslatedWords = commonEnglishWords.filter((word) =>
		new RegExp(`\\b${word}\\b`, "i").test(translation),
	);

	if (untranslatedWords.length > 2) {
		issues.push(`Possibly untranslated words: ${untranslatedWords.join(", ")}`);
		score -= 15;
	}

	return {
		valid: issues.length === 0,
		issues,
		score: Math.max(0, score),
	};
}
