import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { CodeInput } from "@/components/CodeInput";
import { AnalysisResults, AnalysisResult } from "@/components/AnalysisResults";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { checkLanguageMismatch } from "@/lib/languageDetection";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Store the code and language for client-side enhancement
  const lastAnalysisRef = useRef<{ code: string; language: string } | null>(null);

  const handleAnalyze = async (code: string, language: string) => {
    setIsLoading(true);
    setResult(null);
    lastAnalysisRef.current = { code, language };

    try {
      const { data, error } = await supabase.functions.invoke("analyze-code", {
        body: { code, language },
      });

      if (error) {
        console.error("Analysis error:", error);
        toast({
          title: "Analysis Failed",
          description: error.message || "Failed to analyze code. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.analysis) {
        // Apply client-side enhancements to ensure features work
        const enhancedResult = enhanceAnalysisResult(data.analysis, code, language);
        console.log("Enhanced result:", enhancedResult);
        setResult(enhancedResult);
      } else if (data?.error) {
        toast({
          title: "Analysis Failed",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side enhancement function to ensure languageMismatch and suggestedFix are present
  const enhanceAnalysisResult = (
    analysis: AnalysisResult,
    code: string,
    selectedLanguage: string
  ): AnalysisResult => {
    const enhanced = { ...analysis };

    // Apply client-side language mismatch detection if backend didn't provide it
    if (!enhanced.languageMismatch) {
      const mismatch = checkLanguageMismatch(code, selectedLanguage);
      if (mismatch) {
        enhanced.languageMismatch = mismatch;
      }
    }

    // Don't generate a fix if there's a language mismatch
    if (enhanced.languageMismatch) {
      enhanced.suggestedFix = null;
      return enhanced;
    }

    // Generate fallback suggested fix if backend didn't provide one
    if (!enhanced.suggestedFix && enhanced.issues && enhanced.issues.length > 0) {
      const primaryIssue = enhanced.issues[0];
      const fixDetails = getVulnerabilityFix(primaryIssue.title, code);

      enhanced.suggestedFix = {
        vulnerabilityName: primaryIssue.title,
        whyThisWorks: fixDetails.whyThisWorks,
        vulnerableCode: fixDetails.vulnerableCode,
        secureCode: fixDetails.secureCode,
      };
    }

    return enhanced;
  };

  // Get vulnerability-specific fix with correct explanation matching the mitigation mechanism
  const getVulnerabilityFix = (issueTitle: string, code: string): {
    whyThisWorks: string;
    vulnerableCode: string | null;
    secureCode: string | null
  } => {
    const title = issueTitle.toLowerCase();

    // SQL Injection - use parameterized queries explanation
    if (title.includes("sql") || title.includes("injection")) {
      // Try to extract the actual query from user's code
      const queryMatch = code.match(/["'`]SELECT[^"'`]+["'`]\s*\+\s*\w+/i);
      const dbQueryMatch = code.match(/db\.query\s*\([^)]+\)/);

      return {
        whyThisWorks: "This fix uses a parameterized SQL query, which ensures user input is treated strictly as data rather than executable SQL. This prevents attackers from modifying the query logic through crafted input.",
        vulnerableCode: queryMatch
          ? `const query = ${queryMatch[0]};\ndb.query(query, callback);`
          : 'const query = "SELECT * FROM users WHERE id = " + userId;\ndb.query(query, callback);',
        secureCode: 'const query = "SELECT * FROM users WHERE id = ?";\ndb.query(query, [userId], callback);',
      };
    }

    // XSS - use HTML encoding/escaping explanation
    if (title.includes("xss") || title.includes("cross-site scripting") || title.includes("reflected")) {
      const sendMatch = code.match(/res\.send\s*\([^)]+\)/);

      return {
        whyThisWorks: "This fix applies HTML encoding to user input before inserting it into the response. Encoding converts special characters (like <, >, &) into safe HTML entities, preventing browsers from interpreting user data as executable code.",
        vulnerableCode: sendMatch?.[0] || 'res.send("Hello " + name);',
        secureCode: 'import { escapeHtml } from "escape-html";\nres.send("Hello " + escapeHtml(name));',
      };
    }

    // Command Injection - use allowlist/validation explanation
    if (title.includes("command") || title.includes("exec") || title.includes("os")) {
      return {
        whyThisWorks: "This fix uses an allowlist to restrict which commands can be executed. By only permitting pre-approved operations, user input cannot be used to run arbitrary system commands.",
        vulnerableCode: 'exec(userCommand);',
        secureCode: 'const allowedCommands = ["list", "status"];\nif (allowedCommands.includes(userInput)) {\n  // Execute only pre-approved operations\n}',
      };
    }

    // Path Traversal - use path validation explanation
    if (title.includes("path") || title.includes("traversal") || title.includes("directory")) {
      return {
        whyThisWorks: "This fix validates and normalizes file paths to ensure they stay within the allowed directory. Using path.resolve() and checking the prefix prevents directory traversal attacks.",
        vulnerableCode: 'fs.readFile(userPath);',
        secureCode: 'const safePath = path.resolve(baseDir, userInput);\nif (!safePath.startsWith(baseDir)) throw new Error("Invalid path");\nfs.readFile(safePath);',
      };
    }

    // Generic fallback - but with honest explanation
    return {
      whyThisWorks: `Review the identified vulnerability and apply the appropriate security control. Common mitigations include input validation, parameterized queries, output encoding, or access control depending on the vulnerability type.`,
      vulnerableCode: null,
      secureCode: null,
    };
  };

  const handleReset = () => {
    setResult(null);
    lastAnalysisRef.current = null;
  };

  return (
    <div className="min-h-screen gradient-bg grid-pattern">
      <div className="container max-w-4xl mx-auto px-4 pb-16">
        <Header />

        <main className="space-y-8">
          <CodeInput
            onAnalyze={handleAnalyze}
            onReset={handleReset}
            isLoading={isLoading}
          />

          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LoadingState />
              </motion.div>
            )}

            {!isLoading && result && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AnalysisResults result={result} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state hint */}
          {!isLoading && !result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground text-sm">
                Paste your code above and click <span className="text-primary font-medium">Analyze</span> to get started
              </p>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Built for MLH Hackathon • Educational purposes only • No exploit code generated
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

