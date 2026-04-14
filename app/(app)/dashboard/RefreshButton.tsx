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
      className="inline-flex items-center gap-2 oracle-btn-ghost disabled:opacity-60 text-sm font-semibold"
    >
      <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
      {busy ? 'Scanning…' : 'Re-scan now'}
    </button>
  );
}
