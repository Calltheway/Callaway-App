// ─────────────────────────────────────────────────────────────────
// POST /api/integrations/gmail/sync
// Pull last 90 days of emails via Google Gmail API
// Extracts: sender frequency, stress keywords, commitment patterns, receipts
// ─────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const STRESS_KEYWORDS = [
  'urgent', 'asap', 'immediately', 'overdue', 'deadline', 'critical',
  'issue', 'problem', 'concern', 'complaint', 'error', 'failed', 'blocked',
  'worried', 'stressed', 'overwhelmed',
];

const COMMITMENT_PATTERNS = [
  /i (will|can|shall) .{3,50} by/gi,
  /i'll .{3,30} (tomorrow|monday|by end of)/gi,
  /let me .{3,30} (today|tomorrow|this week)/gi,
  /i'll send .{3,30}/gi,
];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get stored access token for Gmail
    const { data: integration } = await supabase
      .from('oracle_integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'gmail')
      .single();

    if (!integration?.access_token) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 });
    }

    // Mark as syncing
    await supabase.from('oracle_integrations').update({
      status:     'syncing',
      updated_at: new Date().toISOString(),
    }).eq('id', integration.id);

    try {
      // Call Gmail API to list messages from past 90 days
      const since = new Date(Date.now() - 90 * 86400000);
      const query = `after:${Math.floor(since.getTime() / 1000)}`;

      const listResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=200`,
        { headers: { Authorization: `Bearer ${integration.access_token}` } },
      );

      if (!listResponse.ok) {
        throw new Error(`Gmail API error: ${listResponse.status}`);
      }

      const listData = await listResponse.json();
      const messages = listData.messages || [];

      // Analyze message metadata (batch fetch headers only — no full content for privacy)
      const contactFrequency: Record<string, number> = {};
      let stressKeywordCount = 0;
      let commitmentCount = 0;
      let receiptTotal = 0;

      // Fetch first 50 message details for analysis
      const sampleMessages = messages.slice(0, 50);
      for (const msg of sampleMessages) {
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject`,
          { headers: { Authorization: `Bearer ${integration.access_token}` } },
        );

        if (!detailResponse.ok) continue;
        const detail = await detailResponse.json();

        const headers = detail.payload?.headers || [];
        const from = headers.find((h: {name: string; value: string}) => h.name === 'From')?.value || '';
        const subject = headers.find((h: {name: string; value: string}) => h.name === 'Subject')?.value || '';

        // Track contact frequency
        const emailMatch = from.match(/<(.+?)>/);
        const email = emailMatch ? emailMatch[1] : from;
        contactFrequency[email] = (contactFrequency[email] || 0) + 1;

        // Count stress keywords in subject
        const subjectLower = subject.toLowerCase();
        stressKeywordCount += STRESS_KEYWORDS.filter((kw) => subjectLower.includes(kw)).length;

        // Count commitments in subject
        for (const pattern of COMMITMENT_PATTERNS) {
          if (pattern.test(subject)) commitmentCount++;
        }

        // Detect receipts (basic)
        if (subjectLower.includes('receipt') || subjectLower.includes('order confirmation') || subjectLower.includes('your order')) {
          receiptTotal++;
        }
      }

      // Top contacts by frequency
      const topContacts = Object.entries(contactFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([email, count]) => ({ email, count }));

      const summary = {
        totalEmails:      messages.length,
        analyzed:         sampleMessages.length,
        topContacts,
        stressScore:      Math.min(100, stressKeywordCount * 5),
        commitmentsMade:  commitmentCount,
        receiptCount:     receiptTotal,
        syncedAt:         new Date().toISOString(),
      };

      // Save summary to integration metadata
      await supabase.from('oracle_integrations').update({
        status:      'connected',
        last_synced: new Date().toISOString(),
        metadata:    JSON.stringify(summary),
        updated_at:  new Date().toISOString(),
      }).eq('id', integration.id);

      return NextResponse.json({ success: true, summary });

    } catch (syncError) {
      await supabase.from('oracle_integrations').update({
        status:     'error',
        updated_at: new Date().toISOString(),
      }).eq('id', integration.id);
      throw syncError;
    }

  } catch (error) {
    console.error('[Gmail Sync]', error);
    return NextResponse.json({ error: 'Gmail sync failed', details: String(error) }, { status: 500 });
  }
}
