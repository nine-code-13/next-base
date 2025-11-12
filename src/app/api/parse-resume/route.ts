import { NextRequest, NextResponse } from 'next/server';
import * as pdf from 'pdf-parse';
import { OpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import dotenv from 'dotenv';
import { StateGraph } from '@langchain/langgraph';

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read the PDF file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdf.default(buffer);

    // Extract text from PDF
    const resumeText = data.text;

    // Create and run the LangGraph workflow
    const analysis = await runResumeAnalysisWorkflow(resumeText);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error parsing resume:', error);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}

// Define interfaces for state management
interface ResumeSections {
  personalInformation: Record<string, string>;
  professionalSkills: string[];
  projectExperience: Array<{
    name: string;
    description: string;
    role: string;
  }>;
}

interface ResumeAnalysisState {
  resumeText: string;
  sections?: ResumeSections;
  skillsMatch?: string;
  projectsMatch?: string;
  suggestions?: string[];
}

// Define the resume analysis workflow using LangGraph
async function runResumeAnalysisWorkflow(resumeText: string): Promise<{
  personalInformation: Record<string, string>;
  professionalSkills: string[];
  projectExperience: Array<{
    name: string;
    description: string;
    role: string;
  }>;
  analysis: {
    skillsMatch: string;
    projectsMatch: string;
  };
  suggestions: string[];
}> {
  // Define the states and edges of the graph
  const graph = new StateGraph<ResumeAnalysisState>({
    channels: {
      resumeText: true,
      sections: true,
      skillsMatch: true,
      projectsMatch: true,
      suggestions: true,
    },
  });

  // Step 1: Extract resume sections
  const extractSections = async (state: ResumeAnalysisState) => {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `Extract the following sections from the resume text:
- Personal Information
- Professional Skills
- Project Experience

Return the result in JSON format with keys: personalInformation, professionalSkills, projectExperience.`,
      },
      {
        role: 'user',
        content: state.resumeText,
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      temperature: 0.5,
      response_format: { type: 'json_object' },
    });

    const sections = JSON.parse(response.choices[0].message.content || '{}');
    return { ...state, sections };
  };

  // Step 2: Analyze skills match
  const analyzeSkills = async (state: ResumeAnalysisState) => {
    if (!state.sections) return state;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `Analyze if the depth and breadth of professional skills match the years of work experience.
Return a string explanation of the match or mismatch.`,
      },
      {
        role: 'user',
        content: JSON.stringify(state.sections),
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
    });

    const skillsMatch = response.choices[0].message.content || '';
    return { ...state, skillsMatch };
  };

  // Step 3: Analyze projects match
  const analyzeProjects = async (state: ResumeAnalysisState) => {
    if (!state.sections) return state;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `Analyze if the content and difficulty of project experience match the work experience.
Return a string explanation of the match or mismatch.`,
      },
      {
        role: 'user',
        content: JSON.stringify(state.sections),
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
    });

    const projectsMatch = response.choices[0].message.content || '';
    return { ...state, projectsMatch };
  };

  // Step 4: Generate suggestions
  const generateSuggestions = async (state: ResumeAnalysisState) => {
    if (!state.sections || !state.skillsMatch || !state.projectsMatch) return state;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `Based on the resume sections and analysis results, provide clear and constructive optimization suggestions.
Return the suggestions as an array of strings.`,
      },
      {
        role: 'user',
        content: JSON.stringify(state),
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const suggestions = JSON.parse(response.choices[0].message.content || '[]');
    return { ...state, suggestions };
  };

  // Step 5: Compile results
  const compileResults = async (state: ResumeAnalysisState) => {
    return {
      personalInformation: state.sections?.personalInformation || {},
      professionalSkills: state.sections?.professionalSkills || [],
      projectExperience: state.sections?.projectExperience || [],
      analysis: {
        skillsMatch: state.skillsMatch || '',
        projectsMatch: state.projectsMatch || '',
      },
      suggestions: Array.isArray(state.suggestions) ? state.suggestions : [],
    };
  };

  // Build the graph
  graph.addNode('extractSections', extractSections);
  graph.addNode('analyzeSkills', analyzeSkills);
  graph.addNode('analyzeProjects', analyzeProjects);
  graph.addNode('generateSuggestions', generateSuggestions);
  graph.addNode('compileResults', compileResults);

  // Set edges
  graph.addEdge('__start__', 'extractSections');
  graph.addEdge('extractSections', 'analyzeSkills');
  graph.addEdge('analyzeSkills', 'analyzeProjects');
  graph.addEdge('analyzeProjects', 'generateSuggestions');
  graph.addEdge('generateSuggestions', 'compileResults');
  graph.addEdge('compileResults', '__end__');

  // Compile the graph
  const compiledGraph = graph.compile();

  // Run the workflow
  const result = await compiledGraph.invoke({ resumeText });
  return result;
}