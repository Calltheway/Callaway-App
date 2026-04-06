import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { entries, userName, streakDays } = await req.json();

    if (!entries || entries.length < 2) {
      return NextResponse.json({ insight: 'Add more journal entries to unlock pattern analysis.' });
    }

    const summary = entries.slice(0, 7).map((e: {
      created_at: string;
      mood: number;
      energy: number;
      urge_intensity: number;
      trigger_location: string;
      trigger_emotion: string;
      notes: string;
    }) => ({
      date: new Date(e.created_at).toLocaleDateString(),
      mood: e.mood,
      energy: e.energy,
      urge: e.urge_intensity,
      location: e.trigger_location,
      emotion: e.trigger_emotion,
      notes: e.notes?.slice(0, 100),
    }));

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Analyze these journal entries for ${userName || 'a user'} on day ${streakDays} of recovery:

${JSON.stringify(summary, null, 2)}

Provide a compassionate 2-3 sentence pattern analysis. Focus on:
1. Trigger patterns (times/emotions/locations of high urge)
2. What's working well
3. One specific, actionable recommendation

Be warm, non-judgmental, and specific. Do not be generic.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('No text');

    return NextResponse.json({ insight: content.text });
  } catch (err) {
    console.error('Journal insight error:', err);
    return NextResponse.json({
      insight: 'I see a courageous person building awareness of their patterns. Keep logging — the insights deepen with each entry.',
    });
  }
}
