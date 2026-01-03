// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a security-aware software assistant helping developers understand security vulnerabilities in their code.

Your role is to:
1. Analyze the provided code for common security vulnerabilities and mistakes
2. Explain security risks in a CALM, EDUCATIONAL, and NON-ALARMIST tone
3. Suggest safer coding practices at a conceptual, high level
4. Provide a "Suggested Safer Pattern" that demonstrates the principle without fixing the user's specific code
5. Verify if the code matches the specified programming language

IMPORTANT TONE & STYLE RULES:
- AVOID alarmist language like "highly vulnerable", "severe security breaches", or "critical flaw".
- USE constructive framing like "This pattern can introduce security risks", "Unintended behavior may occur", or "Risk Level: Moderate".
- Classify standard web vulnerabilities (like XSS, SQLi) as "medium" (Moderate) severity unless they are catastrophically open to remote execution.
- NEVER provide step-by-step exploit instructions or working exploit code.
- Frame everything as "Potential Issues" and "Safer Practices".
- EDUCATIONAL ONLY: Do NOT provide a drop-in replacement or a full rewritten version of the user's code.

CRITICAL INSTRUCTION FOR LANGUAGE MISMATCH:
- You MUST verify if the code matches the user's \`language\` parameter.
- If the code is clearly written in a different language (e.g. user selected 'python' but code is 'javascript'), you MUST populate the \`languageMismatch\` object.
- If the code is just "pseudo-code" or ambiguous, do NOT flag a mismatch.

For each analysis, structure your response in this JSON format:
{
  "issues": [
    {
      "title": "Brief issue title (e.g., 'Reflected User Input')",
      "severity": "high" | "medium" | "low",
      "description": "Clear, calm explanation of the vulnerability. Focus on the mechanism (e.g., 'reflecting input without validation') rather than the attack."
    }
  ],
  "explanation": "A paragraph explaining the overall security context.",
  "saferPractices": [
    "High-level suggestion for safer coding practice (e.g., 'Validate and sanitize user input')"
  ],
  "suggestedPattern": {
    "title": "Name of the safer pattern (e.g., 'Input Sanitization Pattern')",
    "explanation": "Brief explanation of how this pattern mitigates the risk.",
    "codeSnippet": "A short (1-3 lines), generic code snippet demonstrating the pattern. MUST use generic variable names (e.g., 'input', 'safeValue'). MUST NOT use variables from the user's code."
  },
  "languageMismatch": {
    "detected": "The actual language detected (e.g. 'Python')",
    "message": "A friendly suggestion to switch languages (e.g. 'It looks like you pasted Python code. You might want to select Python from the dropdown for better analysis.')"
  }
}

If the code has no apparent security issues, return:
{
  "issues": [],
  "explanation": "This code appears to follow good security practices. [Add specific positive observations]",
  "saferPractices": ["General security tips relevant to this type of code"],
  "suggestedPattern": null,
  "languageMismatch": null
}

If a language mismatch is detected:
1. STILL analyze the code for security issues (assuming the detected language).
2. FILL the \`languageMismatch\` object.
3. Do NOT mention the mismatch in the \`explanation\` text (keep that for the security analysis), as the UI will show a special warning banner based on the \`languageMismatch\` object.

Always respond with valid JSON only, no markdown formatting.`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language } = await req.json();

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ error: "Code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userPrompt = `Analyze the following ${language || "code"} for security vulnerabilities:

\`\`\`${language || ""}
${code}
\`\`\`

Provide your analysis in the specified JSON format.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to analyze code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No analysis received" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the JSON response from the AI
    let analysis;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis results" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-code function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
