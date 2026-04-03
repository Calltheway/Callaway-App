'use client';

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Sparkles, Star, Shirt, ArrowRight, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { products, type Product } from '@/lib/products';
import Link from 'next/link';

interface TryOnResult {
  analysis: string;
  rating?: number;
}

export default function TryOnStudio({ preselectedProductId }: { preselectedProductId?: string }) {
  const [userPhoto, setUserPhoto]     = useState<{ file: File; url: string } | null>(null);
  const [selectedProduct, setProduct] = useState<Product | null>(
    preselectedProductId ? (products.find(p => p.id === preselectedProductId) ?? null) : null
  );
  const [result, setResult]           = useState<TryOnResult | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [step, setStep]               = useState<1 | 2 | 3>(preselectedProductId ? 1 : 1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUserPhoto({ file, url });
    setResult(null);
    setError(null);
    if (selectedProduct) setStep(3);
    else setStep(2);
  }, [selectedProduct]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleAnalyze = async () => {
    if (!userPhoto || !selectedProduct) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(userPhoto.file);
      });

      const res = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userImageBase64: base64,
          productImageUrl: selectedProduct.images[0],
          productName: selectedProduct.name,
          productDescription: selectedProduct.description,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Analysis failed');
      }

      const data = await res.json();
      setResult(data);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setUserPhoto(null);
    setProduct(null);
    setResult(null);
    setError(null);
    setStep(1);
  };

  const tryOnProducts = products.filter(p => p.category !== 'accessories').slice(0, 12);

  return (
    <div className="space-y-8">
      {/* Steps */}
      <div className="flex items-center gap-2 justify-center">
        {[
          { n: 1, label: 'Upload Photo' },
          { n: 2, label: 'Pick Item' },
          { n: 3, label: 'AI Analysis' },
        ].map(({ n, label }, i) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${step >= n ? 'text-white' : 'text-lumis-dim'}`}
              style={step >= n ? { background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' } : { background: 'rgba(255,255,255,0.05)' }}>
              <span className="font-bold text-xs">{n}</span>
              <span className="hidden sm:block">{label}</span>
            </div>
            {i < 2 && <div className="w-8 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left — Upload */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-lg text-lumis-text flex items-center gap-2">
            <Camera size={18} className="text-lumis-violet" />
            Your Photo
          </h3>

          {!userPhoto ? (
            <div
              {...getRootProps()}
              className={`relative cursor-pointer rounded-3xl transition-all duration-300 flex flex-col items-center justify-center gap-4 p-10 min-h-[280px] ${isDragActive ? 'scale-105' : 'hover:scale-[1.02]'}`}
              style={{
                border: `2px dashed ${isDragActive ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.15)'}`,
                background: isDragActive ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
              }}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-float"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}>
                <Upload size={28} className="text-lumis-violet" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-lumis-text mb-1">
                  {isDragActive ? 'Drop your photo here' : 'Upload your photo'}
                </p>
                <p className="text-lumis-muted text-sm">Drag & drop or click to browse</p>
                <p className="text-lumis-dim text-xs mt-2">JPG, PNG, WEBP · Max 10MB</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-lumis-dim mt-2">
                <CheckCircle size={12} className="text-emerald-400" />
                <span>Your photo is processed locally and never stored</span>
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <Image
                src={userPhoto.url}
                alt="Your photo"
                fill
                className="object-cover"
              />
              <button
                onClick={() => { setUserPhoto(null); setResult(null); setStep(1); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center glass hover:bg-lumis-surface transition-all"
              >
                <X size={15} className="text-lumis-text" />
              </button>

              {/* Scan overlay when analyzing */}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(3,3,9,0.6)', backdropFilter: 'blur(4px)' }}>
                  <div className="absolute inset-x-0 h-1 rounded-full"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(6,182,212,0.8), transparent)', animation: 'scan 2s ease-in-out infinite', top: '50%' }} />
                  <div className="text-center">
                    <div className="spinner mx-auto mb-3" style={{ width: 32, height: 32, borderWidth: 3 }} />
                    <p className="text-lumis-violet-bright font-semibold text-sm">AI Analyzing…</p>
                    <p className="text-lumis-muted text-xs mt-1">Claude is styling you</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — Product + Result */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-lg text-lumis-text flex items-center gap-2">
            <Shirt size={18} className="text-lumis-cyan" />
            Select an Item
          </h3>

          {selectedProduct ? (
            <div className="relative rounded-2xl overflow-hidden" style={{ background: '#111121', border: '1px solid rgba(139,92,246,0.3)' }}>
              <div className="flex gap-4 p-4">
                <div className="relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0">
                  <Image src={selectedProduct.images[0]} alt={selectedProduct.name} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lumis-dim text-xs mb-0.5">{selectedProduct.brand}</p>
                  <p className="font-semibold text-lumis-text text-sm">{selectedProduct.name}</p>
                  <p className="text-lumis-muted text-xs mt-1 line-clamp-2">{selectedProduct.description}</p>
                  <p className="font-bold text-lumis-violet-bright mt-2">${selectedProduct.price.toLocaleString()}</p>
                </div>
                <button onClick={() => { setProduct(null); setResult(null); }}
                  className="p-1.5 rounded-xl text-lumis-dim hover:text-lumis-text hover:bg-lumis-surface transition-all flex-shrink-0 h-fit">
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto rounded-2xl p-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.3) transparent' }}>
              {tryOnProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setProduct(p); setResult(null); if (userPhoto) setStep(3); else setStep(2); }}
                  className="relative rounded-xl overflow-hidden aspect-[3/4] hover:scale-105 transition-transform"
                  style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="120px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                    <p className="text-white text-xs font-medium line-clamp-2 leading-tight">{p.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* CTA */}
          {userPhoto && selectedProduct && !result && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Claude is styling you…
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze with AI
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Result */}
      <AnimatePresence>
        {result && selectedProduct && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-6 space-y-4"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(6,182,212,0.06) 100%)', border: '1px solid rgba(139,92,246,0.3)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-display font-semibold text-lumis-text">AI Style Analysis</p>
                  <p className="text-xs text-lumis-cyan">Powered by Claude</p>
                </div>
              </div>
              {result.rating && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <Star size={14} className="fill-lumis-gold text-lumis-gold" />
                  <span className="font-bold text-lumis-gold text-sm">{result.rating}/10</span>
                </div>
              )}
            </div>

            {/* Analysis text */}
            <div className="text-lumis-muted leading-relaxed text-sm whitespace-pre-line">
              {result.analysis}
            </div>

            {/* Product CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href={`/product/${selectedProduct.id}`} className="btn-primary flex-1 text-center text-sm py-3 flex items-center justify-center gap-2">
                <Shirt size={15} />
                Add to Cart — ${selectedProduct.price.toLocaleString()}
              </Link>
              <button onClick={reset} className="btn-ghost text-sm py-3 flex items-center justify-center gap-2">
                <RefreshCw size={15} />
                Try Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
