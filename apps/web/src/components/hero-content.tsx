import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import i18n from "@/lib/i18n";

export default function HeroContent() {
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
		<main className="absolute bottom-8 left-8 z-20 max-w-lg">
			<div className="text-left">
				<div
					className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm mb-4 relative"
					style={{
						filter: "url(#glass-effect)",
					}}
				>
					<div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
					<span className="text-white/90 text-xs font-light relative z-10">
						{t("hero.poweredBy")}
					</span>
				</div>

				{/* Main Heading */}
				<h1 className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-white mb-4">
					<span className="font-medium italic instrument">Rizz</span>{" "}
					{t("hero.titleSuffix")}
					<br />
					<span className="font-light tracking-tight text-white">
						{t("hero.subtitle")}
					</span>
				</h1>

				{/* Description */}
				<p className="text-xs font-light text-white/70 mb-4 leading-relaxed">
					{t("hero.description")}
				</p>

				{/* Buttons */}
				<div className="flex items-center gap-4 flex-wrap">
					<a
						href="https://lingo.dev"
						target="_blank"
						rel="noopener noreferrer"
						className="px-8 py-3 rounded-full bg-transparent border border-white/30 text-white font-normal text-xs transition-all duration-200 hover:bg-white/10 hover:border-white/50 cursor-pointer"
					>
						{t("hero.aboutLingo")}
					</a>
					<Link
						to="/rizz-ads"
						className="px-8 py-3 rounded-full bg-white text-black font-normal text-xs transition-all duration-200 hover:bg-white/90 cursor-pointer"
					>
						{t("hero.launchApp")}
					</Link>
				</div>
			</div>
		</main>
	);
}
