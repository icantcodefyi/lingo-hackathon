import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import i18n from "@/lib/i18n";
import LanguageSelector from "./language-selector";

export default function Header() {
	const [language, setLanguage] = useState(i18n.language);

	useEffect(() => {
		const handleLanguageChanged = (lng: string) => {
			setLanguage(lng);
		};

		i18n.on("languageChanged", handleLanguageChanged);
		return () => {
			i18n.off("languageChanged", handleLanguageChanged);
		};
	}, []);

	const t = (key: string) => i18n.t(key);

	return (
		<header className="relative z-20 flex items-center justify-between p-6 animate-in fade-in slide-in-from-top-4 duration-700">
			{/* Logo */}
			<Link to="/" className="flex items-center group">
				<span className="text-2xl font-medium text-white transition-all duration-200">
					<span className="italic instrument">Rizz</span> Ads
				</span>
			</Link>

			{/* Navigation */}
			<nav className="flex items-center space-x-2">
				<LanguageSelector />
			</nav>

		{/* Auth Actions */}
		<div className="relative flex items-center gap-3">
			<Link
				to="/rizz-ads"
				className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center"
			>
				Launch App
			</Link>
		</div>
		</header>
	);
}
