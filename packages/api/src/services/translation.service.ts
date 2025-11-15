/**
 * Translation service for culturally-adapted ad copy
 * Handles translation and cultural localization
 */

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import type {
	TranslationResult,
	LocaleCode,
	ProductDetails,
	RegionConfig,
} from "../types/ad-generation.types";
import { translationOutputSchema } from "../types/ad-generation.types";
import {
	handleExternalApiError,
	handleGenerationError,
	retryWithBackoff,
} from "../utils/error-handler";

/**
 * Translation service configuration
 */
const TRANSLATION_CONFIG = {
	model: "gpt-4o",
	maxRetries: 3,
	timeout: 30000,
};

/**
 * Translate and culturally adapt ad copy
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
		productDetails,
		regionConfig,
		brandVoice,
		additionalContext,
	} = params;

	try {
		const result = await retryWithBackoff(async () => {
			const { object } = await generateObject({
				model: openai(TRANSLATION_CONFIG.model),
				schema: translationOutputSchema,
				prompt: buildTranslationPrompt({
					baseCopy,
					locale,
					productDetails,
					regionConfig,
					brandVoice,
					additionalContext,
				}),
			});

			return object;
		}, TRANSLATION_CONFIG.maxRetries);

		return result;
	} catch (error) {
		throw handleGenerationError(error, `translation to ${locale}`);
	}
}

/**
 * Build the translation prompt for the AI
 */
function buildTranslationPrompt(params: {
	baseCopy: string;
	locale: LocaleCode;
	productDetails: ProductDetails;
	regionConfig: RegionConfig;
	brandVoice?: string;
	additionalContext?: string;
}): string {
	const {
		baseCopy,
		locale,
		productDetails,
		regionConfig,
		brandVoice,
		additionalContext,
	} = params;

	return `You are a professional translator and cultural adaptation expert specializing in advertising localization.

Your task is to translate and culturally adapt advertising copy to resonate with the target market.

## Original Ad Copy
"${baseCopy}"

## Product Information
- Name: ${productDetails.name}
- Category: ${productDetails.category}
- Features: ${productDetails.features.join(", ")}
- Benefits: ${productDetails.benefits.join(", ")}
${productDetails.targetAudience ? `- Target Audience: ${productDetails.targetAudience}` : ""}
${productDetails.pricePoint ? `- Price Point: ${productDetails.pricePoint}` : ""}

## Target Market: ${locale}

## Cultural Guidelines
- Tone: ${regionConfig.tone}
- Emoji Usage: ${regionConfig.emojiTolerance}
- Formality Level: ${regionConfig.formality}
- Preferred CTA: "${regionConfig.cta}"
${regionConfig.culturalNotes ? `\n- Cultural Notes:\n${regionConfig.culturalNotes.map((note) => `  • ${note}`).join("\n")}` : ""}

${brandVoice ? `## Brand Voice\n${brandVoice}\n` : ""}
${additionalContext ? `## Additional Context\n${additionalContext}\n` : ""}

## Your Mission
1. **Translate Accurately**: Maintain the core message and value proposition
2. **Adapt Culturally**: Adjust idioms, references, and expressions for local relevance
3. **Match Tone**: Ensure the tone aligns with local advertising norms
4. **Optimize Emoji Usage**: Apply appropriate emoji density (${regionConfig.emojiTolerance})
5. **Set Formality**: Match the expected formality level (${regionConfig.formality})
6. **Preserve Persuasiveness**: Keep the emotional and persuasive power of the original
7. **Natural Language**: Ensure it sounds native, not translated

## Output Requirements
- Provide the culturally adapted translation
- Include brief cultural notes explaining key adaptations you made
- If possible, rate your confidence in the translation (0-1)
- Optionally provide alternative translations if there are multiple good options

Think like a native marketing professional in ${locale}, not just a translator.`;
}

/**
 * Batch translate multiple ad copies
 */
export async function batchTranslate(
	copies: string[],
	locale: LocaleCode,
	productDetails: ProductDetails,
	regionConfig: RegionConfig,
) {
	const translations = await Promise.all(
		copies.map((copy) =>
			translateAdCopy({
				baseCopy: copy,
				locale,
				productDetails,
				regionConfig,
			}),
		),
	);

	return translations;
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
