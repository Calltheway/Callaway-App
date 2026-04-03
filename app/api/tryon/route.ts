import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userImageBase64, productImageUrl, productName, productDescription } = await req.json();

    if (!userImageBase64 || !productImageUrl || !productName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      return Response.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });

    // Fetch product image and convert to base64 (SDK 0.25 doesn't support URL sources)
    let productImageBase64 = '';
    let productMediaType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg';
    try {
      const imgRes = await fetch(productImageUrl);
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      if (contentType.includes('png')) productMediaType = 'image/png';
      else if (contentType.includes('webp')) productMediaType = 'image/webp';
      const buffer = await imgRes.arrayBuffer();
      productImageBase64 = Buffer.from(buffer).toString('base64');
    } catch {
      // If we can't fetch the product image, proceed without it
      productImageBase64 = '';
    }

    const imageContent = productImageBase64
      ? [
          { type: 'image' as const, source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data: userImageBase64 } },
          { type: 'image' as const, source: { type: 'base64' as const, media_type: productMediaType, data: productImageBase64 } },
        ]
      : [
          { type: 'image' as const, source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data: userImageBase64 } },
        ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContent,
            {
              type: 'text',
              text: `You are ARIA, the AI fashion expert at LUMIS. You have been shown:
1. A photo of a person (first image)
2. A clothing item: "${productName}" — ${productDescription || ''} (second image)

Please provide a vivid, personalized virtual try-on analysis. Include:

**Style Fit Analysis**: Describe specifically and enthusiastically how this garment would look on this person — considering their apparent style, coloring, body proportions, and the garment's silhouette and construction.

**Styling Recommendations**: Give 2-3 specific tips on how to best wear and style this piece — accessories, layering, footwear, occasion.

**Color & Contrast**: Comment on how the garment's colors work with the person's coloring and what they're currently wearing.

**Overall Style Rating**: Rate the pairing on a scale of 1-10 and explain why.

Be warm, specific, and genuinely helpful. Make the person excited about how they'll look. Use fashion-forward language but keep it accessible. This is a premium service — reflect that quality.

Format your response with clear sections using these exact headers:
✨ Style Fit
👗 How to Style It
🎨 Color & Contrast
⭐ Rating: [X/10]`,
            },
          ],
        },
      ],
    });

    const rawText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract rating if present
    const ratingMatch = rawText.match(/Rating:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

    return Response.json({ analysis: rawText, rating });
  } catch (err) {
    console.error('Try-on API error:', err);
    return Response.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
