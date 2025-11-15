import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Download, Globe, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import i18n from "@/lib/i18n";

interface AdResult {
	locale: string;
	translatedCopy: string;
	culturalNotes: string;
	platformAds: Record<string, any>;
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

	if (!results || results.length === 0) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
				<div>
					<h2 className="text-2xl font-bold text-white">{t("adResults.title")}</h2>
					<p className="text-white/60">
						{results.length} {t("adResults.variationsCreated")}
					</p>
				</div>
				<Button 
					onClick={onExport}
					className="bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-200"
				>
					<Download className="mr-2 h-4 w-4" />
					{t("adResults.exportAll")}
				</Button>
			</div>

			<Tabs defaultValue={results[0]?.locale} className="w-full">
				<TabsList className="w-full justify-start overflow-x-auto bg-white/5 border border-white/10 p-1">
					{results.map((result, index) => (
						<TabsTrigger 
							key={result.locale} 
							value={result.locale}
							className="data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300 text-white/70"
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
						className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
					>
						<Card className="bg-white/5 border-white/10 backdrop-blur-xl">
							<CardHeader>
								<CardTitle className="flex items-center justify-between text-white">
									<span>{t("adResults.baseTranslation")} - {result.locale}</span>
									<Badge variant="outline" className="border-white/20 text-white/80">{result.config.formality}</Badge>
								</CardTitle>
								<CardDescription className="text-white/60">
									{t("adResults.culturalTone")}: {result.config.tone}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-lg bg-white/10 p-4 border border-white/10 transition-all duration-200 hover:bg-white/[0.12]">
									<p className="text-lg text-white">{result.translatedCopy}</p>
								</div>
								<div className="rounded-lg border-l-4 border-blue-500 bg-blue-500/10 p-4 backdrop-blur-sm">
									<p className="text-sm font-medium mb-1 text-white">{t("adResults.culturalNotes")}:</p>
									<p className="text-sm text-white/70">{result.culturalNotes}</p>
								</div>
								<div className="grid grid-cols-2 gap-2 text-sm text-white/80">
									<div>
										<span className="font-medium text-white">{t("adResults.emojiTolerance")}:</span>{" "}
										{result.config.emojiTolerance}
									</div>
									<div>
										<span className="font-medium text-white">{t("adResults.cta")}:</span>{" "}
										{result.config.cta}
									</div>
								</div>
							</CardContent>
						</Card>

						<div className="space-y-4">
							<h3 className="text-xl font-semibold text-white">
								{t("adResults.platformVariations")}
							</h3>
							{Object.entries(result.platformAds).map(
								([platform, ad]: [string, any], index) => (
									<Card 
										key={platform}
										className="bg-white/5 border-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500 hover:border-white/20 transition-all"
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
													className="bg-white/10 hover:bg-white/20 border-white/20 text-white transition-all duration-200"
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
															<Label className="text-xs font-medium uppercase text-white/50">
																{key.replace(/([A-Z])/g, " $1").trim()}
															</Label>
															<div className="rounded bg-white/10 p-2 text-sm text-white border border-white/10 transition-all duration-200 hover:bg-white/[0.12]">
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
