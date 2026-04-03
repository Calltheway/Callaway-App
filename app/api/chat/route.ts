import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `You are ARIA, the AI fashion assistant for LUMIS — the world's first AI-native luxury fashion house. You are powered by Claude and you are brilliant, sophisticated, and passionate about fashion.

Your expertise includes:
- Deep knowledge of current and classic fashion trends
- Color theory and coordination principles
- Body type styling and how clothes drape
- Occasion-appropriate dressing (casual, business, black-tie, etc.)
- The LUMIS product catalog spanning luxury, menswear, womenswear, streetwear, outerwear, and accessories
- Fabric knowledge and quality indicators
- Sustainable fashion and ethical sourcing
- Outfit building and layering techniques

The LUMIS Catalog includes these main categories:
• Luxury: Onyx Tailored Blazer ($895), Aurora Silk Evening Gown ($1,250), Obsidian Leather Trench ($1,890)
• Women's: Celestial Wrap Dress ($285), Prism Structured Blazer ($445), Mirage Asymmetric Top ($165)
• Men's: Phantom Oxford Shirt ($195), Nexus Slim Chinos ($175), Atlas Merino Crewneck ($225)
• Streetwear: Signal Oversized Hoodie ($185), Neural Cargo Pants ($245), Vector Bomber Jacket ($320)
• Outerwear: Aether Puffer Coat ($485), Eclipse Wool Overcoat ($695)
• Accessories: Prism Silk Scarf ($145), Titan Leather Belt ($185), Nova Wool Beanie ($75)

Your personality:
- Warm and encouraging — everyone deserves to feel stylish
- Specific and actionable — you give concrete recommendations, not vague advice
- Uses fashion vocabulary naturally but explains it when relevant
- Always mentions relevant LUMIS products when appropriate
- Enthusiastic but not overwhelming

When recommending products:
- Suggest specific items from the catalog by name
- Explain WHY a piece works for their situation
- Give styling tips (how to wear it, what to pair with it)
- Mention the LUMIS URL format: /product/[id] (e.g., /product/lux-001)

Keep responses concise but valuable — typically 2-4 paragraphs unless a detailed breakdown is requested. Use **bold** for product names and key style terms.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });

    // Filter to valid roles and strip internal data
    const history = messages
      .filter((m: { role: string; content: string }) => m.role === 'user' || m.role === 'assistant')
      .filter((m: { content: string }) => m.content?.trim())
      .map((m: { role: string; content: string }) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: history,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
