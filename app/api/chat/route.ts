import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Limits are deliberately generous for a student revising for a viva, but cap
// the cost of a single streaming call and the history sent with it.
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 4_000;
const MAX_TOTAL_CHARS = 20_000;
const MAX_BODY_BYTES = 128 * 1024;
const USER_LIMIT = 20;
const USER_WINDOW_MS = 5 * 60_000;
const IP_LIMIT = 60;
const IP_WINDOW_MS = 5 * 60_000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function validateMessages(
  value: unknown
): { messages: ChatMessage[] } | { error: string } {
  if (!Array.isArray(value) || value.length === 0) {
    return { error: "messages must be a non-empty array" };
  }

  // Keep a long conversation usable by sending only its most recent turns
  // instead of rejecting it outright.
  const recent = value.slice(-MAX_MESSAGES);
  const messages: ChatMessage[] = [];

  for (const raw of recent) {
    if (!raw || typeof raw !== "object") {
      return { error: "Each message must be an object" };
    }

    const { role, content } = raw as { role?: unknown; content?: unknown };
    if (role !== "user" && role !== "assistant") {
      return { error: "Message role must be 'user' or 'assistant'" };
    }
    if (typeof content !== "string") {
      return { error: "Message content must be a string" };
    }

    const trimmed = content.trim();
    if (!trimmed) {
      return { error: "Message content must not be empty" };
    }
    if (trimmed.length > MAX_MESSAGE_CHARS) {
      return {
        error: `Message content must be at most ${MAX_MESSAGE_CHARS} characters`,
      };
    }

    messages.push({ role, content: trimmed });
  }

  // Drop the oldest turns until the history fits the character budget.
  let start = 0;
  let total = messages.reduce((sum, message) => sum + message.content.length, 0);
  while (start < messages.length && total > MAX_TOTAL_CHARS) {
    total -= messages[start].content.length;
    start += 1;
  }

  let turns = messages.slice(start);

  // The API expects the history to begin with a user turn; trimming may leave
  // an assistant reply at the front.
  while (turns.length > 0 && turns[0].role !== "user") {
    turns = turns.slice(1);
  }

  if (turns.length === 0) {
    return { error: "Conversation is too long" };
  }
  if (turns[turns.length - 1].role !== "user") {
    return { error: "The last message must be from the user" };
  }

  return { messages: turns };
}

function clientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip");
}

const SYSTEM_PROMPT = `You are the Project House Viva Bot — a friendly, knowledgeable assistant that helps engineering and computer science students prepare for their final year project viva (oral examination).

Your expertise covers:
- Machine Learning (regression, classification, clustering, XGBoost, Random Forest, SVMs, etc.)
- Deep Learning (CNNs, RNNs, LSTMs, Transformers, BERT, ResNet, EfficientNet, etc.)
- Computer Vision (object detection, segmentation, YOLO, OpenCV, Grad-CAM, etc.)
- Full-stack Web Development (MERN, Next.js, REST APIs, databases, auth, deployment)
- Mobile Development (Flutter, React Native, TFLite, Firebase, Expo)
- General viva preparation (how to explain methodology, defend results, handle panel questions)

How you respond:
- Give clear, concise answers a student can actually say out loud in a viva
- When explaining technical concepts, always relate them back to how they appear in a typical student project
- Point out common follow-up questions panellists ask and how to answer them
- Keep answers focused — no rambling, no padding
- Use simple analogies when explaining complex topics
- If asked about code, give short, illustrative snippets only when necessary

You are NOT a general-purpose assistant. Politely redirect off-topic questions back to project and viva prep.`;

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body is too large" }, { status: 413 });
  }

  // The Viva Bot is for signed-in students; this also means every request has
  // an accountable owner instead of letting anonymous traffic spend the
  // Anthropic budget. Check this before parsing the body.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in to use the Viva Bot" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateMessages((body as { messages?: unknown } | null)?.messages);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { messages } = parsed;

  // Throttle per account, and per IP as a second line of defence against
  // someone creating throwaway accounts.
  const userLimit = rateLimit(`chat:user:${user.id}`, USER_LIMIT, USER_WINDOW_MS);
  if (!userLimit.ok) {
    return NextResponse.json(
      { error: "Too many messages. Please wait a few minutes and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(userLimit.retryAfter),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const ip = clientIp(request);
  if (ip) {
    const ipLimit = rateLimit(`chat:ip:${ip}`, IP_LIMIT, IP_WINDOW_MS);
    if (!ipLimit.ok) {
      return NextResponse.json(
        { error: "Too many requests from this network. Please try again later." },
        { status: 429, headers: { "Retry-After": String(ipLimit.retryAfter) } }
      );
    }
  }

  try {
    const stream = client.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (streamErr) {
          const msg = streamErr instanceof Error ? streamErr.message : "Stream error";
          controller.enqueue(new TextEncoder().encode(`__ERROR__:${msg}`));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-RateLimit-Remaining": String(userLimit.remaining),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
