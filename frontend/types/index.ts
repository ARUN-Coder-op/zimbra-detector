export interface VulnerabilityResult {
  filename: string;
  file_analysis?: {
    prediction: string;
    confidence: number;
    is_vulnerable: boolean;
    all_probabilities: Record<string, number>;
  };
  vulnerable_methods?: Array<{
    method_name: string;
    prediction: string;
    confidence: number;
  }>;
  error?: string;
}

export interface AnalysisResponse {
  success: boolean;
  summary: {
    total_files: number;
    vulnerable_files: number;
    clean_files: number;
  };
  results: VulnerabilityResult[];
}