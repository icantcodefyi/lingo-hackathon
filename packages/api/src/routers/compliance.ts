import { publicProcedure } from "../index";
import { z } from "zod";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Platform rule packs
const PLATFORM_RULES = {
  google: [
    {
      id: "google-1",
      rule: 'No "Click here" phrases',
      pattern: /click\s+here/gi,
      severity: "high",
    },
    {
      id: "google-2",
      rule: "No excessive capitalization",
      pattern: /[A-Z]{4,}/g,
      severity: "medium",
    },
    {
      id: "google-3",
      rule: "No excessive punctuation",
      pattern: /[!?]{2,}/g,
      severity: "medium",
    },
  ],
  meta: [
    {
      id: "meta-1",
      rule: "No sensational claims",
      keywords: [
        "miracle",
        "guaranteed results",
        "instant",
        "magic",
        "secret trick",
      ],
      severity: "high",
    },
    {
      id: "meta-2",
      rule: "No before/after claims without disclaimer",
      keywords: ["before and after", "results guaranteed"],
      severity: "high",
    },
  ],
  linkedin: [
    {
      id: "linkedin-1",
      rule: "Professional tone required",
      severity: "medium",
    },
    {
      id: "linkedin-2",
      rule: "No overly casual language",
      keywords: ["gonna", "wanna", "ain't"],
      severity: "medium",
    },
  ],
  tiktok: [
    {
      id: "tiktok-1",
      rule: "Age-appropriate content",
      severity: "high",
    },
  ],
};

// Country legislation packs
const COUNTRY_RULES = {
  "en-US": {
    authority: "FTC (Federal Trade Commission)",
    rules: [
      {
        id: "us-ftc-1",
        rule: 'No "guaranteed results" claims',
        pattern: /guaranteed?\s+(results?|success|income|money)/gi,
        severity: "high",
        fix: 'Replace with "potential results" or "may help achieve"',
      },
      {
        id: "us-ftc-2",
        rule: "No false urgency",
        pattern: /last\s+chance|ending\s+soon|limited\s+time/gi,
        severity: "medium",
        fix: "Remove or add specific end date",
      },
    ],
  },
  "de-DE": {
    authority: "UWG (German Competition Law)",
    rules: [
      {
        id: "de-uwg-1",
        rule: '"Free" requires disclaimer about conditions',
        pattern: /\b(free|kostenlos|gratis)\b/gi,
        severity: "high",
        fix: 'Add disclaimer: "Conditions apply"',
      },
      {
        id: "de-uwg-2",
        rule: "No superlative claims without proof",
        pattern: /\b(best|greatest|number\s+one|#1)\b/gi,
        severity: "high",
        fix: "Add specific source or remove claim",
      },
    ],
  },
  "fr-FR": {
    authority: "ARPP (Advertising Regulation)",
    rules: [
      {
        id: "fr-arpp-1",
        rule: "No misleading environmental claims",
        pattern: /\b(eco|green|sustainable)\b/gi,
        severity: "high",
        fix: "Add specific environmental certifications",
      },
    ],
  },
  "ja-JP": {
    authority: "Japanese Consumer Law",
    rules: [
      {
        id: "jp-law-1",
        rule: "No exaggeration or hyperbole",
        pattern: /\b(miracle|amazing|incredible|unbelievable)\b/gi,
        severity: "high",
        fix: "Use factual, measured language",
      },
    ],
  },
  "ar-SA": {
    authority: "Saudi Advertising Regulations",
    rules: [
      {
        id: "sa-law-1",
        rule: "Conservative imagery and language required",
        severity: "high",
        fix: "Ensure culturally appropriate content",
      },
    ],
  },
  "hi-IN": {
    authority: "ASCI (Advertising Standards Council of India)",
    rules: [
      {
        id: "in-asci-1",
        rule: "No misleading health claims",
        pattern: /\b(cure|treat|heal|remedy)\b/gi,
        severity: "high",
        fix: 'Replace with "support" or "may help"',
      },
      {
        id: "in-asci-2",
        rule: "Religious sensitivity required",
        severity: "high",
        fix: "Avoid religious references in advertising",
      },
    ],
  },
};

// Industry-specific rules
const INDUSTRY_RULES = {
  finance: [
    {
      id: "finance-1",
      rule: "No guaranteed returns",
      pattern: /guaranteed?\s+(returns?|profit|gains?)/gi,
      severity: "high",
    },
    {
      id: "finance-2",
      rule: "Risk disclaimer required",
      severity: "high",
    },
  ],
  crypto: [
    {
      id: "crypto-1",
      rule: 'No "risk-free" claims',
      pattern: /risk[- ]?free|no\s+risk/gi,
      severity: "high",
    },
  ],
  health: [
    {
      id: "health-1",
      rule: "No unverified medical claims",
      pattern: /cure|diagnose|treat|prevent|therapy/gi,
      severity: "high",
    },
    {
      id: "health-2",
      rule: "Clinical evidence required for claims",
      severity: "high",
    },
  ],
  "weight-loss": [
    {
      id: "weight-1",
      rule: "No quick weight loss promises",
      pattern: /lose\s+\d+\s+(lbs?|kg|pounds|kilos)\s+in\s+\d+\s+days/gi,
      severity: "high",
    },
  ],
};

const complianceInputSchema = z.object({
  adCopy: z.string(),
  locale: z.string(),
  platform: z.string(),
  industry: z.string(),
});

const complianceIssueSchema = z.object({
  issue: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  rule: z.string(),
  suggestedFix: z.string(),
});

const complianceReportSchema = z.object({
  issues: z.array(complianceIssueSchema),
  overallRisk: z.enum(["high", "medium", "low"]),
  autoFixedCopy: z.string(),
  explanation: z.string(),
});

export const complianceRouter = {
  checkCompliance: publicProcedure
    .input(complianceInputSchema)
    .handler(async ({ input }) => {
      const issues: Array<{
        id: string;
        rule: string;
        severity: string;
        match?: string;
        fix?: string;
        authority?: string;
      }> = [];

      // Check platform rules
      const platformRules =
        PLATFORM_RULES[input.platform as keyof typeof PLATFORM_RULES] || [];
      for (const rule of platformRules) {
        if ("pattern" in rule && rule.pattern) {
          const matches = input.adCopy.match(rule.pattern);
          if (matches) {
            issues.push({
              id: rule.id,
              rule: rule.rule,
              severity: rule.severity,
              match: matches[0],
            });
          }
        }
        if ("keywords" in rule && rule.keywords) {
          for (const keyword of rule.keywords) {
            if (input.adCopy.toLowerCase().includes(keyword.toLowerCase())) {
              issues.push({
                id: rule.id,
                rule: rule.rule,
                severity: rule.severity,
                match: keyword,
              });
            }
          }
        }
      }

      // Check country rules
      const countryRules =
        COUNTRY_RULES[input.locale as keyof typeof COUNTRY_RULES];
      if (countryRules) {
        for (const rule of countryRules.rules) {
          if ("pattern" in rule && rule.pattern) {
            const matches = input.adCopy.match(rule.pattern);
            if (matches) {
              issues.push({
                id: rule.id,
                rule: rule.rule,
                severity: rule.severity,
                match: matches[0],
                fix: rule.fix,
                authority: countryRules.authority,
              });
            }
          }
        }
      }

      // Check industry rules
      const industryRules =
        INDUSTRY_RULES[input.industry as keyof typeof INDUSTRY_RULES] || [];
      for (const rule of industryRules) {
        if ("pattern" in rule && rule.pattern) {
          const matches = input.adCopy.match(rule.pattern);
          if (matches) {
            issues.push({
              id: rule.id,
              rule: rule.rule,
              severity: rule.severity,
              match: matches[0],
            });
          }
        }
      }

      // Use AI to analyze and suggest fixes
      const { object: aiAnalysis } = await generateObject({
        model: openai("gpt-4o"),
        schema: complianceReportSchema,
        prompt: `You are a legal compliance expert for advertising across different markets.

Analyze this ad copy for compliance issues:

Ad Copy: "${input.adCopy}"
Target Market: ${input.locale}
Platform: ${input.platform}
Industry: ${input.industry}

Known Issues Detected:
${issues.map((i) => `- ${i.rule} (${i.severity}): ${i.match || "detected"}`).join("\n")}

Country Authority: ${countryRules?.authority || "General Guidelines"}

Tasks:
1. Identify ALL compliance issues (including those not caught by pattern matching)
2. Assess overall risk level
3. Provide a compliant rewrite that:
   - Fixes all issues
   - Maintains persuasive power
   - Keeps the core message
   - Respects cultural norms for ${input.locale}
4. Explain the changes made

Be strict but practical. Focus on legal compliance while maintaining marketing effectiveness.`,
      });

      return {
        success: true,
        adCopy: input.adCopy,
        locale: input.locale,
        platform: input.platform,
        industry: input.industry,
        patternMatchedIssues: issues,
        aiAnalysis,
        timestamp: new Date().toISOString(),
      };
    }),

  getComplianceRules: publicProcedure
    .input(
      z.object({
        locale: z.string().optional(),
        platform: z.string().optional(),
        industry: z.string().optional(),
      })
    )
    .handler(({ input }) => {
      const rules: any = {
        platform: {},
        country: {},
        industry: {},
      };

      if (input.platform) {
        rules.platform =
          PLATFORM_RULES[input.platform as keyof typeof PLATFORM_RULES] || [];
      } else {
        rules.platform = PLATFORM_RULES;
      }

      if (input.locale) {
        rules.country =
          COUNTRY_RULES[input.locale as keyof typeof COUNTRY_RULES];
      } else {
        rules.country = COUNTRY_RULES;
      }

      if (input.industry) {
        rules.industry =
          INDUSTRY_RULES[input.industry as keyof typeof INDUSTRY_RULES] || [];
      } else {
        rules.industry = INDUSTRY_RULES;
      }

      return rules;
    }),
};
