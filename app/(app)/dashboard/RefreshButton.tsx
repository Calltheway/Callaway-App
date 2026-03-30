'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export function RefreshButton() {
  const router    = useRouter();
  const [busy, setBusy] = useState(false);

  const handleScan = async () => {
    setBusy(true);
    try {
      await fetch('/api/analyze', { method: 'POST' });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleScan}
      disabled={busy}
      className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
    >
      <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
      {busy ? 'Scanning…' : 'Re-scan now'}
    </button>
  );
}
