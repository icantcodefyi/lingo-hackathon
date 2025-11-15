import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { AdGeneratorForm } from "@/components/ad-generator-form";
import { AdResultsDisplay } from "@/components/ad-results-display";
import { ComplianceReportDisplay } from "@/components/compliance-report";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Shield, Globe2, Zap } from "lucide-react";

export const Route = createFileRoute("/rizz-ads")({
  component: RouteComponent,
});

function RouteComponent() {
  const [adResults, setAdResults] = useState<any>(null);
  const [complianceReports, setComplianceReports] = useState<any[]>([]);

  const { data: supportedLocales } = useQuery(
    orpc.getSupportedLocales.queryOptions()
  );

  const { data: supportedPlatforms } = useQuery(
    orpc.getSupportedPlatforms.queryOptions()
  );

  const generateAdsMutation = useMutation({
    mutationFn: async (data: any) => {
      return orpc.generateAds.mutate(data);
    },
    onSuccess: (data) => {
      setAdResults(data);
      toast.success(
        `Successfully generated ads for ${data.results.length} locales!`
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
      return orpc.checkCompliance.mutate(data);
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
    adCopy: string
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-12 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Rizz Ads
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Global Ad Generation + Compliance Engine
        </p>
        <p className="text-lg max-w-4xl mx-auto">
          Create, localize, and legally validate ads for any market in minutes.
          Powered by AI + Cultural Intelligence + Compliance Checking.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <Globe2 className="h-8 w-8 mb-2 text-blue-500" />
            <CardTitle>Cultural Adaptation</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Automatically adapt your ads for 10+ regions with culturally
              appropriate tone, emoji usage, and CTAs
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 mb-2 text-yellow-500" />
            <CardTitle>Platform Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Generate platform-specific formats for Google Ads, Meta, LinkedIn,
              and TikTok with perfect character limits
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 mb-2 text-green-500" />
            <CardTitle>Legal Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Validate against country laws, platform rules, and industry
              regulations with AI-powered auto-fixes
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="space-y-12">
        <section>
          <AdGeneratorForm
            onGenerate={handleGenerate}
            isLoading={generateAdsMutation.isPending}
            supportedLocales={supportedLocales || []}
            supportedPlatforms={supportedPlatforms || []}
          />
        </section>

        {adResults && (
          <section>
            <AdResultsDisplay
              results={adResults.results}
              onRunCompliance={handleRunCompliance}
              onExport={handleExport}
            />
          </section>
        )}

        {complianceReports.length > 0 && (
          <section>
            <ComplianceReportDisplay reports={complianceReports} />
          </section>
        )}
      </div>

      {/* Powered by Section */}
      <div className="mt-16 pt-8 border-t text-center">
        <p className="text-sm text-muted-foreground">
          Powered by <span className="font-semibold">Lingo.dev</span> + OpenAI
          GPT-4 + Cultural AI
        </p>
      </div>
    </div>
  );
}
