import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import i18n from "@/lib/i18n";
import LanguageSelector from "./language-selector";

export default function Header() {
	const [_language, setLanguage] = useState(i18n.language);

	useEffect(() => {
		const handleLanguageChanged = (lng: string) => {
			setLanguage(lng);
		};

		i18n.on("languageChanged", handleLanguageChanged);
		return () => {
			i18n.off("languageChanged", handleLanguageChanged);
		};
	}, []);

	const _t = (key: string) => i18n.t(key);

	return (
		<header className="fade-in slide-in-from-top-4 relative z-20 flex animate-in items-center justify-between p-6 duration-700">
			{/* Logo */}
			<Link to="/" className="group flex items-center">
				<span className="font-medium text-2xl text-white transition-all duration-200">
					<span className="instrument italic">Rizz</span> Ads
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
					className="flex h-8 cursor-pointer items-center rounded-full bg-white px-6 py-2 font-normal text-black text-xs transition-all duration-300 hover:bg-white/90"
				>
					Launch App
				</Link>
			</div>
		</header>
	);
}
