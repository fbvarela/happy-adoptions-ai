import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt } from '@/lib/chat-config';
import { requireAuth } from '@/lib/auth/session';
import { sql } from '@/lib/db';

let _client = null;
function getClient() {
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

async function getAdopterProfile(userId) {
  try {
    const rows = await sql`
      SELECT profile_data FROM adopter_profiles WHERE user_id = ${userId}
    `;
    if (!rows[0]?.profile_data) return null;
    const p = rows[0].profile_data;

    // Also fetch favorites (shortlisted dogs) to give the AI context
    const favRows = await sql`
      SELECT dp.name, dp.breed, dp.age_months
      FROM favorites f
      LEFT JOIN dog_posts dp ON f.dog_post_id = dp.id
      WHERE f.user_id = ${userId}
      ORDER BY f.created_at DESC
      LIMIT 10
    `;

    return {
      lifestyle: p.lifestyle ?? p.activityLevel ?? null,
      housing: p.housing ?? p.housingType ?? null,
      experience: p.experience ?? p.dogExperience ?? null,
      shortlist: favRows.map((d) => ({
        name: d.name ?? 'Unknown',
        breed: d.breed ?? null,
        age: d.age_months != null ? Math.round(d.age_months / 12) : null,
      })),
    };
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const { message, history = [] } = await req.json();
    if (!message?.trim()) {
      return Response.json({ error: 'message required' }, { status: 400 });
    }

    // Try to get session context (non-blocking — guests can still chat)
    let adopter = null;
    try {
      const { session, error } = await requireAuth();
      if (!error && session?.userId) {
        adopter = await getAdopterProfile(session.userId);
      }
    } catch {
      // Unauthenticated — chat without profile context
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const aiStream = getClient().messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 800,
            system: buildSystemPrompt(adopter),
            messages: [
              ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
              { role: 'user', content: message },
            ],
          });
          for await (const event of aiStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Error';
          controller.enqueue(encoder.encode(`\x00ERROR:${msg}`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return Response.json({ error: 'Chat failed' }, { status: 500 });
  }
}
