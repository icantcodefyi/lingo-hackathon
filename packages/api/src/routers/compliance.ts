/**
 * Compliance Router
 * API endpoints for advertising compliance checking
 */

import { z } from "zod";
import { publicProcedure } from "../index";
import {
	checkCompliance,
	compareCompliance,
	getComplianceRules,
} from "../services/compliance.service";
import {
	complianceInputSchema,
	complianceRulesInputSchema,
} from "../types/compliance.types";
import { logError } from "../utils/error-handler";

/**
 * Compliance Router
 */
export const complianceRouter = {
	/**
	 * Check ad copy for compliance issues
	 */
	checkCompliance: publicProcedure
		.input(complianceInputSchema)
		.handler(async ({ input }) => {
			try {
				return await checkCompliance(input);
			} catch (error) {
				logError(error, "complianceRouter.checkCompliance");
				throw error;
			}
		}),

	/**
	 * Get compliance rules for specific parameters
	 */
	getComplianceRules: publicProcedure
		.input(complianceRulesInputSchema)
		.handler(({ input }) => {
			try {
				return getComplianceRules(input);
			} catch (error) {
				logError(error, "complianceRouter.getComplianceRules");
				throw error;
			}
		}),

	/**
	 * Compare compliance across multiple locales and platforms
	 */
	compareCompliance: publicProcedure
		.input(
			z.object({
				adCopy: z.string(),
				locales: z.array(z.string()),
				platforms: z.array(z.string()),
				industry: z.string(),
			}),
		)
		.handler(async ({ input }) => {
			try {
				return await compareCompliance(input);
			} catch (error) {
				logError(error, "complianceRouter.compareCompliance");
				throw error;
			}
		}),
};
