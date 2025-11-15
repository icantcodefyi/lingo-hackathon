import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import i18n from "@/lib/i18n";
import { Badge } from "./ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ComplianceIssue {
	issue: string;
	severity: "high" | "medium" | "low";
	rule: string;
	suggestedFix: string;
}

interface ComplianceReport {
	adCopy: string;
	locale: string;
	platform: string;
	industry: string;
	patternMatchedIssues: Array<{
		id: string;
		rule: string;
		severity: string;
		match?: string;
		fix?: string;
		authority?: string;
	}>;
	aiAnalysis: {
		issues: ComplianceIssue[];
		overallRisk: "high" | "medium" | "low";
		autoFixedCopy: string;
		explanation: string;
	};
}

interface ComplianceReportProps {
	reports: ComplianceReport[];
}

export function ComplianceReportDisplay({ reports }: ComplianceReportProps) {
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

	if (!reports || reports.length === 0) {
		return null;
	}

	const _getRiskColor = (risk: string) => {
		switch (risk) {
			case "high":
				return "text-red-500";
			case "medium":
				return "text-yellow-500";
			case "low":
				return "text-green-500";
			default:
				return "text-gray-500";
		}
	};

	const getRiskBadgeVariant = (risk: string) => {
		switch (risk) {
			case "high":
				return "destructive";
			case "medium":
				return "secondary";
			case "low":
				return "default";
			default:
				return "outline";
		}
	};

	const getSeverityIcon = (severity: string) => {
		switch (severity) {
			case "high":
				return <XCircle className="h-4 w-4 text-red-500" />;
			case "medium":
				return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
			case "low":
				return <Info className="h-4 w-4 text-blue-500" />;
			default:
				return <Info className="h-4 w-4" />;
		}
	};

	return (
		<div className="space-y-6">
			<div className="fade-in slide-in-from-top-4 animate-in duration-500">
				<h2 className="font-bold text-2xl text-white">
					{t("compliance.title")}
				</h2>
				<p className="text-white/60">
					{reports.length}{" "}
					{reports.length !== 1
						? t("compliance.adsAnalyzedPlural")
						: t("compliance.adsAnalyzed")}{" "}
					{t("compliance.analyzedFor")}
				</p>
			</div>

			<Tabs defaultValue="0" className="w-full">
				<TabsList className="w-full justify-start overflow-x-auto border border-white/10 bg-white/5 p-1">
					{reports.map((report, index) => (
						<TabsTrigger
							key={`tab-${index}-${report.locale}-${report.platform}`}
							value={index.toString()}
							className="text-white/70 transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-white"
						>
							{report.locale} - {report.platform}
						</TabsTrigger>
					))}
				</TabsList>

				{reports.map((report, index) => (
					<TabsContent
						key={`content-${index}-${report.locale}-${report.platform}`}
						value={index.toString()}
						className="fade-in slide-in-from-bottom-4 animate-in space-y-4 duration-500"
					>
						<Card className="border-white/10 bg-white/5 backdrop-blur-xl">
							<CardHeader>
								<CardTitle className="flex items-center justify-between text-white">
									<span>{t("compliance.overallRisk")}</span>
									<Badge
										variant={getRiskBadgeVariant(report.aiAnalysis.overallRisk)}
										className="fade-in animate-in duration-300"
									>
										{report.aiAnalysis.overallRisk.toUpperCase()}{" "}
										{t("compliance.risk")}
									</Badge>
								</CardTitle>
								<CardDescription className="text-white/60">
									{report.locale} • {report.platform} • {report.industry}
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<p className="mb-2 font-medium text-sm text-white">
										{t("compliance.originalAdCopy")}:
									</p>
									<div className="rounded-lg border border-white/10 bg-white/10 p-3 text-sm text-white">
										{report.adCopy}
									</div>
								</div>
							</CardContent>
						</Card>

						{report.patternMatchedIssues.length > 0 && (
							<Card className="border-white/10 bg-white/5 backdrop-blur-xl">
								<CardHeader>
									<CardTitle className="text-white">
										Pattern-Matched Issues
									</CardTitle>
									<CardDescription className="text-white/60">
										Issues detected by rule-based pattern matching
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									{report.patternMatchedIssues.map((issue, idx) => (
										<div
											key={`pattern-issue-${idx}-${issue.id}`}
											className="fade-in slide-in-from-left-4 animate-in space-y-2 rounded-lg border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:bg-white/[0.07]"
											style={{ animationDelay: `${idx * 50}ms` }}
										>
											<div className="flex items-start gap-2">
												{getSeverityIcon(issue.severity)}
												<div className="flex-1">
													<p className="font-medium text-white">{issue.rule}</p>
													{issue.match && (
														<p className="text-sm text-white/60">
															Matched: "{issue.match}"
														</p>
													)}
													{issue.authority && (
														<p className="text-white/50 text-xs">
															Authority: {issue.authority}
														</p>
													)}
													{issue.fix && (
														<p className="mt-1 text-blue-400 text-sm">
															💡 {issue.fix}
														</p>
													)}
												</div>
												<Badge
													variant="outline"
													className="border-white/20 text-white/80 text-xs"
												>
													{issue.severity}
												</Badge>
											</div>
										</div>
									))}
								</CardContent>
							</Card>
						)}

						<Card className="border-white/10 bg-white/5 backdrop-blur-xl">
							<CardHeader>
								<CardTitle className="text-white">AI-Detected Issues</CardTitle>
								<CardDescription className="text-white/60">
									Advanced compliance issues identified by AI analysis
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{report.aiAnalysis.issues.length === 0 ? (
									<div className="fade-in flex animate-in items-center gap-2 text-green-400 duration-300">
										<CheckCircle2 className="h-5 w-5" />
										<span>No additional issues detected</span>
									</div>
								) : (
									report.aiAnalysis.issues.map((issue, idx) => (
										<div
											key={`ai-issue-${idx}-${issue.rule}`}
											className="fade-in slide-in-from-left-4 animate-in space-y-2 rounded-lg border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:bg-white/[0.07]"
											style={{ animationDelay: `${idx * 50}ms` }}
										>
											<div className="flex items-start gap-2">
												{getSeverityIcon(issue.severity)}
												<div className="flex-1">
													<p className="font-medium text-white">
														{issue.issue}
													</p>
													<p className="text-sm text-white/60">
														Rule: {issue.rule}
													</p>
													<p className="mt-1 text-blue-400 text-sm">
														💡 Suggested Fix: {issue.suggestedFix}
													</p>
												</div>
												<Badge
													variant="outline"
													className="border-white/20 text-white/80 text-xs"
												>
													{issue.severity}
												</Badge>
											</div>
										</div>
									))
								)}
							</CardContent>
						</Card>

						<Card className="fade-in animate-in border-green-500/50 bg-white/5 backdrop-blur-xl duration-500">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-white">
									<CheckCircle2 className="h-5 w-5 animate-pulse text-green-400" />
									Compliant Version
								</CardTitle>
								<CardDescription className="text-white/60">
									Auto-fixed ad copy that addresses all compliance issues
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 transition-all duration-200 hover:bg-green-500/[0.12]">
									<p className="text-base text-white">
										{report.aiAnalysis.autoFixedCopy}
									</p>
								</div>
								<div className="rounded-lg border border-white/10 bg-white/10 p-3">
									<p className="mb-1 font-medium text-sm text-white">
										Explanation of Changes:
									</p>
									<p className="text-sm text-white/70">
										{report.aiAnalysis.explanation}
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
