import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { messages, userContext } = await req.json();

    const { name = 'Warrior', streakDays = 0, habitType = 'habit', motivations = [], recentJournal = '' } = userContext || {};

    const systemPrompt = `You are an expert recovery coach for Unhooked, a premium habit recovery app. You specialize in evidence-based approaches to addiction recovery including:
- Neuroplasticity and brain rewiring science
- CBT (Cognitive Behavioral Therapy) for habit change
- ACT (Acceptance and Commitment Therapy)
- Motivational interviewing
- Mindfulness-based relapse prevention

You're speaking with ${name}, who is on day ${streakDays} of recovery from ${habitType}.
Their motivations: ${motivations.join(', ') || 'personal growth'}.
${recentJournal ? `Recent journal insight: ${recentJournal}` : ''}

Your personality:
- Deeply empathetic and non-judgmental
- Science-backed but accessible
- Firm but compassionate — you hold them to their values
- Never shame or lecture
- Use "urge surfing" metaphors: urges are waves, not tidal waves
- Reference their specific streak and situation
- Keep responses concise (2-4 sentences) unless they need detailed support
- End with one clear, actionable suggestion when appropriate

CRITICAL: You are NOT a substitute for professional therapy. If they express suicidal ideation, self-harm, or crisis, always direct them to call 988 first.`;

    const formattedMessages = messages
      .filter((m: { role: string; content: string }) => m.role === 'user' || m.role === 'assistant')
      .map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: systemPrompt,
      messages: formattedMessages,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const data = JSON.stringify({ delta: { text: event.delta.text } });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('Coach API error:', err);
    return Response.json({ error: 'Failed to connect to coach' }, { status: 500 });
  }
}
