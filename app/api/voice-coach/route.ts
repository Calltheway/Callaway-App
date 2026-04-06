import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const FALLBACK_MESSAGES: Record<string, string[]> = {
  theta: [
    "Your brain is shifting. The craving is just a wave — watch it rise and fall.",
    "Right now, new neural pathways are forming. You are literally rewiring.",
    "Breathe. The urge is not you. You are the awareness watching it.",
    "In this moment, your prefrontal cortex is coming back online.",
    "The wave is passing. You chose your future self. That's everything.",
  ],
  alpha: [
    "Your dopamine system is recalibrating. Feel the natural clarity returning.",
    "Focus arrives. The fog lifts. This is your brain healing in real time.",
    "With every breath, your reward circuits grow stronger for what matters.",
    "You are resetting your baseline. Every session compounds.",
    "Clarity is your natural state. You're returning home to it.",
  ],
  gamma: [
    "Gamma waves are accelerating your neural rewiring right now.",
    "Old circuits weakening. New pathways strengthening. Feel the shift.",
    "Your brain is more plastic than you know. This session matters.",
    "Cognitive enhancement is happening. The habit loses its grip.",
    "Every 40Hz pulse severs another link in the old chain.",
  ],
  delta: [
    "Your nervous system is entering deep repair mode.",
    "Sleep hormones are releasing. Let your body heal what your mind started.",
    "In this deep state, HGH flows. Your brain tissue regenerates.",
    "Rest is resistance. Healing is happening even as you drift.",
    "Deep sleep rewires what willpower alone cannot reach.",
  ],
  beta: [
    "Morning clarity. Your values are online before the day begins.",
    "Beta power: the ability to choose consciously, moment by moment.",
    "You start this day as who you're becoming, not who you were.",
    "Your prefrontal cortex is sharp. Every decision today is yours.",
    "This energy is real. This focus is earned. Go build your future.",
  ],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') || 'theta';
  const sessionMinutes = parseInt(searchParams.get('sessionMinutes') || '0');
  const userName = searchParams.get('userName') || 'Warrior';
  const streakDays = parseInt(searchParams.get('streakDays') || '0');

  try {
    const modeDescriptions: Record<string, string> = {
      theta: '6 Hz theta waves - urge dissolution and deep calm',
      alpha: '10 Hz alpha waves - dopamine reset and focus',
      gamma: '40 Hz gamma waves - neural rewiring and cognitive enhancement',
      delta: '2 Hz delta waves - deep sleep repair',
      beta: '14 Hz beta waves - morning power and clarity',
    };

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `Generate exactly 5 short, calming voice coach messages for a brainwave entrainment session.

Session details:
- Mode: ${mode} (${modeDescriptions[mode] || mode})
- User: ${userName}
- Day ${streakDays} of recovery
- Session minute: ${sessionMinutes}

Requirements:
- Each message: 1-2 sentences max, deeply calming and science-grounded
- Focus on: the neurological process happening, the urge passing as a wave, the user's strength
- Do NOT be preachy or lecture
- Poetic but grounded in science
- Reference the specific frequency mode's effects
- Return ONLY a JSON array of 5 strings, nothing else

Example format: ["Message 1", "Message 2", "Message 3", "Message 4", "Message 5"]`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('No text content');

    const cleaned = content.text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const messages = JSON.parse(cleaned);

    return NextResponse.json({ messages });
  } catch {
    // Return fallback messages
    const fallback = FALLBACK_MESSAGES[mode] || FALLBACK_MESSAGES.theta;
    return NextResponse.json({ messages: fallback });
  }
}
