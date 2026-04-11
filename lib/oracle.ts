// ─────────────────────────────────────────────────────────────────
// ORACLE — AI Intelligence Engine (Server-side only)
// Powered by Claude claude-sonnet-4-6 with extended context
// Never expose this file to the browser — API routes only
// ─────────────────────────────────────────────────────────────────
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-6';

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// ── Types ──────────────────────────────────────────────────────────

export interface LifeScoreData {
  overall:      number;
  financial:    number;
  social:       number;
  health:       number;
  productivity: number;
  emotional:    number;
  growth:       number;
}

export interface OracleInsight {
  category:   'financial' | 'social' | 'health' | 'behavioral' | 'emotional' | 'growth';
  severity:   'info' | 'warning' | 'alert';
  title:      string;
  content:    string;
  confidence: number;
  dataPoints: string[];
  action?:    string;
  actionType?: string;
}

export interface OraclePattern {
  name:        string;
  description: string;
  frequency:   string;
  category:    string;
  severity:    'info' | 'warning' | 'alert';
}

export interface OracleAnalysis {
  life_score:      LifeScoreData;
  insights:        OracleInsight[];
  patterns:        OraclePattern[];
  weekly_summary:  string;
  urgent_alerts:   OracleInsight[];
}

export interface UserLifeContext {
  goals?:        string;
  fears?:        string;
  lifeContext?:  Record<string, unknown>;
  emailData?:    EmailSummary;
  calendarData?: CalendarSummary;
  financeData?:  FinanceSummary;
  healthData?:   HealthSummary;
}

export interface EmailSummary {
  topContacts:     { name: string; frequency: number; lastContact: string }[];
  stressKeywords:  string[];
  commitmentsMade: number;
  commitmentsMissed: number;
  receiptTotal:    number;
}

export interface CalendarSummary {
  totalEvents:    number;
  cancelledEvents: number;
  socialEvents:   number;
  workMeetings:   number;
  avgSleepInferred?: number;
  meetingLoadScore: number;
}

export interface FinanceSummary {
  monthlySpend:    number;
  savingsRate:     number;
  topCategories:   { category: string; amount: number }[];
  anomalies:       { description: string; amount: number }[];
  netWorthDelta:   number;
}

export interface HealthSummary {
  avgSleep:   number;
  avgSteps:   number;
  avgHRV?:    number;
  workouts:   number;
  sleepTrend: 'improving' | 'declining' | 'stable';
}

// ── System Prompt ─────────────────────────────────────────────────

const ORACLE_SYSTEM_PROMPT = `You are ORACLE, an elite AI life intelligence system.
You have access to every dimension of a user's life: email, calendar, finances, health, relationships, and goals.

Your role is a combined therapist, financial advisor, life coach, and personal strategist.

CORE PRINCIPLES:
1. Surface NON-OBVIOUS insights — don't state the obvious, find hidden patterns
2. Correlate across domains — e.g., "Your sleep dropped when your spending increased"
3. Be specific — reference actual data points, not vague generalities
4. Be compassionate but honest — don't sugarcoat, but don't catastrophize
5. Prioritize what matters most — a user can't act on 50 insights at once

OUTPUT RULES:
- Always return valid JSON — never add prose outside the JSON
- confidence must be 0.0–1.0 (only include insights >= 0.65)
- severity: "alert" = urgent action needed, "warning" = attention required, "info" = FYI
- life_score subscores must be 0–100 integers
- weekly_summary must be 2–3 sentences, written in 2nd person ("You had a...")
- insights array: max 8 items, sorted by severity then confidence descending
- patterns array: max 5 recurring behavioral patterns detected
- urgent_alerts: subset of insights with severity="alert" only`;

// ── Full Life Analysis ────────────────────────────────────────────

export async function analyzeLife(context: UserLifeContext): Promise<OracleAnalysis> {
  const client = getClient();

  const contextStr = JSON.stringify({
    user_goals:    context.goals,
    user_fears:    context.fears,
    life_context:  context.lifeContext,
    email_data:    context.emailData,
    calendar_data: context.calendarData,
    finance_data:  context.financeData,
    health_data:   context.healthData,
  }, null, 2);

  const message = await client.messages.create({
    model:      MODEL,
    max_tokens: 8192,
    system:     ORACLE_SYSTEM_PROMPT,
    messages: [{
      role:    'user',
      content: `Analyze this user's life data and return a comprehensive Oracle analysis.

USER DATA:
${contextStr}

TODAY: ${new Date().toISOString().split('T')[0]}

Return EXACTLY this JSON structure:
{
  "life_score": {
    "overall": 0,
    "financial": 0,
    "social": 0,
    "health": 0,
    "productivity": 0,
    "emotional": 0,
    "growth": 0
  },
  "insights": [
    {
      "category": "financial|social|health|behavioral|emotional|growth",
      "severity": "alert|warning|info",
      "title": "Short headline (max 60 chars)",
      "content": "Detailed insight with specific data references (2-3 sentences)",
      "confidence": 0.0,
      "dataPoints": ["specific data point 1", "specific data point 2"],
      "action": "Specific suggested action",
      "actionType": "cancel|negotiate|reflect|connect|exercise|sleep|invest|call|review"
    }
  ],
  "patterns": [
    {
      "name": "Pattern name",
      "description": "What this pattern means and its impact",
      "frequency": "Weekly|Monthly|Seasonal",
      "category": "behavioral|emotional|financial|social|health",
      "severity": "alert|warning|info"
    }
  ],
  "weekly_summary": "2-3 sentence synthesis of the user's week in 2nd person",
  "urgent_alerts": []
}`,
    }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Oracle returned no valid JSON');

  const parsed = JSON.parse(jsonMatch[0]) as OracleAnalysis;

  // Filter urgent_alerts from insights if not set
  if (!parsed.urgent_alerts?.length) {
    parsed.urgent_alerts = (parsed.insights ?? []).filter((i) => i.severity === 'alert');
  }

  return parsed;
}

// ── Chat Interface ────────────────────────────────────────────────

export async function* streamOracleChat(
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  context: UserLifeContext,
): AsyncGenerator<string> {
  const client = getClient();

  const contextSummary = `
USER PROFILE:
- Goals: ${context.goals || 'Not set'}
- Fears: ${context.fears || 'Not set'}
- Life Context: ${JSON.stringify(context.lifeContext || {}, null, 2)}
- Email Data: ${JSON.stringify(context.emailData || {}, null, 2)}
- Calendar Data: ${JSON.stringify(context.calendarData || {}, null, 2)}
- Finance Data: ${JSON.stringify(context.financeData || {}, null, 2)}
- Health Data: ${JSON.stringify(context.healthData || {}, null, 2)}
`;

  const systemPrompt = `${ORACLE_SYSTEM_PROMPT}

You are in CHAT MODE. The user is asking you questions about their own life.

${contextSummary}

CHAT RULES:
- Answer conversationally but with precision — cite specific data from their profile
- Prefix data citations with "Based on your [data source]..."
- Keep responses focused and actionable
- Use line breaks for readability
- Max 300 words unless the question requires detail`;

  const stream = client.messages.stream({
    model:      MODEL,
    max_tokens: 2048,
    system:     systemPrompt,
    messages:   [
      ...history,
      { role: 'user', content: userMessage },
    ],
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      yield chunk.delta.text;
    }
  }
}

// ── Weekly Report Generator ───────────────────────────────────────

export async function generateWeeklyReport(
  context: UserLifeContext,
  previousScores?: LifeScoreData,
): Promise<{ summary: string; highlights: string[]; patterns: string[]; score: number }> {
  const client = getClient();

  const message = await client.messages.create({
    model:      MODEL,
    max_tokens: 2000,
    system:     ORACLE_SYSTEM_PROMPT,
    messages: [{
      role:    'user',
      content: `Generate a weekly Oracle report for this user.

USER DATA:
${JSON.stringify(context, null, 2)}

PREVIOUS WEEK SCORES:
${previousScores ? JSON.stringify(previousScores, null, 2) : 'No previous data'}

TODAY: ${new Date().toISOString().split('T')[0]}

Return this JSON:
{
  "summary": "2-3 sentence overview of the user's week",
  "highlights": ["Key positive thing 1", "Key positive thing 2"],
  "patterns": ["Pattern noticed 1", "Pattern noticed 2"],
  "score": 0
}`,
    }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Oracle weekly report returned no valid JSON');

  return JSON.parse(jsonMatch[0]);
}

// ── Mock Data Generator (for demo/onboarding) ─────────────────────

export function getMockOracleData(): OracleAnalysis {
  return {
    life_score: {
      overall: 71, financial: 68, social: 54, health: 79,
      productivity: 74, emotional: 65, growth: 82,
    },
    insights: [
      {
        category:   'social',
        severity:   'alert',
        title:      "Isolation Index +34% — Social withdrawal detected",
        content:    "You've cancelled plans with friends 4 times this month vs 1 time last month. Your response rate to social messages has dropped from 94% to 61%. This pattern correlates with increased work hours.",
        confidence: 0.91,
        dataPoints: ['4 cancellations in 28 days', '61% message response rate', '23% increase in solo evenings'],
        action:     'Schedule 1 social commitment this week you won\'t cancel',
        actionType: 'connect',
      },
      {
        category:   'health',
        severity:   'warning',
        title:      "Sleep dropped 41 min since job change",
        content:    "Since March 12, your average sleep has declined from 7h 18m to 6h 37m. This coincides exactly with your new job start. Your calendar shows meetings scheduled before 8am on 3 days per week.",
        confidence: 0.88,
        dataPoints: ['Avg sleep: 6h 37m (↓41min)', 'Job start: March 12', '3× weekly pre-8am meetings'],
        action:     'Block 10:30pm–6:30am as sacred sleep window in your calendar',
        actionType: 'sleep',
      },
      {
        category:   'financial',
        severity:   'info',
        title:      "Savings rate improved 8% vs last quarter",
        content:    "Your savings rate is up to 23% from 15% last quarter. Dining out dropped $340/month since you started meal prepping. However, streaming subscriptions have crept to $87/month — 4 you haven't used in 45+ days.",
        confidence: 0.95,
        dataPoints: ['Savings rate: 23%', 'Dining savings: $340/mo', '4 unused subscriptions: $87/mo'],
        action:     'Cancel the 4 dormant streaming subscriptions',
        actionType: 'cancel',
      },
      {
        category:   'behavioral',
        severity:   'warning',
        title:      "Self-sabotage pattern before major milestones",
        content:    "Before your last 3 major presentations or deadlines, you show a consistent pattern: sleep drops 45min, alcohol consumption increases, and you cancel social plans. Your next big deadline is in 11 days.",
        confidence: 0.82,
        dataPoints: ['Pattern detected over 3 events', 'Next deadline: 11 days', 'Sleep/alcohol correlation: 0.87'],
        action:     'Set a pre-deadline ritual — 3 days before, go to bed 30min earlier',
        actionType: 'reflect',
      },
      {
        category:   'emotional',
        severity:   'info',
        title:      "Positive emotional momentum building",
        content:    "Your journaling entries show a shift toward more future-oriented language over the past 2 weeks. Words like 'excited', 'opportunity', and 'planning' are up 40%. This is a strong signal of growing psychological safety.",
        confidence: 0.76,
        dataPoints: ['Future-oriented words: +40%', 'Anxiety language: -18%', 'Journal consistency: 6/7 days'],
        action:     'Capture this momentum — write your 90-day vision this weekend',
        actionType: 'reflect',
      },
    ],
    patterns: [
      {
        name:        'Sunday Anxiety Spike',
        description: 'Heart rate and restless sleep increase every Sunday night. Calendar shows you review emails Sunday evenings — this habit is triggering anticipatory work stress.',
        frequency:   'Weekly',
        category:    'emotional',
        severity:    'warning',
      },
      {
        name:        'Pre-Milestone Self-Sabotage',
        description: 'Sleep, social connection, and physical activity all decline in the 5 days before major professional milestones. Pattern detected 3 consecutive times.',
        frequency:   'Monthly',
        category:    'behavioral',
        severity:    'warning',
      },
      {
        name:        'Weekend Recovery Mode',
        description: 'You consistently over-sleep on weekends (+2.1h average) suggesting accumulated weekday sleep debt. This indicates a structural sleep deficit, not laziness.',
        frequency:   'Weekly',
        category:    'health',
        severity:    'info',
      },
    ],
    weekly_summary: "You had a high-productivity week professionally, but your social and emotional reserves are showing strain. The isolation index is the clearest signal to address — sustained social withdrawal has downstream effects on both emotional resilience and decision quality. Your financial trajectory is genuinely strong; don't let short-term stress spending erode those gains.",
    urgent_alerts: [
      {
        category:   'social',
        severity:   'alert',
        title:      "Isolation Index +34% — Social withdrawal detected",
        content:    "You've cancelled plans with friends 4 times this month vs 1 time last month.",
        confidence: 0.91,
        dataPoints: ['4 cancellations in 28 days', '61% message response rate'],
        action:     'Schedule 1 social commitment this week you won\'t cancel',
        actionType: 'connect',
      },
    ],
  };
}
