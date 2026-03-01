'use client';

import { AnalysisResponse } from '@/types';
import { AlertCircle, CheckCircle, Download, Shield, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ResultsDisplayProps {
  results: AnalysisResponse | null;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results) return null;

  const { summary, results: fileResults } = results;

  const pieData = [
    { name: 'Vulnerable', value: summary.vulnerable_files, color: '#ef4444' },
    { name: 'Clean', value: summary.clean_files, color: '#22c55e' },
  ];

  const downloadResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `vulnerability-scan-${new Date().toISOString()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header with export */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Scan Results
        </h2>
        <button
          onClick={downloadResults}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border hover:bg-accent transition-colors text-sm font-medium"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Files</p>
          <p className="text-4xl font-bold text-blue-700 dark:text-blue-300 mt-2">{summary.total_files}</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 rounded-2xl p-6 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Vulnerable</p>
          <p className="text-4xl font-bold text-red-700 dark:text-red-300 mt-2">{summary.vulnerable_files}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 rounded-2xl p-6 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Clean</p>
          <p className="text-4xl font-bold text-green-700 dark:text-green-300 mt-2">{summary.clean_files}</p>
        </div>
      </div>

      {/* Pie chart */}
      {summary.total_files > 0 && (
        <div className="bg-card border rounded-2xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Vulnerability Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed file list */}
      <div className="bg-card border rounded-2xl divide-y">
        {fileResults.map((result, index) => (
          <div key={index} className="p-6 hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {result.file_analysis?.is_vulnerable ? (
                  <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-mono text-sm font-semibold truncate">{result.filename}</h4>
                  {result.error ? (
                    <p className="text-sm text-red-600 mt-1">{result.error}</p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-sm">
                        <span className="text-muted-foreground">Detection: </span>
                        <span className="font-medium">{result.file_analysis?.prediction}</span>
                      </span>
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full border font-medium',
                        getConfidenceColor(result.file_analysis?.confidence ?? 0)
                      )}>
                        {result.file_analysis?.confidence}% confidence
                      </span>
                      {result.file_analysis?.is_vulnerable && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 font-medium">
                          Vulnerable
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Vulnerable methods */}
            {result.vulnerable_methods && result.vulnerable_methods.length > 0 && (
              <div className="mt-4 ml-9 pl-4 border-l-2 border-red-200 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Vulnerable methods
                </p>
                {result.vulnerable_methods.map((method, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm bg-red-50/50 dark:bg-red-950/20 p-2 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                    <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                      {method.method_name}
                    </code>
                    <span className="text-xs text-muted-foreground">
                      ({method.prediction}, {method.confidence}%)
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* All probabilities toggle */}
            {result.file_analysis?.all_probabilities && (
              <details className="mt-3 ml-9">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  View detailed probabilities
                </summary>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(result.file_analysis.all_probabilities).map(([key, value]) => {
                    const isTop = key === result.file_analysis?.prediction;
                    return (
                      <div key={key} className={cn(
                        "flex justify-between text-xs p-2 rounded",
                        isTop ? "bg-primary/10 font-medium" : "bg-muted/50"
                      )}>
                        <span>{key}</span>
                        <span className={cn(
                          "font-mono",
                          isTop ? "text-primary" : "text-muted-foreground"
                        )}>
                          {value}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}