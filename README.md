<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&duration=4000&pause=1000&color=00D9FF&center=true&vCenter=true&width=600&lines=CodeShield+AI;AI-Powered+Security+Vulnerability+Analyzer" alt="CodeShield AI" />
</p>

<p align="center">
  <strong>🛡️ An AI-powered educational tool that helps developers identify and understand security vulnerabilities in their code</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <a href="https://code-shield-ai-sable.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-00D9FF?style=for-the-badge" alt="Live Demo" />
  </a>
  <a href="https://youtu.be/8H5rtUYTVc8" target="_blank">
    <img src="https://img.shields.io/badge/📺_Video_Presentation-FF0000?style=for-the-badge&logo=youtube&logoColor=white" alt="Video Presentation" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4.19-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Edge_Functions-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Google-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/PedroAugusto2004/code-guardian-ai?style=flat-square" alt="License" />
  <img src="https://img.shields.io/github/stars/PedroAugusto2004/code-guardian-ai?style=flat-square" alt="Stars" />
  <img src="https://img.shields.io/github/forks/PedroAugusto2004/code-guardian-ai?style=flat-square" alt="Forks" />
  <img src="https://img.shields.io/github/issues/PedroAugusto2004/code-guardian-ai?style=flat-square" alt="Issues" />
</p>

---

## 📖 About

**CodeShield AI** is an educational web application designed to help developers understand and identify common security vulnerabilities in their code. Unlike traditional security scanners that output complex, technical jargon, CodeShield AI provides:

- **Clear, educational explanations** in plain English
- **Visual severity indicators** with risk levels (High, Moderate, Low)
- **Actionable remediation guidance** with before/after code examples
- **Language mismatch detection** to ensure accurate analysis

> ⚠️ **Important**: This is an **educational tool**, NOT a penetration testing tool. It never provides exploit code or hacking instructions.

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>🔍 Multi-Language Support</h3>
      <p>Analyze code in 12+ programming languages including JavaScript, TypeScript, Python, Java, C#, C++, Go, Rust, Kotlin, Ruby, PHP, and Swift.</p>
    </td>
    <td width="50%">
      <h3>🤖 AI-Powered Analysis</h3>
      <p>Powered by Google Gemini AI to provide intelligent, context-aware security vulnerability detection and explanations.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📚 Educational Focus</h3>
      <p>Calm, non-alarmist explanations that help developers learn secure coding practices without fear-mongering.</p>
    </td>
    <td width="50%">
      <h3>🔧 Actionable Fixes</h3>
      <p>Receive complete, copy-paste ready code fixes with inline comments explaining each security improvement.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>⚠️ Language Mismatch Detection</h3>
      <p>Automatically detects when the submitted code doesn't match the selected language and prompts correction.</p>
    </td>
    <td width="50%">
      <h3>🌙 Modern Dark UI</h3>
      <p>Beautiful cybersecurity-themed dark interface with smooth animations powered by Framer Motion.</p>
    </td>
  </tr>
</table>

### Vulnerability Detection

CodeShield AI can identify various security vulnerabilities, including:

| Category | Examples |
|----------|----------|
| **Injection Attacks** | SQL Injection, Command Injection, LDAP Injection |
| **Cross-Site Scripting** | Reflected XSS, Stored XSS, DOM-based XSS |
| **Authentication Issues** | Hardcoded Credentials, Weak Password Storage |
| **Data Exposure** | Sensitive Data Logging, Insecure Data Storage |
| **Path Traversal** | Directory Traversal, File Inclusion Vulnerabilities |
| **Misconfiguration** | Insecure Defaults, Missing Security Headers |

---

## 🎬 Demo

🔗 **[Live Demo](https://code-shield-ai-sable.vercel.app/)** | 📺 **[Video Presentation](https://youtu.be/8H5rtUYTVc8)**

### How It Works

1. **Paste your code** in the editor
2. **Select the programming language** from the dropdown
3. **Click "Analyze"** to receive your security analysis
4. **Review the results** including:
   - Detected vulnerabilities with severity levels
   - Educational explanations
   - Suggested safer coding practices
   - Complete fixed code with inline comments

### Example Analysis

**Input (Vulnerable JavaScript):**
```javascript
const query = "SELECT * FROM users WHERE id = " + userId;
db.query(query, callback);
```

**Output:**
- 🔴 **Risk Level: High** - SQL Injection Vulnerability
- 📖 **Explanation**: User input is directly concatenated into the SQL query, allowing attackers to manipulate the query logic.
- ✅ **Secure Fix**: Use parameterized queries to safely handle user input.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **bun** package manager
- **Supabase account** (for backend functions)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PedroAugusto2004/code-guardian-ai.git
   cd code-guardian-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

5. **Open in browser**
   
   Navigate to `http://localhost:5173`

### Supabase Edge Functions Setup

The AI analysis is powered by Supabase Edge Functions. To deploy:

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login and link your project**
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

3. **Deploy the edge function**
   ```bash
   supabase functions deploy analyze-code
   ```

4. **Set the required secret**
   
   Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/):
   ```bash
   supabase secrets set GEMINI_API_KEY=your_gemini_api_key
   ```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI component library |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **shadcn/ui** | Accessible UI components |
| **React Query** | Server state management |

### Backend
| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service |
| **Edge Functions** | Serverless API endpoints |
| **Deno Runtime** | Secure JavaScript runtime |
| **Google Gemini** | AI-powered code analysis |

### Additional Libraries
| Library | Purpose |
|---------|---------|
| **Lucide React** | Icon library |
| **Zod** | Schema validation |
| **React Hook Form** | Form management |
| **Sonner** | Toast notifications |

---

## 📁 Project Structure

```
code-guardian-ai/
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── AnalysisResults.tsx
│   │   ├── CodeInput.tsx
│   │   ├── Header.tsx
│   │   └── LoadingState.tsx
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # Third-party integrations
│   │   └── supabase/        # Supabase client
│   ├── lib/                 # Utility functions
│   │   └── languageDetection.ts
│   ├── pages/               # Page components
│   │   └── Index.tsx
│   ├── App.tsx              # Root component
│   ├── index.css            # Global styles
│   └── main.tsx             # Entry point
├── supabase/
│   └── functions/
│       └── analyze-code/    # Edge function for AI analysis
│           └── index.ts
├── public/                  # Static assets
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig.json
```

---

## 🔒 Safety & Ethics

CodeShield AI is designed with safety and responsible disclosure in mind:

| ✅ Do | ❌ Don't |
|-------|---------|
| Educate about vulnerabilities | Generate exploit code |
| Explain defensive practices | Provide hacking instructions |
| Suggest safer alternatives | Encourage malicious behavior |
| Focus on awareness | Create attack payloads |

### Content Policy

- All responses are framed positively and educationally
- Severity levels avoid alarmist language
- Fixes focus on defense, not exploitation
- No step-by-step attack vectors are provided

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

- 🐛 **Report bugs** - Open an issue describing the problem
- 💡 **Suggest features** - Open an issue with your idea
- 📝 **Improve documentation** - Submit a PR with doc updates
- 🔧 **Submit fixes** - Fork, fix, and submit a PR

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run linting**
   ```bash
   npm run lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change, no feature/fix |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Pedro Augusto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- **MLH Hack for Hackers** - Hackathon where this project was built
- **Google Gemini API** - AI model powering the analysis (direct integration)
- **shadcn/ui** - Beautiful accessible components
- **Supabase** - Backend-as-a-Service for Edge Functions

---

## 📬 Contact

**Pedro Augusto** - [@PedroAugusto2004](https://github.com/PedroAugusto2004)

Project Link: [https://github.com/PedroAugusto2004/code-guardian-ai](https://github.com/PedroAugusto2004/code-guardian-ai)

---

<p align="center">
  <strong>Built with ❤️ for the developer community</strong>
</p>

<p align="center">
  <sub>⭐ Star this repo if you find it useful!</sub>
</p>
