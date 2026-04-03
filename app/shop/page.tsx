import { Suspense } from 'react';
import ProductGrid from '@/components/ProductGrid';
import type { Category } from '@/lib/products';

export const metadata = {
  title: 'Shop — LUMIS AI Fashion',
  description: 'Browse the full LUMIS collection. AI-powered search and filtering to find your perfect outfit.',
};

interface Props {
  searchParams: { q?: string; cat?: Category; filter?: string };
}

export default function ShopPage({ searchParams }: Props) {
  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-lumis-text mb-3">
            The <span className="text-gradient-violet">Collection</span>
          </h1>
          <p className="text-lumis-muted text-lg">
            Curated by AI. Crafted for you.
          </p>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>}>
          <ProductGrid
            initialQuery={searchParams.q ?? ''}
            initialCategory={searchParams.cat ?? 'all'}
          />
        </Suspense>
      </div>
    </main>
  );
}
