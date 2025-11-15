import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
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
  if (!reports || reports.length === 0) {
    return null;
  }

  const getRiskColor = (risk: string) => {
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
      <div>
        <h2 className="text-2xl font-bold">Compliance Reports</h2>
        <p className="text-muted-foreground">
          {reports.length} ad{reports.length !== 1 ? "s" : ""} analyzed for
          compliance
        </p>
      </div>

      <Tabs defaultValue="0" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {reports.map((report, index) => (
            <TabsTrigger key={index} value={index.toString()}>
              {report.locale} - {report.platform}
            </TabsTrigger>
          ))}
        </TabsList>

        {reports.map((report, index) => (
          <TabsContent
            key={index}
            value={index.toString()}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Overall Risk Assessment</span>
                  <Badge
                    variant={
                      getRiskBadgeVariant(report.aiAnalysis.overallRisk) as any
                    }
                  >
                    {report.aiAnalysis.overallRisk.toUpperCase()} RISK
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {report.locale} • {report.platform} • {report.industry}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Original Ad Copy:</p>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    {report.adCopy}
                  </div>
                </div>
              </CardContent>
            </Card>

            {report.patternMatchedIssues.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pattern-Matched Issues</CardTitle>
                  <CardDescription>
                    Issues detected by rule-based pattern matching
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {report.patternMatchedIssues.map((issue, idx) => (
                    <div key={idx} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <p className="font-medium">{issue.rule}</p>
                          {issue.match && (
                            <p className="text-sm text-muted-foreground">
                              Matched: "{issue.match}"
                            </p>
                          )}
                          {issue.authority && (
                            <p className="text-xs text-muted-foreground">
                              Authority: {issue.authority}
                            </p>
                          )}
                          {issue.fix && (
                            <p className="text-sm mt-1 text-blue-600 dark:text-blue-400">
                              💡 {issue.fix}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {issue.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>AI-Detected Issues</CardTitle>
                <CardDescription>
                  Advanced compliance issues identified by AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.aiAnalysis.issues.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>No additional issues detected</span>
                  </div>
                ) : (
                  report.aiAnalysis.issues.map((issue, idx) => (
                    <div key={idx} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <p className="font-medium">{issue.issue}</p>
                          <p className="text-sm text-muted-foreground">
                            Rule: {issue.rule}
                          </p>
                          <p className="text-sm mt-1 text-blue-600 dark:text-blue-400">
                            💡 Suggested Fix: {issue.suggestedFix}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {issue.severity}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-green-500 dark:border-green-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Compliant Version
                </CardTitle>
                <CardDescription>
                  Auto-fixed ad copy that addresses all compliance issues
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
                  <p className="text-base">{report.aiAnalysis.autoFixedCopy}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium mb-1">
                    Explanation of Changes:
                  </p>
                  <p className="text-sm text-muted-foreground">
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
