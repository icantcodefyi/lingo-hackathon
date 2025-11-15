import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import enTranslations from "../locales/en.json";

// Supported locales from lingo.config.json
const supportedLocales = ["en", "es", "fr", "de", "ja", "pt", "zh-CN", "ar"];

// Language names in their native language
export const languageNames: Record<string, string> = {
	en: "English",
	es: "Español",
	fr: "Français",
	de: "Deutsch",
	ja: "日本語",
	pt: "Português",
	"zh-CN": "简体中文",
	ar: "العربية",
};

// Load translations dynamically
const loadTranslations = async (locale: string) => {
	try {
		// For now, we'll use static import for English
		// Lingo.dev will generate other locale files
		if (locale === "en") {
			return enTranslations;
		}

		// For other locales, try to load from generated files
		// This will work once Lingo.dev generates the files
		const translations = await import(`../locales/${locale}.json`);
		return translations.default || translations;
	} catch (error) {
		console.warn(`Failed to load translations for locale: ${locale}`, error);
		return enTranslations; // Fallback to English
	}
};

// Initialize i18next
i18n
	.use(LanguageDetector) // Detects user language from browser/localStorage
	.init({
		resources: {
			en: {
				translation: enTranslations,
			},
		},
		fallbackLng: "en",
		supportedLngs: supportedLocales,
		defaultNS: "translation",
		ns: ["translation"],
		interpolation: {
			escapeValue: false, // React already escapes values
		},
		detection: {
			// Order of detection methods
			order: ["localStorage", "navigator"],
			// Keys to lookup language from
			lookupLocalStorage: "i18nextLng",
			// Cache user language
			caches: ["localStorage"],
		},
	});

// Function to load additional locale resources dynamically
export const loadLocale = async (locale: string) => {
	if (!supportedLocales.includes(locale)) {
		console.warn(`Locale ${locale} is not supported`);
		return;
	}

	try {
		const translations = await loadTranslations(locale);
		i18n.addResourceBundle(locale, "translation", translations, true, true);
	} catch (error) {
		console.error(`Failed to load locale ${locale}:`, error);
	}
};

// Preload common locales
const preloadLocales = async () => {
	// Load all supported locales in the background
	const loadPromises = supportedLocales.map((locale) => loadLocale(locale));
	await Promise.allSettled(loadPromises);
};

// Start preloading in the background
preloadLocales().catch(console.error);

export default i18n;
