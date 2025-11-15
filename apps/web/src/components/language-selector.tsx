import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import i18n, { languageNames, loadLocale } from "@/lib/i18n";

const supportedLocales = ["en", "es", "fr", "de", "ja", "pt", "zh-CN", "ar"];

export default function LanguageSelector() {
	const [isLoading, setIsLoading] = useState(false);
	const [language, setLanguage] = useState(i18n.language);

	// Ensure current locale is loaded
	useEffect(() => {
		const currentLocale = i18n.language.split("-")[0] || "en";
		if (!i18n.hasResourceBundle(currentLocale, "translation")) {
			setIsLoading(true);
			loadLocale(currentLocale)
				.catch(console.error)
				.finally(() => setIsLoading(false));
		}
	}, []);

	// Listen for language changes
	useEffect(() => {
		const handleLanguageChanged = (lng: string) => {
			setLanguage(lng);
		};

		i18n.on("languageChanged", handleLanguageChanged);
		return () => {
			i18n.off("languageChanged", handleLanguageChanged);
		};
	}, []);

	const handleLanguageChange = async (locale: string) => {
		setIsLoading(true);
		try {
			// Load locale if not already loaded
			await loadLocale(locale);
			// Change language
			await i18n.changeLanguage(locale);
		} catch (error) {
			console.error("Failed to change language:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Get current language (handle locale codes like "en-US" -> "en")
	const currentLanguage =
		supportedLocales.find((loc) => language.startsWith(loc)) || "en";

	return (
		<Select
			value={currentLanguage}
			onValueChange={handleLanguageChange}
			disabled={isLoading}
		>
			<SelectTrigger
				size="sm"
				className="w-[140px] border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
			>
				<SelectValue placeholder="Language">
					{languageNames[currentLanguage] || currentLanguage}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{supportedLocales.map((locale) => (
					<SelectItem key={locale} value={locale}>
						{languageNames[locale] || locale}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
