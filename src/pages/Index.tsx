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
        completeFixedCode: fixDetails.completeFixedCode,
      };
    }

    // Generate completeFixedCode client-side if backend didn't provide it
    if (enhanced.suggestedFix && !enhanced.suggestedFix.completeFixedCode && enhanced.issues && enhanced.issues.length > 0) {
      enhanced.suggestedFix.completeFixedCode = generateCompleteFixedCode(code, enhanced.issues[0].title);
    }

    return enhanced;
  };

  // Generate complete fixed code with inline security comments
  const generateCompleteFixedCode = (code: string, issueTitle: string): string => {
    const title = issueTitle.toLowerCase();
    let fixedCode = code;

    // SQL Injection fix
    if (title.includes("sql") || title.includes("injection")) {
      // Find and replace concatenated SQL queries with parameterized versions
      fixedCode = fixedCode.replace(
        /(const|let|var)\s+(\w+)\s*=\s*["'`]([^"'`]*SELECT[^"'`]*)["'`]\s*\+\s*(\w+)/gi,
        (match, keyword, varName, queryPart, param) => {
          return `// SECURITY FIX: Using parameterized query to prevent SQL injection\n  ${keyword} ${varName} = "${queryPart}?"`;
        }
      );
      // Fix the db.query call
      fixedCode = fixedCode.replace(
        /db\.query\s*\(\s*(\w+)\s*,\s*\(/g,
        (match, queryVar) => {
          // Extract the parameter name from above
          const paramMatch = code.match(/["'`][^"'`]*["'`]\s*\+\s*(\w+)/);
          const paramName = paramMatch ? paramMatch[1] : 'userId';
          return `db.query(${queryVar}, [${paramName}], (`;
        }
      );
    }

    // XSS fix
    if (title.includes("xss") || title.includes("cross-site") || title.includes("reflected")) {
      // Add import at the top if not present
      if (!fixedCode.includes("escape-html") && !fixedCode.includes("escapeHtml")) {
        fixedCode = `// SECURITY FIX: Import HTML escaping library\nimport escapeHtml from "escape-html";\n\n${fixedCode}`;
      }
      // Replace direct user input in responses
      fixedCode = fixedCode.replace(
        /res\.send\s*\(\s*["'`]([^"'`]*)["'`]\s*\+\s*(\w+)\s*\)/g,
        (match, text, varName) => {
          return `// SECURITY FIX: Escape user input to prevent XSS\n  res.send("${text}" + escapeHtml(${varName}))`;
        }
      );
    }

    // Command Injection fix
    if (title.includes("command") || title.includes("exec") || title.includes("os")) {
      fixedCode = fixedCode.replace(
        /exec\s*\(\s*(\w+)\s*\)/g,
        (match, varName) => {
          return `// SECURITY FIX: Validate command against allowlist before execution\n  const allowedCommands = ["list", "status", "info"];\n  if (!allowedCommands.includes(${varName})) {\n    throw new Error("Command not allowed");\n  }\n  exec(${varName})`;
        }
      );
    }

    // Path Traversal fix
    if (title.includes("path") || title.includes("traversal") || title.includes("directory")) {
      // Add path import if not present
      if (!fixedCode.includes("require('path')") && !fixedCode.includes('require("path")') && !fixedCode.includes("from 'path'")) {
        fixedCode = `// SECURITY FIX: Import path module for safe path handling\nconst path = require("path");\nconst BASE_DIR = "/safe/base/directory";\n\n${fixedCode}`;
      }
      fixedCode = fixedCode.replace(
        /fs\.(readFile|writeFile|unlink|readdir)\s*\(\s*(\w+)/g,
        (match, method, varName) => {
          return `// SECURITY FIX: Validate path to prevent directory traversal\n  const safePath = path.resolve(BASE_DIR, ${varName});\n  if (!safePath.startsWith(BASE_DIR)) {\n    throw new Error("Access denied: path traversal detected");\n  }\n  fs.${method}(safePath`;
        }
      );
    }

    return fixedCode;
  };

  // Get vulnerability-specific fix with correct explanation matching the mitigation mechanism
  const getVulnerabilityFix = (issueTitle: string, code: string): {
    whyThisWorks: string;
    vulnerableCode: string | null;
    secureCode: string | null;
    completeFixedCode: string | null;
  } => {
    const title = issueTitle.toLowerCase();

    // SQL Injection - use parameterized queries explanation
    if (title.includes("sql") || title.includes("injection")) {
      // Try to extract the actual query from user's code
      const queryMatch = code.match(/["'`]SELECT[^"'`]+["'`]\s*\+\s*\w+/i);

      return {
        whyThisWorks: "This fix uses a parameterized SQL query, which ensures user input is treated strictly as data rather than executable SQL. This prevents attackers from modifying the query logic through crafted input.",
        vulnerableCode: queryMatch
          ? `const query = ${queryMatch[0]};\ndb.query(query, callback);`
          : 'const query = "SELECT * FROM users WHERE id = " + userId;\ndb.query(query, callback);',
        secureCode: 'const query = "SELECT * FROM users WHERE id = ?";\ndb.query(query, [userId], callback);',
        completeFixedCode: null, // Let the AI generate this
      };
    }

    // XSS - use HTML encoding/escaping explanation
    if (title.includes("xss") || title.includes("cross-site scripting") || title.includes("reflected")) {
      const sendMatch = code.match(/res\.send\s*\([^)]+\)/);

      return {
        whyThisWorks: "This fix applies HTML encoding to user input before inserting it into the response. Encoding converts special characters (like <, >, &) into safe HTML entities, preventing browsers from interpreting user data as executable code.",
        vulnerableCode: sendMatch?.[0] || 'res.send("Hello " + name);',
        secureCode: 'import { escapeHtml } from "escape-html";\nres.send("Hello " + escapeHtml(name));',
        completeFixedCode: null, // Let the AI generate this
      };
    }

    // Command Injection - use allowlist/validation explanation
    if (title.includes("command") || title.includes("exec") || title.includes("os")) {
      return {
        whyThisWorks: "This fix uses an allowlist to restrict which commands can be executed. By only permitting pre-approved operations, user input cannot be used to run arbitrary system commands.",
        vulnerableCode: 'exec(userCommand);',
        secureCode: 'const allowedCommands = ["list", "status"];\nif (allowedCommands.includes(userInput)) {\n  // Execute only pre-approved operations\n}',
        completeFixedCode: null, // Let the AI generate this
      };
    }

    // Path Traversal - use path validation explanation
    if (title.includes("path") || title.includes("traversal") || title.includes("directory")) {
      return {
        whyThisWorks: "This fix validates and normalizes file paths to ensure they stay within the allowed directory. Using path.resolve() and checking the prefix prevents directory traversal attacks.",
        vulnerableCode: 'fs.readFile(userPath);',
        secureCode: 'const safePath = path.resolve(baseDir, userInput);\nif (!safePath.startsWith(baseDir)) throw new Error("Invalid path");\nfs.readFile(safePath);',
        completeFixedCode: null, // Let the AI generate this
      };
    }

    // Generic fallback - but with honest explanation
    return {
      whyThisWorks: `Review the identified vulnerability and apply the appropriate security control. Common mitigations include input validation, parameterized queries, output encoding, or access control depending on the vulnerability type.`,
      vulnerableCode: null,
      secureCode: null,
      completeFixedCode: null,
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
        <footer className="mt-16 pt-8 text-center space-y-4">
          {/* Powered by Gemini Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 backdrop-blur-sm"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-medium bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Powered by Google Gemini
            </span>
          </motion.div>

          <p className="text-xs text-muted-foreground">
            Built for MLH Hack for Hackers • Educational purposes only • No exploit code generated
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

