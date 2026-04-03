import TryOnStudio from '@/components/TryOnStudio';
import { Sparkles, Eye, Shield, Zap } from 'lucide-react';

export const metadata = {
  title: 'AI Virtual Try-On — LUMIS',
  description: 'Upload your photo and see yourself wearing any LUMIS piece. AI-powered style analysis by Claude.',
};

interface Props {
  searchParams: { product?: string };
}

const howItWorks = [
  { icon: Eye,      step: '01', title: 'Upload Your Photo',   desc: 'A selfie or full-body shot works best. Processed securely and never stored.' },
  { icon: Sparkles, step: '02', title: 'Choose an Item',      desc: 'Pick any piece from the LUMIS collection that catches your eye.' },
  { icon: Zap,      step: '03', title: 'AI Analyzes the Look', desc: "Claude's vision AI examines fit, color harmony, and overall style for you specifically." },
];

export default function TryOnPage({ searchParams }: Props) {
  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm"
            style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}>
            <Sparkles size={14} className="text-lumis-violet" />
            <span className="text-lumis-violet-bright font-medium">Powered by Claude Vision AI</span>
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-lumis-text mb-4">
            Virtual <span className="text-gradient-violet">Try-On Studio</span>
          </h1>
          <p className="text-lumis-muted text-lg max-w-xl mx-auto">
            Upload your photo, pick a piece, and let Claude's AI tell you exactly how you'll look — with styling tips included.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {howItWorks.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="text-center p-5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}>
                <Icon size={18} className="text-lumis-violet" />
              </div>
              <span className="text-lumis-dim text-xs font-bold tracking-widest">{step}</span>
              <p className="font-semibold text-lumis-text text-sm mt-1 mb-1">{title}</p>
              <p className="text-lumis-dim text-xs leading-relaxed hidden sm:block">{desc}</p>
            </div>
          ))}
        </div>

        {/* Privacy note */}
        <div className="flex items-center gap-2 mb-8 p-3 rounded-xl text-sm"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <Shield size={15} className="text-emerald-400 flex-shrink-0" />
          <span className="text-lumis-muted">
            <span className="text-emerald-400 font-medium">Privacy first:</span> Your photo is converted to AI-readable format and analyzed in real-time. It is never stored on our servers.
          </span>
        </div>

        {/* Studio */}
        <div className="p-6 md:p-8 rounded-3xl"
          style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.07)' }}>
          <TryOnStudio preselectedProductId={searchParams.product} />
        </div>
      </div>
    </main>
  );
}
