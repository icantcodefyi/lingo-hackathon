/**
 * Ad Generation Router
 * API endpoints for ad generation functionality
 */

import { publicProcedure } from "../index";
import { adGenerationInputSchema, type AdGenerationRequest } from "../types/ad-generation.types";
import {
	generateAds,
	getSupportedLocales,
	getSupportedPlatforms,
	estimateGeneration,
} from "../services/ad-generation.service";
import { logError } from "../utils/error-handler";

/**
 * Ad Generation Router
 */
export const adGenerationRouter = {
	/**
	 * Generate localized ads for multiple platforms and regions
	 */
	generateAds: publicProcedure
		.input(adGenerationInputSchema)
		.handler(async ({ input }) => {
			try {
				return await generateAds(input as AdGenerationRequest);
			} catch (error) {
				logError(error, "adGenerationRouter.generateAds");
				throw error;
			}
		}),

	/**
	 * Get list of supported locales with configurations
	 */
	getSupportedLocales: publicProcedure.handler(() => {
		try {
			return getSupportedLocales();
		} catch (error) {
			logError(error, "adGenerationRouter.getSupportedLocales");
			throw error;
		}
	}),

	/**
	 * Get list of supported platforms with constraints
	 */
	getSupportedPlatforms: publicProcedure.handler(() => {
		try {
			return getSupportedPlatforms();
		} catch (error) {
			logError(error, "adGenerationRouter.getSupportedPlatforms");
			throw error;
		}
	}),

	/**
	 * Estimate generation time and cost
	 */
	estimateGeneration: publicProcedure
		.input(adGenerationInputSchema)
		.handler(({ input }) => {
			try {
				return estimateGeneration(input as AdGenerationRequest);
			} catch (error) {
				logError(error, "adGenerationRouter.estimateGeneration");
				throw error;
			}
		}),
};
