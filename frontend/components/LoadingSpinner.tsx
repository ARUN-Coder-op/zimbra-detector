export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-primary/20" />
        <div className="absolute top-0 left-0 h-20 w-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-pulse">
          Analyzing files
        </p>
        <p className="text-sm text-muted-foreground">
          Our AI is scanning for vulnerabilities...
        </p>
      </div>
    </div>
  );
}