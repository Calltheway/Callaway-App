'use client';
export function ShareButton({ amount }: { amount: number }) {
  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
  const text = `I saved ${fmt(amount)} with Keeper — the AI money agent that finds and recovers money you're losing every month. Try it free at getkeeper.app`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text, title: 'I saved money with Keeper!' });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
    >
      🎉 Share my savings
    </button>
  );
}
