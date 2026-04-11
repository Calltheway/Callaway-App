// ─────────────────────────────────────────────────────────────────
// POST /api/oracle/chat
// Streaming chat endpoint — SSE via ReadableStream
// ─────────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { streamOracleChat, type UserLifeContext } from '@/lib/oracle';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { message, history = [] } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Pull user context
    const { data: profile } = await supabase
      .from('oracle_users')
      .select('*')
      .eq('id', user.id)
      .single();

    const context: UserLifeContext = {
      goals:       profile?.goals,
      fears:       profile?.fears,
      lifeContext: profile?.life_context,
    };

    // Save user message to history
    await supabase.from('oracle_messages').insert({
      user_id:    user.id,
      role:       'user',
      content:    message,
      created_at: new Date().toISOString(),
    });

    // Stream Claude response via SSE
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamOracleChat(message, history, context)) {
            fullResponse += chunk;
            const data = `data: ${JSON.stringify({ text: chunk })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }

          // Done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();

          // Save assistant response to DB (fire and forget)
          void supabase.from('oracle_messages').insert({
            user_id:    user.id,
            role:       'assistant',
            content:    fullResponse,
            created_at: new Date().toISOString(),
          });

        } catch (err) {
          const errData = `data: ${JSON.stringify({ error: String(err) })}\n\n`;
          controller.enqueue(encoder.encode(errData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type':  'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error) {
    console.error('[Oracle Chat]', error);
    return new Response(JSON.stringify({ error: 'Chat failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
