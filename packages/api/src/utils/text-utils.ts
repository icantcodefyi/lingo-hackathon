/**
 * Text processing and validation utilities
 */

/**
 * Validate character length against constraint
 */
export function validateLength(text: string, maxLength: number) {
	const length = text.length;
	return {
		valid: length <= maxLength,
		length,
		exceeded: Math.max(0, length - maxLength),
	};
}

/**
 * Truncate text to fit within character limit while preserving words
 */
export function smartTruncate(text: string, maxLength: number, suffix = "...") {
	if (text.length <= maxLength) {
		return text;
	}

	const truncateLength = maxLength - suffix.length;
	const lastSpace = text.lastIndexOf(" ", truncateLength);

	if (lastSpace > 0) {
		return text.substring(0, lastSpace) + suffix;
	}

	return text.substring(0, truncateLength) + suffix;
}

/**
 * Count emoji in text
 */
export function countEmoji(text: string) {
	// Basic emoji regex pattern
	const emojiRegex =
		/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
	const matches = text.match(emojiRegex);
	return matches ? matches.length : 0;
}

/**
 * Calculate text complexity score (0-100)
 */
export function calculateComplexity(text: string) {
	const words = text.split(/\s+/);
	const avgWordLength =
		words.reduce((sum, word) => sum + word.length, 0) / words.length;
	const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
	const avgSentenceLength = words.length / Math.max(sentences.length, 1);

	// Simple complexity score based on word and sentence length
	const complexity = (avgWordLength * 5 + avgSentenceLength) / 2;
	return Math.min(100, Math.max(0, complexity));
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string, maxKeywords = 5) {
	const stopWords = new Set([
		"a",
		"an",
		"and",
		"are",
		"as",
		"at",
		"be",
		"by",
		"for",
		"from",
		"has",
		"he",
		"in",
		"is",
		"it",
		"its",
		"of",
		"on",
		"that",
		"the",
		"to",
		"was",
		"will",
		"with",
	]);

	const words = text
		.toLowerCase()
		.replace(/[^\w\s]/g, "")
		.split(/\s+/)
		.filter((word) => word.length > 3 && !stopWords.has(word));

	// Count word frequency
	const frequency = new Map<string, number>();
	for (const word of words) {
		frequency.set(word, (frequency.get(word) || 0) + 1);
	}

	// Sort by frequency and return top keywords
	return Array.from(frequency.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, maxKeywords)
		.map(([word]) => word);
}

/**
 * Clean and normalize text
 */
export function normalizeText(text: string) {
	return text
		.replace(/\s+/g, " ") // Replace multiple spaces with single space
		.replace(/[^\S\n]+/g, " ") // Normalize whitespace except newlines
		.trim();
}

/**
 * Check if text contains excessive capitalization
 */
export function hasExcessiveCaps(text: string) {
	const words = text.split(/\s+/);
	const capsWords = words.filter((word) => /^[A-Z]{2,}$/.test(word));
	return capsWords.length / words.length > 0.3; // More than 30% all-caps words
}

/**
 * Check if text contains excessive punctuation
 */
export function hasExcessivePunctuation(text: string) {
	return /[!?]{2,}/.test(text) || /\.{3,}/.test(text);
}

/**
 * Calculate reading time in seconds
 */
export function estimateReadingTime(text: string) {
	const wordsPerMinute = 200; // Average reading speed
	const words = text.split(/\s+/).length;
	return Math.ceil((words / wordsPerMinute) * 60);
}

/**
 * Sanitize text for safe output
 */
export function sanitizeText(text: string) {
	return text
		.replace(/[<>]/g, "") // Remove angle brackets
		.replace(/\0/g, "") // Remove null bytes
		.trim();
}
