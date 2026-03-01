'use client';

import { useState } from 'react';
import axios from 'axios';
import FileUploader from '@/components/FileUploader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ResultsDisplay from '@/components/ResultsDisplay';
import { AnalysisResponse } from '@/types';
import { Shield, Github, Moon, Sun, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post<AnalysisResponse>(
       "https://zimbra-detector.onrender.com/api/analyze",
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setResults(response.data);
    } catch (err) {
      setError('Failed to analyze files. Make sure backend is running.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setResults(null);
    setError(null);
  };

  return (
    <main className={cn(
      "min-h-screen transition-colors duration-300",
      darkMode ? "dark bg-gray-950" : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
    )}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Zimbra Vulnerability Detector
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Powered by DeepSeek Coder 1.3B • 99.70% accuracy
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <a
                href="#"
                className="p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Upload */}
          <div className="space-y-6">
            <div className="bg-card border rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary rounded-full" />
                Upload Files
              </h2>
              <FileUploader
                onFilesSelected={setSelectedFiles}
                onClear={handleClear}
                selectedFiles={selectedFiles}
                isAnalyzing={isAnalyzing}
              />
              
              {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={selectedFiles.length === 0 || isAnalyzing}
                className="w-full mt-6 relative overflow-hidden group bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isAnalyzing ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Files'
                  )}
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </button>
            </div>

            {/* Info card */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                About the Model
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Fine-tuned DeepSeek Coder 1.3B for Zimbra vulnerability detection. 
                Achieves <span className="text-primary font-bold">99.70% accuracy</span> on test data.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['SQL Injection', 'Cross-Site Scripting', 'Insecure Deserialization', 'Command Injection', 'Path Traversal'].map((vuln, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{vuln}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Results */}
          <div>
            {isAnalyzing ? (
              <div className="bg-card border rounded-2xl p-6 shadow-lg flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
              </div>
            ) : results ? (
              <div className="bg-card border rounded-2xl p-6 shadow-lg">
                <ResultsDisplay results={results} />
              </div>
            ) : (
              <div className="bg-card border rounded-2xl p-12 shadow-lg flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  <Shield className="h-12 w-12 text-primary/60" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Results Yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Upload your Java, JSP, or XML files and click the analyze button to detect vulnerabilities
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}