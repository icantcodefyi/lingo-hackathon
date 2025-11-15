/**
 * Type definitions for Compliance functionality
 */

import { z } from "zod";

// ============================================================================
// Severity Levels
// ============================================================================

export type SeverityLevel = "high" | "medium" | "low";
export type RiskLevel = "high" | "medium" | "low";

// ============================================================================
// Rule Types
// ============================================================================

export interface BaseRule {
	id: string;
	rule: string;
	severity: SeverityLevel;
	fix?: string;
}

export interface PatternRule extends BaseRule {
	pattern: RegExp;
}

export interface KeywordRule extends BaseRule {
	keywords: string[];
}

export type Rule = PatternRule | KeywordRule | BaseRule;

// ============================================================================
// Platform-Specific Compliance
// ============================================================================

export type CompliancePlatform = "google" | "meta" | "linkedin" | "tiktok";

export interface PlatformRules {
	google: Rule[];
	meta: Rule[];
	linkedin: Rule[];
	tiktok: Rule[];
}

// ============================================================================
// Country-Specific Compliance
// ============================================================================

export type CountryLocale =
	| "en-US"
	| "de-DE"
	| "fr-FR"
	| "ja-JP"
	| "ar-SA"
	| "hi-IN";

export interface CountryRuleSet {
	authority: string;
	rules: Rule[];
	additionalGuidelines?: string[];
}

export interface CountryRules {
	"en-US": CountryRuleSet;
	"de-DE": CountryRuleSet;
	"fr-FR": CountryRuleSet;
	"ja-JP": CountryRuleSet;
	"ar-SA": CountryRuleSet;
	"hi-IN": CountryRuleSet;
}

// ============================================================================
// Industry-Specific Compliance
// ============================================================================

export type IndustryType =
	| "finance"
	| "crypto"
	| "health"
	| "weight-loss"
	| "general";

export interface IndustryRules {
	finance: Rule[];
	crypto: Rule[];
	health: Rule[];
	"weight-loss": Rule[];
}

// ============================================================================
// Compliance Issue Types
// ============================================================================

export interface ComplianceIssue {
	id?: string;
	issue: string;
	severity: SeverityLevel;
	rule: string;
	suggestedFix: string;
	match?: string;
	authority?: string;
	location?: {
		start: number;
		end: number;
	};
}

export interface PatternMatchIssue {
	id: string;
	rule: string;
	severity: SeverityLevel;
	match?: string;
	fix?: string;
	authority?: string;
}

// ============================================================================
// Compliance Report Types
// ============================================================================

export interface ComplianceReport {
	issues: ComplianceIssue[];
	overallRisk: RiskLevel;
	autoFixedCopy: string;
	explanation: string;
	riskScore?: number;
	recommendations?: string[];
}

export interface ComplianceCheckResult {
	success: boolean;
	adCopy: string;
	locale: string;
	platform: string;
	industry: string;
	patternMatchedIssues: PatternMatchIssue[];
	aiAnalysis: ComplianceReport;
	timestamp: string;
	metadata?: {
		totalIssues: number;
		criticalIssues: number;
		processingTimeMs: number;
	};
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ComplianceCheckRequest {
	adCopy: string;
	locale: string;
	platform: string;
	industry: string;
	strictMode?: boolean;
}

export interface ComplianceRulesRequest {
	locale?: string;
	platform?: string;
	industry?: string;
}

export interface ComplianceRulesResponse {
	platform: Partial<PlatformRules> | Rule[];
	country: CountryRuleSet | Partial<CountryRules>;
	industry: Rule[] | Partial<IndustryRules>;
}

// ============================================================================
// Zod Schemas for Runtime Validation
// ============================================================================

export const complianceInputSchema = z.object({
	adCopy: z
		.string()
		.min(1, "Ad copy is required")
		.max(5000, "Ad copy must not exceed 5000 characters"),
	locale: z.string().min(1, "Locale is required"),
	platform: z.string().min(1, "Platform is required"),
	industry: z.string().min(1, "Industry is required"),
	strictMode: z.boolean().optional().default(false),
});

export const complianceIssueSchema = z.object({
	issue: z.string(),
	severity: z.enum(["high", "medium", "low"]),
	rule: z.string(),
	suggestedFix: z.string(),
	match: z.string().optional(),
	authority: z.string().optional(),
	location: z
		.object({
			start: z.number(),
			end: z.number(),
		})
		.optional(),
});

export const complianceReportSchema = z.object({
	issues: z.array(complianceIssueSchema),
	overallRisk: z.enum(["high", "medium", "low"]),
	autoFixedCopy: z.string(),
	explanation: z.string(),
	riskScore: z.number().min(0).max(100).optional(),
	recommendations: z.array(z.string()).optional(),
});

export const complianceRulesInputSchema = z.object({
	locale: z.string().optional(),
	platform: z.string().optional(),
	industry: z.string().optional(),
});
