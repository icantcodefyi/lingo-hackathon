/**
 * Regional and cultural configurations for ad localization
 * Based on cultural advertising norms and best practices
 */

import type { LocaleCode, RegionConfig } from "../types/ad-generation.types";

/**
 * Region-specific tone, formality, and cultural preferences
 * Each configuration is based on market research and cultural norms
 */
export const REGION_CONFIGS: Record<LocaleCode, RegionConfig> = {
	"en-US": {
		tone: "Direct, bold, urgency, CTA-forward",
		emojiTolerance: "medium",
		formality: "casual",
		cta: "Get Started Today",
		culturalNotes: [
			"Americans respond well to urgency and direct calls to action",
			"Benefit-focused messaging over feature lists",
			"Success stories and testimonials are highly effective",
		],
	},
	"en-GB": {
		tone: "Professional, understated",
		emojiTolerance: "low",
		formality: "formal",
		cta: "Discover More",
		culturalNotes: [
			"British audiences prefer subtle, understated messaging",
			"Avoid aggressive sales tactics",
			"Wit and clever wordplay are appreciated",
		],
	},
	"es-MX": {
		tone: "Emotional, emoji-heavy, energetic",
		emojiTolerance: "high",
		formality: "casual",
		cta: "¡Empieza Ahora!",
		culturalNotes: [
			"Mexican audiences respond to emotional and family-oriented messaging",
			"Color and vibrancy are important",
			"Personal connections and warmth are valued",
		],
	},
	"ja-JP": {
		tone: "Polite, formal, honorific",
		emojiTolerance: "none",
		formality: "very-formal",
		cta: "詳細を見る",
		culturalNotes: [
			"Japanese audiences expect extreme politeness and formality",
			"Indirect messaging is preferred over direct sales",
			"Group harmony and consensus are important",
			"Quality and craftsmanship should be emphasized",
		],
	},
	"de-DE": {
		tone: "Factual, detailed, low-emoji",
		emojiTolerance: "very-low",
		formality: "formal",
		cta: "Mehr Erfahren",
		culturalNotes: [
			"German audiences prefer detailed, factual information",
			"Quality and reliability are key selling points",
			"Avoid exaggeration or hyperbole",
			"Environmental and sustainability claims should be substantiated",
		],
	},
	"fr-FR": {
		tone: "Elegant, aesthetic",
		emojiTolerance: "low",
		formality: "formal",
		cta: "En Savoir Plus",
		culturalNotes: [
			"French audiences appreciate elegance and sophistication",
			"Aesthetic and design are highly valued",
			"Cultural and artistic references resonate well",
			"Quality of life messaging is effective",
		],
	},
	"ar-SA": {
		tone: "Respectful, conservative wording",
		emojiTolerance: "low",
		formality: "formal",
		cta: "اكتشف المزيد",
		culturalNotes: [
			"Saudi audiences expect conservative, respectful messaging",
			"Family values are central",
			"Religious sensitivity is crucial",
			"Gender representation should follow cultural norms",
		],
	},
	"hi-IN": {
		tone: "Conversational, clarity-focused",
		emojiTolerance: "medium",
		formality: "casual",
		cta: "अभी शुरू करें",
		culturalNotes: [
			"Indian audiences respond to value-for-money messaging",
			"Family-oriented appeals work well",
			"Celebrity endorsements are highly effective",
			"Mix of English and Hindi is often acceptable",
		],
	},
	"pt-BR": {
		tone: "Warm, friendly, enthusiastic",
		emojiTolerance: "high",
		formality: "casual",
		cta: "Comece Agora",
		culturalNotes: [
			"Brazilian audiences prefer warm, friendly messaging",
			"Emotional connections are important",
			"Social proof and community matter",
			"Celebration and positivity resonate well",
		],
	},
	"zh-CN": {
		tone: "Professional, aspirational",
		emojiTolerance: "medium",
		formality: "formal",
		cta: "立即开始",
		culturalNotes: [
			"Chinese audiences respond to aspirational messaging",
			"Status and social standing are important",
			"Technology and innovation are valued",
			"Lucky numbers and colors can be incorporated",
		],
	},
};

/**
 * Get region configuration by locale code
 */
export function getRegionConfig(localeCode: string) {
	return REGION_CONFIGS[localeCode as LocaleCode] || null;
}

/**
 * Get all supported locale codes
 */
export function getSupportedLocales() {
	return Object.keys(REGION_CONFIGS) as LocaleCode[];
}

/**
 * Validate if a locale is supported
 */
export function isLocaleSupported(localeCode: string) {
	return localeCode in REGION_CONFIGS;
}

/**
 * Get locale display information using Intl API
 */
export function getLocaleDisplayInfo(localeCode: LocaleCode) {
	const [languageCode, regionCode] = localeCode.split("-");

	return {
		code: localeCode,
		languageName:
			new Intl.DisplayNames(["en"], { type: "language" }).of(
				languageCode || "",
			) || languageCode,
		regionName:
			new Intl.DisplayNames(["en"], { type: "region" }).of(regionCode || "") ||
			regionCode,
		config: REGION_CONFIGS[localeCode],
	};
}
