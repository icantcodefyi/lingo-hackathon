import { protectedProcedure, publicProcedure } from "../index";
import { z } from "zod";
import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Regional tone configurations
const REGION_CONFIGS = {
  "en-US": {
    tone: "Direct, bold, urgency, CTA-forward",
    emojiTolerance: "medium",
    formality: "casual",
    cta: "Get Started Today",
  },
  "en-GB": {
    tone: "Professional, understated",
    emojiTolerance: "low",
    formality: "formal",
    cta: "Discover More",
  },
  "es-MX": {
    tone: "Emotional, emoji-heavy, energetic",
    emojiTolerance: "high",
    formality: "casual",
    cta: "¡Empieza Ahora!",
  },
  "ja-JP": {
    tone: "Polite, formal, honorific",
    emojiTolerance: "none",
    formality: "very-formal",
    cta: "詳細を見る",
  },
  "de-DE": {
    tone: "Factual, detailed, low-emoji",
    emojiTolerance: "very-low",
    formality: "formal",
    cta: "Mehr Erfahren",
  },
  "fr-FR": {
    tone: "Elegant, aesthetic",
    emojiTolerance: "low",
    formality: "formal",
    cta: "En Savoir Plus",
  },
  "ar-SA": {
    tone: "Respectful, conservative wording",
    emojiTolerance: "low",
    formality: "formal",
    cta: "اكتشف المزيد",
  },
  "hi-IN": {
    tone: "Conversational, clarity-focused",
    emojiTolerance: "medium",
    formality: "casual",
    cta: "अभी शुरू करें",
  },
  "pt-BR": {
    tone: "Warm, friendly, enthusiastic",
    emojiTolerance: "high",
    formality: "casual",
    cta: "Comece Agora",
  },
  "zh-CN": {
    tone: "Professional, aspirational",
    emojiTolerance: "medium",
    formality: "formal",
    cta: "立即开始",
  },
};

const PLATFORM_CONFIGS = {
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
      primaryText: 125,
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

const adGenerationInputSchema = z.object({
  baseCopy: z.string().describe("The original ad copy in English"),
  productDetails: z.object({
    name: z.string(),
    category: z.string(),
    features: z.array(z.string()),
    benefits: z.array(z.string()),
  }),
  targetLocales: z.array(z.string()),
  targetPlatforms: z.array(z.string()),
  industry: z.string(),
});

const translationOutputSchema = z.object({
  translation: z.string(),
  culturalNotes: z.string(),
});

const platformAdSchema = z.object({
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

export const adGenerationRouter = {
  generateAds: publicProcedure
    .input(adGenerationInputSchema)
    .handler(async ({ input }) => {
      const results = [];

      for (const locale of input.targetLocales) {
        const config = REGION_CONFIGS[locale as keyof typeof REGION_CONFIGS];
        if (!config) continue;

        // Step 1: Translate with cultural adaptation
        const { object: translationResult } = await generateObject({
          model: openai("gpt-4o"),
          schema: translationOutputSchema,
          prompt: `You are a professional translator and cultural adaptation expert for advertising.

Translate the following ad copy to ${locale}, adapting it for local cultural nuances.

Original Ad Copy: "${input.baseCopy}"

Product Details:
- Name: ${input.productDetails.name}
- Category: ${input.productDetails.category}
- Features: ${input.productDetails.features.join(", ")}
- Benefits: ${input.productDetails.benefits.join(", ")}

Target Locale: ${locale}
Cultural Tone Guidelines: ${config.tone}
Emoji Usage: ${config.emojiTolerance}
Formality Level: ${config.formality}

Requirements:
1. Translate accurately while maintaining persuasive power
2. Adapt cultural references and idioms appropriately
3. Adjust tone to match local advertising norms
4. Use appropriate emoji density (${config.emojiTolerance})
5. Ensure formality matches expectations (${config.formality})
6. Keep the core value proposition intact

Provide the culturally adapted translation and brief cultural notes explaining key adaptations.`,
        });

        // Step 2: Generate platform-specific variations
        const platformAds: Record<string, any> = {};

        for (const platform of input.targetPlatforms) {
          const platformConfig =
            PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
          if (!platformConfig) continue;

          const { object: platformAd } = await generateObject({
            model: openai("gpt-4o"),
            schema: platformAdSchema,
            prompt: `You are an expert at formatting ads for ${platformConfig.name}.

Base Translated Copy: "${translationResult.translation}"
Product: ${input.productDetails.name}
Target Locale: ${locale}
Platform: ${platformConfig.name}
Character Constraints: ${JSON.stringify(platformConfig.constraints)}

Create a ${platformConfig.name}-formatted ad that:
1. Respects ALL character limits strictly
2. Includes a strong call-to-action: "${config.cta}"
3. Highlights key benefits clearly
4. Follows ${platformConfig.name} best practices
5. Maintains the cultural tone: ${config.tone}

Generate the ad with all required fields for ${platformConfig.name}.`,
          });

          platformAds[platform] = platformAd;
        }

        results.push({
          locale,
          translatedCopy: translationResult.translation,
          culturalNotes: translationResult.culturalNotes,
          platformAds,
          config,
        });
      }

      return {
        success: true,
        results,
        timestamp: new Date().toISOString(),
      };
    }),

  getSupportedLocales: publicProcedure.handler(() => {
    return Object.keys(REGION_CONFIGS).map((key) => ({
      code: key,
      name: new Intl.DisplayNames(["en"], { type: "language" }).of(
        key.split("-")[0]
      ),
      region: new Intl.DisplayNames(["en"], { type: "region" }).of(
        key.split("-")[1]
      ),
      config: REGION_CONFIGS[key as keyof typeof REGION_CONFIGS],
    }));
  }),

  getSupportedPlatforms: publicProcedure.handler(() => {
    return Object.entries(PLATFORM_CONFIGS).map(([key, value]) => ({
      id: key,
      name: value.name,
      constraints: value.constraints,
    }));
  }),
};
