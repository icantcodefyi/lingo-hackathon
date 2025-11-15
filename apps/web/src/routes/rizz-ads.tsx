import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc, client } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";
import { AdGeneratorStepper } from "@/components/ad-generator-stepper";
import { AdResultsDisplay } from "@/components/ad-results-display";
import { ComplianceReportDisplay } from "@/components/compliance-report";
import { toast } from "sonner";
import ShaderBackground from "@/components/shader-background";
import Header from "@/components/header";
import { Sparkles } from "lucide-react";

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
	const [adResults, setAdResults] = useState<any>(null);
	const [complianceReports, setComplianceReports] = useState<any[]>([]);

	const { data: supportedLocales } = useQuery(
		orpc.getSupportedLocales.queryOptions(),
	);

	const { data: supportedPlatforms } = useQuery(
		orpc.getSupportedPlatforms.queryOptions(),
	);

	const generateAdsMutation = useMutation({
		mutationFn: async (data: any) => {
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

	const handleGenerate = (data: any) => {
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

			<div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
				{/* Hero Section */}
				{!adResults && (
					<div className="mb-16 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
						<div className="flex items-center justify-center gap-3 mb-4">
							<h1 className="text-6xl font-bold text-white">
								<span className="italic instrument">Rizz</span> Ads
							</h1>
						</div>
						<p className="text-xl text-white/80 max-w-3xl mx-auto">
							Global Ad Generation + Compliance Engine
						</p>
						<p className="text-base text-white/60 max-w-2xl mx-auto">
							Create, localize, and legally validate ads for any market in
							minutes
						</p>
					</div>
				)}

				{/* Main Content */}
				<div className="space-y-16">
					{!adResults && (
						<section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
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
							<div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
								<h2 className="text-3xl font-bold text-white mb-2">
									Your Generated Ads
								</h2>
								<p className="text-white/60">
									Review your localized ads and check compliance
								</p>
							</div>
							<section className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
								<AdResultsDisplay
									results={adResults.results}
									onRunCompliance={handleRunCompliance}
									onExport={handleExport}
								/>
							</section>
						</>
					)}

					{complianceReports.length > 0 && (
						<section className="animate-in fade-in slide-in-from-bottom-6 duration-500 delay-200">
							<ComplianceReportDisplay reports={complianceReports} />
						</section>
					)}
				</div>

				{/* Powered by Section */}
				<div className="mt-20 pt-8 border-t border-white/10 text-center animate-in fade-in duration-700 delay-300">
					<p className="text-sm text-white/40">
						Powered by{" "}
						<span className="font-semibold text-white/60">Lingo.dev</span> +
						OpenAI GPT-4 + Cultural AI
					</p>
				</div>
			</div>
		</ShaderBackground>
	);
}
