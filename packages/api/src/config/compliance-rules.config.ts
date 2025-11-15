/**
 * Comprehensive compliance rules for advertising across platforms, countries, and industries
 * Based on official regulations and advertising standards
 */

import type {
	CountryRules,
	IndustryRules,
	PlatformRules,
} from "../types/compliance.types";

/**
 * Platform-specific advertising rules
 * Each platform has unique content policies and advertising standards
 */
export const PLATFORM_RULES: PlatformRules = {
	google: [
		{
			id: "google-1",
			rule: 'No "Click here" phrases - use descriptive CTAs',
			pattern: /click\s+here/gi,
			severity: "high",
			fix: 'Use descriptive calls-to-action like "Learn More" or "Get Started"',
		},
		{
			id: "google-2",
			rule: "No excessive capitalization",
			pattern: /[A-Z]{4,}/g,
			severity: "medium",
			fix: "Use proper capitalization - only capitalize proper nouns and first letters",
		},
		{
			id: "google-3",
			rule: "No excessive punctuation",
			pattern: /[!?]{2,}/g,
			severity: "medium",
			fix: "Use single punctuation marks for professional appearance",
		},
		{
			id: "google-4",
			rule: "No misleading spacing or symbols",
			pattern: /[^\w\s]{3,}/g,
			severity: "high",
			fix: "Remove excessive symbols or special characters",
		},
	],
	meta: [
		{
			id: "meta-1",
			rule: "No sensational claims without evidence",
			keywords: [
				"miracle",
				"guaranteed results",
				"instant",
				"magic",
				"secret trick",
				"shocking",
			],
			severity: "high",
			fix: "Replace with factual, substantiated claims",
		},
		{
			id: "meta-2",
			rule: "No before/after claims without proper disclaimers",
			keywords: ["before and after", "results guaranteed", "lose weight fast"],
			severity: "high",
			fix: "Add disclaimer: 'Results may vary' or remove unverified claims",
		},
		{
			id: "meta-3",
			rule: "No personal attributes targeting",
			keywords: ["single", "divorced", "poor credit", "medical condition"],
			severity: "high",
			fix: "Remove references to personal attributes or characteristics",
		},
		{
			id: "meta-4",
			rule: "Text in images must not exceed 20% of image area",
			severity: "medium",
			fix: "Reduce text overlay on images or use text in post copy instead",
		},
	],
	linkedin: [
		{
			id: "linkedin-1",
			rule: "Professional tone required",
			severity: "medium",
			fix: "Maintain business-appropriate language and tone",
		},
		{
			id: "linkedin-2",
			rule: "No overly casual or unprofessional language",
			keywords: ["gonna", "wanna", "ain't", "ya'll", "lol", "omg"],
			severity: "medium",
			fix: "Use professional language appropriate for business context",
		},
		{
			id: "linkedin-3",
			rule: "No misleading job opportunities or fake news",
			keywords: ["make money fast", "work from home easy money"],
			severity: "high",
			fix: "Provide transparent, accurate information about opportunities",
		},
	],
	tiktok: [
		{
			id: "tiktok-1",
			rule: "Age-appropriate content required",
			severity: "high",
			fix: "Ensure content is appropriate for users 13+ years old",
		},
		{
			id: "tiktok-2",
			rule: "No promotion of alcohol, tobacco, or drugs",
			keywords: ["alcohol", "beer", "wine", "cigarette", "vape", "cbd"],
			severity: "high",
			fix: "Remove references to restricted substances",
		},
		{
			id: "tiktok-3",
			rule: "No unrealistic body standards or dangerous challenges",
			severity: "high",
			fix: "Promote positive, realistic messaging",
		},
	],
};

/**
 * Country-specific advertising regulations
 * Based on local advertising authorities and consumer protection laws
 */
export const COUNTRY_RULES: CountryRules = {
	"en-US": {
		authority: "FTC (Federal Trade Commission)",
		rules: [
			{
				id: "us-ftc-1",
				rule: "No unsubstantiated 'guaranteed results' claims",
				pattern: /guaranteed?\s+(results?|success|income|money|cure)/gi,
				severity: "high",
				fix: 'Replace with "potential results" or "may help achieve"',
			},
			{
				id: "us-ftc-2",
				rule: "No false urgency or scarcity claims",
				pattern:
					/last\s+chance|ending\s+soon|limited\s+time|only\s+\d+\s+left/gi,
				severity: "medium",
				fix: "Remove or add specific verifiable end date",
			},
			{
				id: "us-ftc-3",
				rule: "Endorsements must disclose material connections",
				pattern: /#ad|#sponsored|paid\s+partnership/gi,
				severity: "high",
				fix: "Clearly disclose any sponsored or paid relationships",
			},
			{
				id: "us-ftc-4",
				rule: "Made in USA claims require substantiation",
				pattern: /made\s+in\s+(usa|america)/gi,
				severity: "high",
				fix: "Ensure all or virtually all product components are US-sourced",
			},
		],
		additionalGuidelines: [
			"Testimonials must reflect typical results",
			"Free trials must clearly state terms and conditions",
			"Negative option marketing requires clear disclosure",
		],
	},
	"de-DE": {
		authority: "UWG (German Competition Law)",
		rules: [
			{
				id: "de-uwg-1",
				rule: '"Free" requires clear disclosure of conditions',
				pattern: /\b(free|kostenlos|gratis)\b/gi,
				severity: "high",
				fix: 'Add clear disclaimer: "Conditions apply" or "With purchase"',
			},
			{
				id: "de-uwg-2",
				rule: "No superlative claims without independent verification",
				pattern: /\b(best|greatest|number\s+one|#1|führend|beste|größte)\b/gi,
				severity: "high",
				fix: "Add specific source citation or remove claim",
			},
			{
				id: "de-uwg-3",
				rule: "Environmental claims require certification",
				pattern:
					/\b(eco|green|sustainable|öko|nachhaltig|umweltfreundlich)\b/gi,
				severity: "high",
				fix: "Add certification reference or remove environmental claim",
			},
			{
				id: "de-uwg-4",
				rule: "Price comparisons must be verifiable",
				pattern: /\d+%\s+(off|discount|rabatt)/gi,
				severity: "medium",
				fix: "Ensure price comparison baseline is clear and verifiable",
			},
		],
		additionalGuidelines: [
			"Impressum (legal disclosure) required for commercial content",
			"GDPR compliance mandatory for data collection",
			"Clear right of withdrawal for online purchases",
		],
	},
	"fr-FR": {
		authority: "ARPP (Advertising Regulation)",
		rules: [
			{
				id: "fr-arpp-1",
				rule: "No misleading environmental claims (greenwashing)",
				pattern: /\b(eco|green|sustainable|vert|durable|écologique)\b/gi,
				severity: "high",
				fix: "Provide specific certifications or remove claim",
			},
			{
				id: "fr-arpp-2",
				rule: "French language mandatory for advertising in France",
				severity: "high",
				fix: "Ensure all advertising copy is in French or includes French translation",
			},
			{
				id: "fr-arpp-3",
				rule: "No discriminatory content or stereotyping",
				severity: "high",
				fix: "Review content for gender, racial, or other stereotypes",
			},
			{
				id: "fr-arpp-4",
				rule: "Health claims require scientific evidence",
				pattern: /\b(cure|treat|heal|soigne|guérit|traite)\b/gi,
				severity: "high",
				fix: "Provide clinical evidence or use softer language like 'may support'",
			},
		],
		additionalGuidelines: [
			"Loi Toubon requires French language primacy",
			"Strong consumer protection laws apply",
			"Environmental claims heavily regulated",
		],
	},
	"ja-JP": {
		authority: "Japanese Consumer Law & JARO",
		rules: [
			{
				id: "jp-law-1",
				rule: "No exaggeration or hyperbole",
				pattern:
					/\b(miracle|amazing|incredible|unbelievable|驚くべき|信じられない|奇跡)\b/gi,
				severity: "high",
				fix: "Use factual, measured, and modest language",
			},
			{
				id: "jp-law-2",
				rule: "Comparative advertising requires strict substantiation",
				pattern: /\b(better than|superior to|より良い|優れた)\b/gi,
				severity: "high",
				fix: "Provide objective comparison data or remove claim",
			},
			{
				id: "jp-law-3",
				rule: "No misleading price displays",
				pattern: /\d+円\s+(off|discount)/gi,
				severity: "medium",
				fix: "Clearly show original and discounted prices",
			},
			{
				id: "jp-law-4",
				rule: "Special designations require certification",
				pattern: /\b(organic|natural|天然|有機)\b/gi,
				severity: "high",
				fix: "Ensure proper JAS or equivalent certification",
			},
		],
		additionalGuidelines: [
			"Politeness and respect in all messaging",
			"Avoid direct confrontational comparisons",
			"Cultural sensitivity paramount",
		],
	},
	"ar-SA": {
		authority: "Saudi Advertising Regulations",
		rules: [
			{
				id: "sa-law-1",
				rule: "Conservative imagery and language required",
				severity: "high",
				fix: "Ensure culturally appropriate, modest content",
			},
			{
				id: "sa-law-2",
				rule: "No content conflicting with Islamic values",
				severity: "high",
				fix: "Review content for religious and cultural sensitivity",
			},
			{
				id: "sa-law-3",
				rule: "Gender-appropriate representation required",
				severity: "high",
				fix: "Follow local norms for gender representation",
			},
			{
				id: "sa-law-4",
				rule: "No interest-based financial products (Riba)",
				pattern: /\b(interest rate|loan interest|apr)\b/gi,
				severity: "high",
				fix: "Use Sharia-compliant financial terminology",
			},
		],
		additionalGuidelines: [
			"No alcohol or pork products",
			"Modest dress in imagery",
			"Family values emphasized",
			"Religious holidays respected",
		],
	},
	"hi-IN": {
		authority: "ASCI (Advertising Standards Council of India)",
		rules: [
			{
				id: "in-asci-1",
				rule: "No misleading health or medicinal claims",
				pattern: /\b(cure|treat|heal|remedy|इलाज|उपचार)\b/gi,
				severity: "high",
				fix: 'Replace with "support" or "may help" language',
			},
			{
				id: "in-asci-2",
				rule: "Religious sensitivity required",
				severity: "high",
				fix: "Avoid religious symbols, figures, or references in advertising",
			},
			{
				id: "in-asci-3",
				rule: "No exploitation of superstition",
				severity: "high",
				fix: "Remove superstitious or unscientific claims",
			},
			{
				id: "in-asci-4",
				rule: "No misleading price comparisons",
				pattern: /\d+%\s+(off|discount|छूट)/gi,
				severity: "medium",
				fix: "Ensure MRP and discount calculations are accurate",
			},
			{
				id: "in-asci-5",
				rule: "No promotion of alcohol or tobacco",
				keywords: ["alcohol", "beer", "wine", "cigarette", "tobacco"],
				severity: "high",
				fix: "Remove references to prohibited products",
			},
		],
		additionalGuidelines: [
			"Cultural diversity sensitivity",
			"No exploitation of children",
			"Gender equality in representation",
			"Consumer education valued",
		],
	},
};

/**
 * Industry-specific compliance rules
 * Regulations that apply regardless of geography
 */
export const INDUSTRY_RULES: IndustryRules = {
	finance: [
		{
			id: "finance-1",
			rule: "No guaranteed returns or profit promises",
			pattern: /guaranteed?\s+(returns?|profit|gains?|roi)/gi,
			severity: "high",
			fix: 'Use "potential returns" or "historical performance" with disclaimers',
		},
		{
			id: "finance-2",
			rule: "Risk disclosure required",
			severity: "high",
			fix: 'Add: "Investments carry risk. Past performance does not guarantee future results."',
		},
		{
			id: "finance-3",
			rule: "No misleading investment advice",
			pattern: /\b(insider tip|hot stock|can't lose)\b/gi,
			severity: "high",
			fix: "Remove speculative or misleading investment language",
		},
		{
			id: "finance-4",
			rule: "License/registration disclosure required",
			severity: "high",
			fix: "Include regulatory registration information",
		},
	],
	crypto: [
		{
			id: "crypto-1",
			rule: 'No "risk-free" or "guaranteed" claims',
			pattern: /risk[- ]?free|no\s+risk|guaranteed?\s+profit/gi,
			severity: "high",
			fix: "Add clear risk warnings about cryptocurrency volatility",
		},
		{
			id: "crypto-2",
			rule: "Volatility warning required",
			severity: "high",
			fix: 'Add: "Cryptocurrency values are highly volatile and may result in significant losses."',
		},
		{
			id: "crypto-3",
			rule: "No encouragement of excessive risk-taking",
			pattern: /\b(moon|lambo|to the moon|100x|1000x)\b/gi,
			severity: "high",
			fix: "Remove speculative hype language",
		},
		{
			id: "crypto-4",
			rule: "Regulatory status disclosure",
			severity: "medium",
			fix: "Disclose regulatory status and jurisdiction",
		},
	],
	health: [
		{
			id: "health-1",
			rule: "No unverified medical claims",
			pattern: /cure|diagnose|treat|prevent|therapy/gi,
			severity: "high",
			fix: 'Use "support" or "may help" with appropriate disclaimers',
		},
		{
			id: "health-2",
			rule: "Clinical evidence required for health claims",
			severity: "high",
			fix: "Provide peer-reviewed study citations or remove claims",
		},
		{
			id: "health-3",
			rule: "FDA/medical authority approval required for drug claims",
			severity: "high",
			fix: "Ensure FDA approval or remove medical device/drug claims",
		},
		{
			id: "health-4",
			rule: "No fear-based health messaging",
			pattern: /\b(deadly|fatal|life-threatening|dangerous)\b/gi,
			severity: "high",
			fix: "Use factual, non-alarmist language",
		},
		{
			id: "health-5",
			rule: "Medical disclaimer required",
			severity: "high",
			fix: 'Add: "Not intended to diagnose, treat, cure, or prevent any disease."',
		},
	],
	"weight-loss": [
		{
			id: "weight-1",
			rule: "No rapid weight loss promises",
			pattern:
				/lose\s+\d+\s+(lbs?|kg|pounds?|kilos?)\s+in\s+\d+\s+(days?|weeks?)/gi,
			severity: "high",
			fix: "Remove specific weight loss timeframes or use realistic claims",
		},
		{
			id: "weight-2",
			rule: "Typical results disclaimer required",
			severity: "high",
			fix: 'Add: "Results vary. Typical results may be different from advertised results."',
		},
		{
			id: "weight-3",
			rule: "No before/after photos without disclaimers",
			severity: "high",
			fix: "Add disclaimer about atypical results and individual variation",
		},
		{
			id: "weight-4",
			rule: "Exercise and diet acknowledgment required",
			severity: "medium",
			fix: 'Include: "Combined with diet and exercise" where applicable',
		},
		{
			id: "weight-5",
			rule: "No body shaming or negative messaging",
			severity: "high",
			fix: "Focus on positive health outcomes, not body criticism",
		},
	],
};

/**
 * Get rules for a specific platform
 */
export function getPlatformRules(platform: string) {
	return PLATFORM_RULES[platform as keyof typeof PLATFORM_RULES] || [];
}

/**
 * Get rules for a specific country
 */
export function getCountryRules(locale: string) {
	return COUNTRY_RULES[locale as keyof typeof COUNTRY_RULES] || null;
}

/**
 * Get rules for a specific industry
 */
export function getIndustryRules(industry: string) {
	return INDUSTRY_RULES[industry as keyof typeof INDUSTRY_RULES] || [];
}

/**
 * Check if strict compliance mode should apply
 */
export function requiresStrictCompliance(industry: string, locale: string) {
	const strictIndustries = ["finance", "crypto", "health", "weight-loss"];
	const strictLocales = ["de-DE", "fr-FR", "ja-JP"]; // Stricter regulation markets

	return strictIndustries.includes(industry) || strictLocales.includes(locale);
}
