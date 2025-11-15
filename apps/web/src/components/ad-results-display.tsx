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
	if (!results || results.length === 0) {
		return null;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Generated Ads</h2>
					<p className="text-muted-foreground">
						{results.length} localized ad variations created
					</p>
				</div>
				<Button onClick={onExport}>
					<Download className="mr-2 h-4 w-4" />
					Export All
				</Button>
			</div>

			<Tabs defaultValue={results[0]?.locale} className="w-full">
				<TabsList className="w-full justify-start overflow-x-auto">
					{results.map((result) => (
						<TabsTrigger key={result.locale} value={result.locale}>
							<Globe className="mr-2 h-4 w-4" />
							{result.locale}
						</TabsTrigger>
					))}
				</TabsList>

				{results.map((result) => (
					<TabsContent
						key={result.locale}
						value={result.locale}
						className="space-y-4"
					>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center justify-between">
									<span>Base Translation - {result.locale}</span>
									<Badge variant="outline">{result.config.formality}</Badge>
								</CardTitle>
								<CardDescription>
									Cultural tone: {result.config.tone}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-lg bg-muted p-4">
									<p className="text-lg">{result.translatedCopy}</p>
								</div>
								<div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 p-4">
									<p className="text-sm font-medium mb-1">Cultural Notes:</p>
									<p className="text-sm">{result.culturalNotes}</p>
								</div>
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div>
										<span className="font-medium">Emoji Tolerance:</span>{" "}
										{result.config.emojiTolerance}
									</div>
									<div>
										<span className="font-medium">CTA:</span>{" "}
										{result.config.cta}
									</div>
								</div>
							</CardContent>
						</Card>

						<div className="space-y-4">
							<h3 className="text-xl font-semibold">
								Platform-Specific Variations
							</h3>
							{Object.entries(result.platformAds).map(
								([platform, ad]: [string, any]) => (
									<Card key={platform}>
										<CardHeader>
											<CardTitle className="flex items-center justify-between">
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
												>
													<AlertTriangle className="mr-2 h-4 w-4" />
													Check Compliance
												</Button>
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-2">
												{Object.entries(ad).map(([key, value]) => {
													if (!value) return null;
													return (
														<div key={key} className="space-y-1">
															<Label className="text-xs font-medium uppercase text-muted-foreground">
																{key.replace(/([A-Z])/g, " $1").trim()}
															</Label>
															<div className="rounded bg-muted p-2 text-sm">
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
