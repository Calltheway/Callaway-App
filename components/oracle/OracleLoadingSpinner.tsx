'use client';

export function OracleLoadingSpinner({ message = 'Oracle is thinking...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      {/* Animated oracle rings */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-oracle-teal/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-oracle-teal/40 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-oracle-teal font-display font-bold text-lg">O</span>
        </div>
      </div>
      <p className="text-oracle-muted text-sm font-mono animate-pulse">{message}</p>
    </div>
  );
}
