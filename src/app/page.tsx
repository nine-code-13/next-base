'use client';

import { useState } from 'react';
import Image from 'next/image';

// Define interfaces for analysis results
interface ProjectExperience {
  name: string;
  description: string;
  role: string;
}

interface AnalysisResults {
  personalInformation: Record<string, string>;
  professionalSkills: string[];
  projectExperience: ProjectExperience[];
  analysis: {
    skillsMatch: string;
    projectsMatch: string;
  };
  suggestions: string[];
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a PDF file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }

      const data = await response.json();
      setAnalysis(data.analysis as AnalysisResults);
    } catch (err) {
      setError('Failed to parse resume. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Image
              src="/file.svg"
              alt="Resume Analyzer"
              width={80}
              height={80}
              className="dark:invert"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Resume Analyzer for Programmers
          </h1>
          <p className="text-gray-600">
            Upload your resume PDF to get detailed analysis and optimization suggestions
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {file && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Selected file: <span className="font-semibold">{file.name}</span>
                  </p>
                </div>
              )}
              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="mt-6 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Analysis Results</h2>

            {/* Personal Information */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(analysis.personalInformation).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-600">{key}:</span>
                    <span className="ml-2 text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Skills */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Professional Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.professionalSkills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Project Experience */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Project Experience</h3>
              {analysis.projectExperience.map((project: ProjectExperience, index: number) => (
                <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-1">{project.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                  <p className="text-xs text-gray-500">Role: {project.role}</p>
                </div>
              ))}
            </div>

            {/* Analysis */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Analysis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-700 mb-1">Skills Match</h4>
                  <p className="text-sm text-gray-600">{analysis.analysis.skillsMatch}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-700 mb-1">Projects Match</h4>
                  <p className="text-sm text-gray-600">{analysis.analysis.projectsMatch}</p>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Optimization Suggestions</h3>
              <ul className="list-disc list-inside space-y-2">
                {analysis.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="text-sm text-gray-600">{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
