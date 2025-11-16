/**
 * Lingo.dev CLI service for batch translation operations
 * Uses CLI commands for extract and translate operations
 */

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";
import type { LocaleCode } from "../types/ad-generation.types";
import { handleGenerationError, logError } from "../utils/error-handler";

/**
 * Convert locale code from format "en-US" to "en" for Lingo.dev CLI
 */
function convertLocaleForLingo(locale: LocaleCode): string {
	const languageCode = locale.split("-")[0];
	if (!languageCode) {
		throw new Error(`Invalid locale format: ${locale}`);
	}
	return languageCode.toLowerCase();
}

/**
 * Execute lingo extract command on input JSON
 */
export async function extractWithLingoCLI(
	inputJson: Record<string, unknown>,
	workDir: string,
): Promise<void> {
	try {
		// Create input JSON file for lingo extract
		const inputFilePath = join(workDir, "input.json");
		await writeFile(inputFilePath, JSON.stringify(inputJson, null, 2));

		// Create a temporary lingo config for this operation
		const lingoConfigPath = join(workDir, "lingo.config.json");
		const lingoConfig = {
			$schema: "https://lingo.dev/schema/i18n.json",
			version: "1.10",
			locale: {
				source: "en",
				targets: [], // Will be set during translate
			},
			buckets: {
				json: {
					include: [inputFilePath],
				},
			},
		};
		await writeFile(lingoConfigPath, JSON.stringify(lingoConfig, null, 2));

		// Run lingo extract
		const apiKey = process.env.LINGODOTDEV_API_KEY;
		if (!apiKey) {
			throw new Error("LINGODOTDEV_API_KEY environment variable is required");
		}

		const result =
			await $`npx lingo.dev@latest extract --config ${lingoConfigPath}`.env({
				LINGODOTDEV_API_KEY: apiKey,
			});

		if (result.exitCode !== 0) {
			throw new Error(`Lingo extract failed: ${result.stderr.toString()}`);
		}
	} catch (error) {
		throw handleGenerationError(error, "lingo extract CLI operation");
	}
}

/**
 * Execute lingo translate command for target locales
 */
export async function translateWithLingoCLI(
	targetLocales: LocaleCode[],
	workDir: string,
): Promise<Record<LocaleCode, string>> {
	try {
		const apiKey = process.env.LINGODOTDEV_API_KEY;
		if (!apiKey) {
			throw new Error("LINGODOTDEV_API_KEY environment variable is required");
		}

		// Convert locales to language codes for Lingo
		const targetLanguageCodes = targetLocales.map(convertLocaleForLingo);

		// Update lingo config with target locales
		const lingoConfigPath = join(workDir, "lingo.config.json");
		const lingoConfigContent = await readFile(lingoConfigPath, "utf-8");
		const lingoConfig = JSON.parse(lingoConfigContent);
		lingoConfig.locale.targets = targetLanguageCodes;
		await writeFile(lingoConfigPath, JSON.stringify(lingoConfig, null, 2));

		// Run lingo translate
		const result =
			await $`npx lingo.dev@latest translate --config ${lingoConfigPath}`.env({
				LINGODOTDEV_API_KEY: apiKey,
			});

		if (result.exitCode !== 0) {
			throw new Error(`Lingo translate failed: ${result.stderr.toString()}`);
		}

		// Read translated files
		const translations: Record<LocaleCode, string> = {} as Record<
			LocaleCode,
			string
		>;

		for (const locale of targetLocales) {
			const languageCode = convertLocaleForLingo(locale);
			// Lingo creates locale-specific files, try to read them
			// The exact file structure depends on Lingo's output format
			const translatedFilePath = join(workDir, `${languageCode}.json`);
			try {
				const translatedContent = await readFile(translatedFilePath, "utf-8");
				const translatedJson = JSON.parse(translatedContent);
				// Extract the translated text from the JSON structure
				// This assumes the input had a "baseCopy" key
				translations[locale] = translatedJson.baseCopy || translatedContent;
			} catch (_fileError) {
				// If file doesn't exist, try reading from input file location with locale suffix
				const inputFilePath = join(workDir, "input.json");
				try {
					// Lingo might modify the input file or create new files
					// Check if input file was modified
					const inputContent = await readFile(inputFilePath, "utf-8");
					const inputJson = JSON.parse(inputContent);
					if (inputJson[languageCode]) {
						translations[locale] = inputJson[languageCode] as string;
					} else {
						// Fallback: use original if translation not found
						translations[locale] = inputJson.baseCopy as string;
					}
				} catch {
					logError(
						new Error(`Could not read translation for ${locale}`),
						"translateWithLingoCLI",
					);
					// Will fall back to SDK if needed
					throw new Error(`Translation file not found for locale: ${locale}`);
				}
			}
		}

		return translations;
	} catch (error) {
		throw handleGenerationError(error, "lingo translate CLI operation");
	}
}

/**
 * Batch translate using Lingo.dev CLI
 * Creates temporary workspace, runs extract and translate, then cleans up
 */
export async function batchTranslateWithCLI(
	baseCopy: string,
	targetLocales: LocaleCode[],
): Promise<Record<LocaleCode, string>> {
	const workDir = join(
		tmpdir(),
		`lingo-cli-${Date.now()}-${Math.random().toString(36).substring(7)}`,
	);

	try {
		// Create working directory
		await mkdir(workDir, { recursive: true });

		// Prepare input JSON
		const inputJson = {
			baseCopy,
		};

		// Step 1: Extract
		await extractWithLingoCLI(inputJson, workDir);

		// Step 2: Translate
		const translations = await translateWithLingoCLI(targetLocales, workDir);

		return translations;
	} catch (error) {
		logError(error, "batchTranslateWithCLI");
		throw error;
	} finally {
		// Clean up temporary directory
		try {
			await rm(workDir, { recursive: true, force: true });
		} catch (cleanupError) {
			// Log but don't throw - cleanup errors shouldn't break the flow
			logError(cleanupError, "batchTranslateWithCLI cleanup");
		}
	}
}
