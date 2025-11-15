import type { AdGenerationResponse } from "@my-better-t-app/api/types/ad-generation.types";
import type { ComplianceCheckResult } from "@my-better-t-app/api/types/compliance.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdGeneratorStepper } from "@/components/ad-generator-stepper";
import { AdResultsDisplay } from "@/components/ad-results-display";
import { ComplianceReportDisplay } from "@/components/compliance-report";
import Header from "@/components/header";
import ShaderBackground from "@/components/shader-background";
import { authClient } from "@/lib/auth-client";
import i18n from "@/lib/i18n";
import { client, orpc } from "@/utils/orpc";

export const Route = createFileRoute("/rizz-ads")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect({
				to: "/login",
			});
		}
		return { session };
	},
});

function RouteComponent() {
	const [adResults, setAdResults] = useState<AdGenerationResponse | null>(null);
	const [complianceReports, setComplianceReports] = useState<
		ComplianceCheckResult[]
	>([]);
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

	const { data: supportedLocales } = useQuery(
		orpc.getSupportedLocales.queryOptions(),
	);

	const { data: supportedPlatforms } = useQuery(
		orpc.getSupportedPlatforms.queryOptions(),
	);

	const generateAdsMutation = useMutation({
		mutationFn: async (data: Parameters<typeof client.generateAds>[0]) => {
			return client.generateAds(data);
		},
		onSuccess: (data) => {
			setAdResults(data);
			toast.success(
				`Successfully generated ads for ${data.results.length} locales!`,
			);
		},
		onError: (error) => {
			toast.error("Failed to generate ads. Please try again.");
			console.error(error);
		},
	});

	const checkComplianceMutation = useMutation({
		mutationFn: async (data: {
			adCopy: string;
			locale: string;
			platform: string;
			industry: string;
		}) => {
			return client.checkCompliance(data);
		},
		onSuccess: (data) => {
			setComplianceReports((prev) => [...prev, data]);
			toast.success("Compliance check complete!");
		},
		onError: (error) => {
			toast.error("Failed to check compliance. Please try again.");
			console.error(error);
		},
	});

	const handleGenerate = (data: Parameters<typeof client.generateAds>[0]) => {
		generateAdsMutation.mutate(data);
	};

	const handleRunCompliance = (
		locale: string,
		platform: string,
		adCopy: string,
	) => {
		const industry = adResults?.results?.[0]?.industry || "general";
		checkComplianceMutation.mutate({
			adCopy,
			locale,
			platform,
			industry,
		});
	};

	const handleExport = () => {
		if (!adResults) return;

		const exportData = {
			timestamp: new Date().toISOString(),
			ads: adResults.results,
			compliance: complianceReports,
		};

		const blob = new Blob([JSON.stringify(exportData, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `rizz-ads-export-${Date.now()}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		toast.success("Ads exported successfully!");
	};

	return (
		<ShaderBackground>
			<Header />

			<div className="container relative z-10 mx-auto max-w-7xl px-6 py-12">
				{/* Hero Section */}
				{!adResults && (
					<div className="fade-in slide-in-from-bottom-4 mb-16 animate-in space-y-4 text-center duration-700">
						<div className="mb-4 flex items-center justify-center gap-3">
							<h1 className="font-bold text-6xl text-white">
								<span className="instrument italic">Rizz</span>{" "}
								{t("rizzAds.title")}
							</h1>
						</div>
						<p className="mx-auto max-w-3xl text-white/80 text-xl">
							{t("rizzAds.subtitle")}
						</p>
						<p className="mx-auto max-w-2xl text-base text-white/60">
							{t("rizzAds.description")}
						</p>
					</div>
				)}

				{/* Main Content */}
				<div className="space-y-16">
					{!adResults && (
						<section className="fade-in slide-in-from-bottom-6 animate-in delay-150 duration-700">
							<AdGeneratorStepper
								onGenerate={handleGenerate}
								isLoading={generateAdsMutation.isPending}
								supportedLocales={supportedLocales || []}
								supportedPlatforms={supportedPlatforms || []}
							/>
						</section>
					)}

					{adResults && (
						<>
							<div className="fade-in slide-in-from-top-4 mb-8 animate-in text-center duration-500">
								<h2 className="mb-2 font-bold text-3xl text-white">
									{t("rizzAds.generatedAds")}
								</h2>
								<p className="text-white/60">{t("rizzAds.reviewAds")}</p>
							</div>
							<section className="fade-in slide-in-from-bottom-6 animate-in delay-100 duration-500">
								<AdResultsDisplay
									results={adResults.results}
									onRunCompliance={handleRunCompliance}
									onExport={handleExport}
								/>
							</section>
						</>
					)}

					{complianceReports.length > 0 && (
						<section className="fade-in slide-in-from-bottom-6 animate-in delay-200 duration-500">
							<ComplianceReportDisplay reports={complianceReports} />
						</section>
					)}
				</div>

				{/* Powered by Section */}
				<div className="fade-in mt-20 animate-in border-white/10 border-t pt-8 text-center delay-300 duration-700">
					<p className="text-sm text-white/40">
						{t("rizzAds.poweredBy")}{" "}
						<span className="font-semibold text-white/60">
							{t("rizzAds.poweredByTech")}
						</span>
					</p>
				</div>
			</div>
		</ShaderBackground>
	);
}
