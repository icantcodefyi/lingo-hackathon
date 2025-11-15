import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import i18n from "@/lib/i18n";
import { authClient } from "@/lib/auth-client";
import UserMenu from "./user-menu";
import LanguageSelector from "./language-selector";

export default function Header() {
	const { data: session } = authClient.useSession();
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
				<a
					href="https://lingo.dev"
					target="_blank"
					rel="noopener noreferrer"
					className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
				>
					{t("header.lingoDev")}
				</a>
				<a
					href="https://github.com"
					target="_blank"
					rel="noopener noreferrer"
					className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
				>
					{t("header.github")}
				</a>
				<LanguageSelector />
			</nav>

			{/* Auth Actions */}
			<div className="relative flex items-center gap-3">
				{session && (
					<Link
						to="/rizz-ads"
						className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
					>
						{t("common.app")}
					</Link>
				)}

				{!session ? (
					<Link
						to="/login"
						className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center"
					>
						{t("common.signIn")}
					</Link>
				) : (
					<div className="[&_button]:bg-white/10 [&_button]:backdrop-blur-sm [&_button]:text-white [&_button]:border-white/20 [&_button]:hover:bg-white/20 [&_button]:transition-all [&_button]:duration-200">
						<UserMenu />
					</div>
				)}
			</div>
		</header>
	);
}
