# Resume Analyzer for Programmers

A full-stack application built with Next.js that analyzes programmer resumes and provides optimization suggestions.

## Features

- **PDF Resume Parsing**: Upload your resume PDF and extract key information
- **Section Extraction**: Automatically identifies "Personal Information", "Professional Skills", and "Project Experience"
- **Skill Analysis**: Evaluates if skills depth and breadth match work experience
- **Project Analysis**: Assesses if project content and difficulty match work experience
- **Optimization Suggestions**: Provides clear and constructive feedback for improvement
- **Beautiful UI**: Modern, responsive design with smooth user experience

## Tech Stack

- **Next.js**: Full-stack framework
- **pnpm**: Package manager
- **LangGraph**: Custom workflow for AI agent
- **DeepSeek**: AI model for resume analysis
- **OpenAI SDK**: API client for DeepSeek (compatible)
- **pdf-parse**: PDF text extraction
- **Tailwind CSS**: Styling

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm installed
- DeepSeek API key (get it from [DeepSeek Platform](https://platform.deepseek.com/))

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables:
Create a `.env` file in the root directory and add your DeepSeek API key:
```env
DEEPSEEK_API_KEY=your-api-key-here
```

### Development

Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build the production application:
```bash
pnpm build
```

### Production

Start the production server:
```bash
pnpm start
```

## Usage

1. On the homepage, click the file upload button to select your resume PDF
2. Click "Analyze Resume" to start the analysis process
3. Wait for the AI to process your resume
4. View the analysis results including:
   - Extracted personal information
   - Professional skills
   - Project experience
   - Skills match analysis
   - Projects match analysis
   - Optimization suggestions

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── parse-resume/route.ts  # API endpoint for resume analysis
│   │   ├── page.tsx                    # Frontend page
│   │   ├── layout.tsx                  # Root layout
│   │   └── globals.css                 # Global styles
├── .env                                # Environment variables
├── package.json                        # Dependencies
└── tsconfig.json                       # TypeScript configuration
```

## Workflow

The resume analysis uses a custom LangGraph workflow:

1. **Extract Sections**: Extracts personal info, skills, and projects from resume text
2. **Analyze Skills**: Evaluates skills match with work experience
3. **Analyze Projects**: Assesses projects match with work experience
4. **Generate Suggestions**: Creates optimization suggestions
5. **Compile Results**: Formats results for display

## License

MIT
