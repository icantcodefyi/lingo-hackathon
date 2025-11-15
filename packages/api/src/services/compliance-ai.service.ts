/**
 * AI-powered compliance analysis service
 * Deep semantic analysis of ad copy for compliance
 */

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import type {
	ComplianceReport,
	PatternMatchIssue,
} from "../types/compliance.types";
import { complianceReportSchema } from "../types/compliance.types";
import { getCountryRules } from "../config/compliance-rules.config";
import {
	handleGenerationError,
	retryWithBackoff,
} from "../utils/error-handler";

/**
 * AI compliance configuration
 */
const COMPLIANCE_AI_CONFIG = {
	model: "gpt-4o",
	maxRetries: 2,
};

/**
 * Perform deep AI-powered compliance analysis
 */
export async function analyzeComplianceWithAI(params: {
	adCopy: string;
	locale: string;
	platform: string;
	industry: string;
	patternMatchedIssues: PatternMatchIssue[];
	strictMode?: boolean;
}) {
	const {
		adCopy,
		locale,
		platform,
		industry,
		patternMatchedIssues,
		strictMode = false,
	} = params;

	try {
		const result = await retryWithBackoff(async () => {
			const { object } = await generateObject({
				model: openai(COMPLIANCE_AI_CONFIG.model),
				schema: complianceReportSchema,
				prompt: buildCompliancePrompt({
					adCopy,
					locale,
					platform,
					industry,
					patternMatchedIssues,
					strictMode,
				}),
			});

			return object;
		}, COMPLIANCE_AI_CONFIG.maxRetries);

		return result;
	} catch (error) {
		throw handleGenerationError(
			error,
			`AI compliance analysis for ${platform} in ${locale}`,
		);
	}
}

/**
 * Build the compliance analysis prompt for the AI
 */
function buildCompliancePrompt(params: {
	adCopy: string;
	locale: string;
	platform: string;
	industry: string;
	patternMatchedIssues: PatternMatchIssue[];
	strictMode: boolean;
}): string {
	const {
		adCopy,
		locale,
		platform,
		industry,
		patternMatchedIssues,
		strictMode,
	} = params;

	const countryRules = getCountryRules(locale);
	const authority = countryRules?.authority || "General Advertising Guidelines";

	return `You are a legal compliance expert specializing in advertising regulations across different markets and platforms.

## Your Mission
Perform a comprehensive compliance review of this advertisement copy for potential legal and regulatory issues.

## Ad Copy to Review
"${adCopy}"

## Context
- **Target Market**: ${locale}
- **Platform**: ${platform}
- **Industry**: ${industry}
- **Regulatory Authority**: ${authority}
- **Compliance Mode**: ${strictMode ? "STRICT (Zero-tolerance)" : "STANDARD (Reasonable risk)"}

## Issues Already Detected (Pattern Matching)
${
	patternMatchedIssues.length > 0
		? patternMatchedIssues
				.map(
					(issue, idx) =>
						`${idx + 1}. **${issue.severity.toUpperCase()}**: ${issue.rule}
   - Match: "${issue.match}"
   ${issue.fix ? `- Suggested Fix: ${issue.fix}` : ""}
   ${issue.authority ? `- Authority: ${issue.authority}` : ""}`,
				)
				.join("\n\n")
		: "None detected by pattern matching."
}

${countryRules?.additionalGuidelines ? `## Additional Guidelines for ${locale}\n${countryRules.additionalGuidelines.map((g) => `- ${g}`).join("\n")}\n` : ""}

## Your Tasks

### 1. Comprehensive Issue Identification
Identify ALL compliance issues, including:
- Confirm and expand on pattern-matched issues
- Find subtle issues missed by pattern matching
- Identify context-dependent violations
- Check for misleading implications
- Review tone and cultural appropriateness
- Assess claims substantiation
- Verify disclosure requirements

### 2. Risk Assessment
Provide an overall risk level:
- **HIGH**: Likely to be rejected or cause legal issues
- **MEDIUM**: May face scrutiny or require modification
- **LOW**: Minor concerns or best practice improvements

### 3. Create Compliant Version
Rewrite the ad copy to:
- Fix ALL identified issues
- Maintain persuasive power and marketing effectiveness
- Preserve the core message and value proposition
- Keep brand voice while ensuring compliance
- Respect cultural norms for ${locale}
- Stay within reasonable length (don't expand unnecessarily)

### 4. Explain Changes
Provide a clear explanation of:
- What issues were found and why they matter
- What changes were made to address them
- How the revised copy maintains effectiveness
- Any remaining considerations or disclaimers needed

## Industry-Specific Considerations

${getIndustryConsiderations(industry)}

## Platform-Specific Considerations

${getPlatformConsiderations(platform)}

## Strictness Level
${
	strictMode
		? `**STRICT MODE ACTIVE**: Apply zero-tolerance approach. Flag even borderline issues. Prioritize legal safety over marketing aggressiveness.`
		: `**STANDARD MODE**: Apply reasonable business judgment. Balance compliance with marketing effectiveness. Focus on clear violations.`
}

Be thorough, practical, and actionable in your analysis.`;
}

/**
 * Get industry-specific considerations
 */
function getIndustryConsiderations(industry: string): string {
	const considerations: Record<string, string> = {
		finance: `**Finance Industry**:
- No guaranteed returns or profit promises
- Risk disclosures required
- Licensing/registration information
- Past performance disclaimers
- Clear fee disclosures`,

		crypto: `**Cryptocurrency Industry**:
- Extreme volatility warnings required
- No "risk-free" claims
- Regulatory status disclosure
- No encouragement of excessive risk
- Clear loss potential warnings`,

		health: `**Health/Medical Industry**:
- No cure or treatment claims without FDA approval
- Clinical evidence required
- Medical disclaimers mandatory
- No fear-based messaging
- Professional consultation recommendations`,

		"weight-loss": `**Weight Loss Industry**:
- No rapid weight loss timeframes
- Typical results disclaimers
- Exercise and diet acknowledgment
- No body shaming
- Realistic expectations`,

		general: `**General Advertising**:
- Truth in advertising
- Clear and conspicuous disclosures
- No deceptive practices
- Substantiation for claims`,
	};

	return (
		considerations[industry] ||
		considerations.general ||
		"Apply general advertising standards"
	);
}

/**
 * Get platform-specific considerations
 */
function getPlatformConsiderations(platform: string): string {
	const considerations: Record<string, string> = {
		google: `**Google Ads**:
- No sensationalized language
- Clear destination URLs
- No circumventing review systems
- Professional formatting`,

		meta: `**Facebook/Instagram**:
- No personal attributes targeting language
- Text in images limits (20% rule for some placements)
- Accurate business representation
- No sensational health claims`,

		linkedin: `**LinkedIn Ads**:
- Professional B2B tone required
- No misleading job opportunities
- Accurate company representation
- Value-focused messaging`,

		tiktok: `**TikTok Ads**:
- Age-appropriate content (13+)
- No promotion of restricted substances
- Authentic representation
- Community guidelines adherence`,
	};

	return (
		considerations[platform] || "Apply general platform advertising standards"
	);
}

/**
 * Quick compliance check (lighter than full analysis)
 */
export async function quickComplianceCheck(params: {
	adCopy: string;
	locale: string;
	platform: string;
}) {
	const { adCopy, locale, platform } = params;

	// Simple heuristic checks
	const concerns: string[] = [];

	// Check for common red flags
	const redFlags = [
		/guaranteed?|100%|risk[- ]?free/gi,
		/cure|treat|diagnose/gi,
		/click\s+here/gi,
		/miracle|magic|instant/gi,
	];

	for (const pattern of redFlags) {
		if (pattern.test(adCopy)) {
			concerns.push(`Potential issue detected: ${pattern.source}`);
		}
	}

	// Calculate confidence based on concerns found
	const confidence = Math.max(0, 100 - concerns.length * 20);

	return {
		safe: concerns.length === 0,
		concerns,
		confidence,
	};
}
