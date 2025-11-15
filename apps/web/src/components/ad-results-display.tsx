import type { PlatformAdFormat } from "@my-better-t-app/api/types/ad-generation.types";
import { AlertTriangle, Download, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import i18n from "@/lib/i18n";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface AdResult {
	locale: string;
	translatedCopy: string;
	culturalNotes: string;
	platformAds: Record<string, PlatformAdFormat>;
	config: {
		tone: string;
		emojiTolerance: string;
		formality: string;
		cta: string;
	};
}

interface AdResultsDisplayProps {
	results: AdResult[];
	onRunCompliance: (locale: string, platform: string, adCopy: string) => void;
	onExport: () => void;
}

export function AdResultsDisplay({
	results,
	onRunCompliance,
	onExport,
}: AdResultsDisplayProps) {
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

	const t = (key: string) => i18n.t(key);

	if (!results || results.length === 0) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div className="fade-in slide-in-from-top-4 flex animate-in items-center justify-between duration-500">
				<div>
					<h2 className="font-bold text-2xl text-white">
						{t("adResults.title")}
					</h2>
					<p className="text-white/60">
						{results.length} {t("adResults.variationsCreated")}
					</p>
				</div>
				<Button
					onClick={onExport}
					className="border border-white/20 bg-white/10 text-white transition-all duration-200 hover:bg-white/20"
				>
					<Download className="mr-2 h-4 w-4" />
					{t("adResults.exportAll")}
				</Button>
			</div>

			<Tabs defaultValue={results[0]?.locale} className="w-full">
				<TabsList className="w-full justify-start overflow-x-auto border border-white/10 bg-white/5 p-1">
					{results.map((result, index) => (
						<TabsTrigger
							key={result.locale}
							value={result.locale}
							className="text-white/70 transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-white"
							style={{ animationDelay: `${index * 50}ms` }}
						>
							<Globe className="mr-2 h-4 w-4" />
							{result.locale}
						</TabsTrigger>
					))}
				</TabsList>

				{results.map((result) => (
					<TabsContent
						key={result.locale}
						value={result.locale}
						className="fade-in slide-in-from-bottom-4 animate-in space-y-4 duration-500"
					>
						<Card className="border-white/10 bg-white/5 backdrop-blur-xl">
							<CardHeader>
								<CardTitle className="flex items-center justify-between text-white">
									<span>
										{t("adResults.baseTranslation")} - {result.locale}
									</span>
									<Badge
										variant="outline"
										className="border-white/20 text-white/80"
									>
										{result.config.formality}
									</Badge>
								</CardTitle>
								<CardDescription className="text-white/60">
									{t("adResults.culturalTone")}: {result.config.tone}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-lg border border-white/10 bg-white/10 p-4 transition-all duration-200 hover:bg-white/[0.12]">
									<p className="text-lg text-white">{result.translatedCopy}</p>
								</div>
								<div className="rounded-lg border-blue-500 border-l-4 bg-blue-500/10 p-4 backdrop-blur-sm">
									<p className="mb-1 font-medium text-sm text-white">
										{t("adResults.culturalNotes")}:
									</p>
									<p className="text-sm text-white/70">
										{result.culturalNotes}
									</p>
								</div>
								<div className="grid grid-cols-2 gap-2 text-sm text-white/80">
									<div>
										<span className="font-medium text-white">
											{t("adResults.emojiTolerance")}:
										</span>{" "}
										{result.config.emojiTolerance}
									</div>
									<div>
										<span className="font-medium text-white">
											{t("adResults.cta")}:
										</span>{" "}
										{result.config.cta}
									</div>
								</div>
							</CardContent>
						</Card>

						<div className="space-y-4">
							<h3 className="font-semibold text-white text-xl">
								{t("adResults.platformVariations")}
							</h3>
							{Object.entries(result.platformAds).map(
								([platform, ad]: [string, PlatformAdFormat], index) => (
									<Card
										key={platform}
										className="fade-in slide-in-from-bottom-4 animate-in border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:border-white/20"
										style={{ animationDelay: `${index * 100}ms` }}
									>
										<CardHeader>
											<CardTitle className="flex items-center justify-between text-white">
												<span className="capitalize">{platform}</span>
												<Button
													variant="outline"
													size="sm"
													onClick={() => {
														const adText = Object.values(ad)
															.filter(Boolean)
															.join(" ");
														onRunCompliance(result.locale, platform, adText);
													}}
													className="border-white/20 bg-white/10 text-white transition-all duration-200 hover:bg-white/20"
												>
													<AlertTriangle className="mr-2 h-4 w-4" />
													{t("adResults.checkCompliance")}
												</Button>
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-2">
												{Object.entries(ad).map(([key, value]) => {
													if (!value) return null;
													return (
														<div key={key} className="space-y-1">
															<Label className="font-medium text-white/50 text-xs uppercase">
																{key.replace(/([A-Z])/g, " $1").trim()}
															</Label>
															<div className="rounded border border-white/10 bg-white/10 p-2 text-sm text-white transition-all duration-200 hover:bg-white/[0.12]">
																{value as string}
															</div>
														</div>
													);
												})}
											</div>
										</CardContent>
									</Card>
								),
							)}
						</div>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}

function Label({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return <div className={className}>{children}</div>;
}
