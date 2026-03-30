// POST /api/negotiate — generate negotiation script via Claude
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateNegotiationScript } from '@/lib/claude';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { merchantName, monthlyAmount, context } = await req.json();

  try {
    const script = await generateNegotiationScript(merchantName, monthlyAmount, context);
    return NextResponse.json({ script });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
