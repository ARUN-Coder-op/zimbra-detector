'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils'; // import from utils (assume exists)

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onClear: () => void;
  selectedFiles: File[];
  isAnalyzing: boolean;
}

export default function FileUploader({
  onFilesSelected,
  onClear,
  selectedFiles,
  isAnalyzing
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const validFiles = acceptedFiles.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ['java', 'jsp', 'xml'].includes(ext || '');
    });

    if (validFiles.length === 0) {
      setError('Only .java, .jsp, or .xml files are allowed');
      return;
    }

    onFilesSelected(validFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/x-java': ['.java'],
      'application/xml': ['.xml', '.jsp'],
    },
    disabled: isAnalyzing
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    onFilesSelected(newFiles);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'java': return '☕';
      case 'jsp': return '📄';
      case 'xml': return '📋';
      default: return '📁';
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'relative overflow-hidden rounded-2xl border-2 border-dashed p-8 transition-all duration-300 cursor-pointer group',
          isDragActive
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50',
          isAnalyzing && 'opacity-50 pointer-events-none'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <div className={cn(
            'p-4 rounded-full bg-primary/10 text-primary transition-transform duration-300',
            isDragActive ? 'scale-110' : 'group-hover:scale-105'
          )}>
            <Upload className="h-8 w-8" />
          </div>
          <div>
            <p className="text-lg font-semibold">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or <span className="text-primary font-medium underline underline-offset-4 cursor-pointer">browse</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            Supported formats: .java, .jsp, .xml
          </p>
        </div>

        {isDragActive && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 animate-pulse" />
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 text-sm border rounded-lg bg-destructive/10 text-destructive border-destructive/20 animate-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-3 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-muted-foreground">
              Selected Files ({selectedFiles.length})
            </h3>
            <button
              onClick={onClear}
              disabled={isAnalyzing}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            >
              Clear all
            </button>
          </div>
          <div className="grid gap-2 max-h-64 overflow-y-auto pr-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-card border rounded-xl hover:shadow-md transition-shadow group/file"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl">{getFileIcon(file.name)}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={isAnalyzing}
                  className="p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover/file:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}