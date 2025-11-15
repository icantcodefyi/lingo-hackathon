/**
 * Compliance validation service
 * Pattern-based validation for advertising compliance
 */

import type {
	Rule,
	PatternRule,
	KeywordRule,
	PatternMatchIssue,
	SeverityLevel,
} from "../types/compliance.types";
import {
	getPlatformRules,
	getCountryRules,
	getIndustryRules,
	requiresStrictCompliance,
} from "../config/compliance-rules.config";

/**
 * Validate ad copy against all applicable rules
 */
export function validateCompliance(params: {
	adCopy: string;
	locale: string;
	platform: string;
	industry: string;
	strictMode?: boolean;
}) {
	const { adCopy, locale, platform, industry, strictMode = false } = params;

	const issues: PatternMatchIssue[] = [];

	// Check platform rules
	const platformRules = getPlatformRules(platform);
	const platformIssues = checkRules(adCopy, platformRules, "platform");
	issues.push(...platformIssues);

	// Check country rules
	const countryRuleSet = getCountryRules(locale);
	const countryIssues = countryRuleSet
		? checkRules(adCopy, countryRuleSet.rules, "country", {
				authority: countryRuleSet.authority,
			})
		: [];
	issues.push(...countryIssues);

	// Check industry rules
	const industryRules = getIndustryRules(industry);
	const industryIssues = checkRules(adCopy, industryRules, "industry");
	issues.push(...industryIssues);

	// Calculate overall severity
	const overallSeverity = calculateOverallSeverity(issues);

	// In strict mode or for regulated industries, be more thorough
	const shouldBeStrict =
		strictMode || requiresStrictCompliance(industry, locale);
	if (shouldBeStrict && overallSeverity === "low") {
		// Potentially flag additional concerns
	}

	return {
		issues,
		overallSeverity,
		rulesCoverage: {
			platform: platformRules.length,
			country: countryRuleSet?.rules.length || 0,
			industry: industryRules.length,
		},
	};
}

/**
 * Check ad copy against a set of rules
 */
function checkRules(
	adCopy: string,
	rules: Rule[],
	source: string,
	metadata?: { authority?: string },
) {
	const issues: PatternMatchIssue[] = [];

	for (const rule of rules) {
		// Check pattern-based rules
		if ("pattern" in rule && rule.pattern) {
			const matches = adCopy.match(rule.pattern);
			if (matches) {
				issues.push({
					id: rule.id,
					rule: rule.rule,
					severity: rule.severity,
					match: matches[0],
					fix: rule.fix,
					authority: metadata?.authority,
				});
			}
		}

		// Check keyword-based rules
		if ("keywords" in rule && rule.keywords) {
			for (const keyword of rule.keywords) {
				if (adCopy.toLowerCase().includes(keyword.toLowerCase())) {
					issues.push({
						id: rule.id,
						rule: rule.rule,
						severity: rule.severity,
						match: keyword,
						fix: rule.fix,
						authority: metadata?.authority,
					});
					break; // Only report once per rule
				}
			}
		}

		// For rules without patterns or keywords, they're informational
		if (!("pattern" in rule) && !("keywords" in rule)) {
			// These are general rules that require manual review
			// We'll let the AI handle these in the deep analysis
		}
	}

	return issues;
}

/**
 * Calculate overall severity from all issues
 */
function calculateOverallSeverity(issues: PatternMatchIssue[]) {
	if (issues.length === 0) {
		return "low";
	}

	const hasHigh = issues.some((issue) => issue.severity === "high");
	if (hasHigh) {
		return "high";
	}

	const mediumCount = issues.filter(
		(issue) => issue.severity === "medium",
	).length;
	if (mediumCount >= 2) {
		return "high"; // Multiple medium issues = high risk
	}

	if (mediumCount >= 1) {
		return "medium";
	}

	return "low";
}

/**
 * Get compliance score (0-100)
 */
export function calculateComplianceScore(issues: PatternMatchIssue[]) {
	if (issues.length === 0) {
		return 100;
	}

	let score = 100;

	for (const issue of issues) {
		switch (issue.severity) {
			case "high":
				score -= 20;
				break;
			case "medium":
				score -= 10;
				break;
			case "low":
				score -= 5;
				break;
		}
	}

	return Math.max(0, score);
}

/**
 * Group issues by severity
 */
export function groupIssuesBySeverity(issues: PatternMatchIssue[]) {
	return {
		high: issues.filter((issue) => issue.severity === "high"),
		medium: issues.filter((issue) => issue.severity === "medium"),
		low: issues.filter((issue) => issue.severity === "low"),
	};
}

/**
 * Generate compliance summary
 */
export function generateComplianceSummary(params: {
	issues: PatternMatchIssue[];
	locale: string;
	platform: string;
	industry: string;
}) {
	const { issues, locale, platform, industry } = params;

	if (issues.length === 0) {
		return `✅ No compliance issues detected for ${platform} ads in ${locale} (${industry} industry)`;
	}

	const grouped = groupIssuesBySeverity(issues);
	const parts: string[] = [];

	if (grouped.high.length > 0) {
		parts.push(`⚠️ ${grouped.high.length} high-severity issue(s)`);
	}
	if (grouped.medium.length > 0) {
		parts.push(`⚡ ${grouped.medium.length} medium-severity issue(s)`);
	}
	if (grouped.low.length > 0) {
		parts.push(`ℹ️ ${grouped.low.length} low-severity issue(s)`);
	}

	return `Compliance check for ${platform} in ${locale} (${industry}): ${parts.join(", ")}`;
}

/**
 * Check if ad is safe to publish
 */
export function isSafeToPublish(
	issues: PatternMatchIssue[],
	allowMediumRisk = false,
) {
	const grouped = groupIssuesBySeverity(issues);

	// High severity issues = not safe
	if (grouped.high.length > 0) {
		return {
			safe: false,
			reason: `${grouped.high.length} high-severity compliance issue(s) detected`,
			recommendation:
				"Review and fix all high-severity issues before publishing",
		};
	}

	// Multiple medium issues = risky
	if (grouped.medium.length > 2 && !allowMediumRisk) {
		return {
			safe: false,
			reason: `${grouped.medium.length} medium-severity issues detected`,
			recommendation: "Address medium-severity issues to reduce risk",
		};
	}

	// Single medium issue = caution
	if (grouped.medium.length > 0) {
		return {
			safe: allowMediumRisk,
			reason: "Some medium-severity issues detected",
			recommendation: "Review medium-severity issues and consider fixes",
		};
	}

	return {
		safe: true,
		recommendation:
			grouped.low.length > 0
				? "Consider addressing low-severity issues for optimization"
				: "Ad copy meets compliance standards",
	};
}

/**
 * Generate fix suggestions for issues
 */
export function generateFixSuggestions(issues: PatternMatchIssue[]) {
	return issues.map((issue) => ({
		issue: issue.rule,
		suggestion: issue.fix || "Review and adjust content to meet this guideline",
		priority: issue.severity,
	}));
}
