import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, ShieldCheck, Lightbulb, Search, Brain, CheckCircle2, Copy, Check, FileCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SecurityIssue {
  title: string;
  severity: "high" | "medium" | "low";
  description: string;
}

export interface SuggestedFix {
  vulnerabilityName: string;
  whyThisWorks: string;
  vulnerableCode?: string | null;
  secureCode?: string | null;
  completeFixedCode?: string | null;
}

export interface LanguageMismatch {
  detected: string;
  message: string;
}

export interface AnalysisResult {
  issues: SecurityIssue[];
  explanation: string;
  saferPractices: string[];
  suggestedFix?: SuggestedFix | null;
  languageMismatch?: LanguageMismatch | null;
}

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const severityConfig = {
  high: {
    icon: AlertTriangle,
    label: "Risk Level: High",
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
  medium: {
    icon: AlertTriangle,
    label: "Risk Level: Moderate",
    className: "bg-warning/20 text-warning border-warning/30",
  },
  low: {
    icon: Info,
    label: "Risk Level: Low",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const [copied, setCopied] = useState(false);
  console.log("Analysis Result:", result);
  /* DEBUG: Force mock mismatch to test UI */
  // const debugResult = {
  //   ...result,
  //   languageMismatch: { detected: "JavaScript", message: "Debug Mode: Mismatch Detected" }
  // };
  // const effectiveResult = debugResult; 
  /* Use real result for now, but uncomment above lines to test locally if backend fails */

  const hasIssues = result.issues.length > 0;

  const handleCopyCode = async () => {
    if (result.suggestedFix?.completeFixedCode) {
      await navigator.clipboard.writeText(result.suggestedFix.completeFixedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Language Mismatch Warning */}
      {result.languageMismatch && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="result-card bg-orange-500/15 border-orange-500/50 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-500 mb-1">Language Mismatch Detected</h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {result.languageMismatch.message}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Issues Section */}
      <div className="result-card p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          {hasIssues ? (
            <Search className="w-5 h-5 text-primary" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-success" />
          )}
          <h3 className="text-lg font-semibold">
            {hasIssues ? "Potential Issues" : "No Issues Found"}
          </h3>
          {hasIssues && (
            <Badge variant="outline" className="ml-2 text-xs">
              {result.issues.length} found
            </Badge>
          )}
        </div>

        {hasIssues ? (
          <ul className="space-y-4">
            {result.issues.map((issue, index) => {
              const config = severityConfig[issue.severity];
              const Icon = config.icon;

              return (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-secondary/50 border border-border/50"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${issue.severity === 'high' ? 'text-destructive' :
                      issue.severity === 'medium' ? 'text-warning' : 'text-muted-foreground'
                      }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium">{issue.title}</span>
                        <Badge variant="outline" className={`text-xs ${config.className}`}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {issue.description}
                      </p>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <p className="text-sm text-foreground/80">
              Great job! This code appears to follow good security practices.
            </p>
          </div>
        )}
      </div>

      {/* Explanation Section */}
      <div className="result-card p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Explanation</h3>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {result.explanation}
        </p>
      </div>

      {/* AI-Generated Fix Section */}
      {result.suggestedFix && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="result-card p-4 sm:p-6 border-primary/20 bg-primary/5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">
              AI-Generated Fix for {result.suggestedFix.vulnerabilityName}
            </h3>
          </div>

          <div className="space-y-4">
            {/* Why This Works */}
            <div className="bg-secondary/30 rounded-lg p-4 border border-border/30">
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Why this fix works:
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.suggestedFix.whyThisWorks}
              </p>
            </div>

            {/* Before/After Code Comparison */}
            {(result.suggestedFix.vulnerableCode || result.suggestedFix.secureCode) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before (Vulnerable Code) */}
                {result.suggestedFix.vulnerableCode && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Before (Vulnerable Code):
                    </h4>
                    <div className="rounded-md bg-destructive/10 border border-destructive/30 p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-foreground/90 whitespace-pre-wrap">{result.suggestedFix.vulnerableCode}</pre>
                    </div>
                  </div>
                )}

                {/* After (Secure Fix) */}
                {result.suggestedFix.secureCode && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-success flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      After (Secure Fix):
                    </h4>
                    <div className="rounded-md bg-success/10 border border-success/30 p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-foreground/90 whitespace-pre-wrap">{result.suggestedFix.secureCode}</pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Complete Fixed Code Section */}
            {result.suggestedFix.completeFixedCode && (
              <div className="space-y-3 mt-6 pt-4 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-primary flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    Complete Secured Code (Copy & Paste Ready)
                  </h4>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-success/5 to-primary/5 border border-success/30 p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{result.suggestedFix.completeFixedCode}</pre>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  💡 Look for <code className="text-primary">// SECURITY FIX:</code> comments in the code above to understand each change.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Safer Practices Section */}
      <div className="result-card p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-success" />
          <h3 className="text-lg font-semibold">Safer Practices</h3>
        </div>
        <ul className="space-y-3">
          {result.saferPractices.map((practice, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-start gap-3"
            >
              <CheckCircle className="w-4 h-4 text-success mt-1 flex-shrink-0" />
              <span className="text-sm text-foreground/80">{practice}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
