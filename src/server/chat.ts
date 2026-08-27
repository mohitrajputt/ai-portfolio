// Vercel serverless function: POST /api/chat
// Handles validation, rate limiting, and streaming of the AI Portfolio
// Assistant's response. The Groq API key stays server-side only.
//
// NOTE: This file is the SOURCE. It is bundled by scripts/build-server.mjs
// into the single deployable file api/chat.js (all relative imports + JSON
// inlined) so Node never has to resolve extensionless/relative modules at
// runtime on Vercel.

import {
  parseAndValidate,
  ValidationError,
  type ChatMessage,
} from "./lib/validate";
import { createLimiter } from "./lib/rateLimit";
import { getSystemPrompt } from "./lib/knowledge";
import { streamCompletion, isConfigured, GroqConfigError } from "./lib/groq";

export const config = { runtime: "nodejs" };

// One limiter shared across requests to this instance (per-instance, in-memory).
const limiter = createLimiter();

function json(
  body: unknown,
  status: number,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Convert Groq's SSE stream into a clean plain-text stream the client renders.
function forwardCleanedStream(upstream: Response): Response {
  const reader = upstream.body!.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta.length > 0) {
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // Ignore partial/incomplete frames.
            }
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json(
      { error: { code: "METHOD_NOT_ALLOWED", message: "Use POST." } },
      405,
      { Allow: "POST" },
    );
  }

  if (!isConfigured()) {
    return json(
      {
        error: {
          code: "NOT_CONFIGURED",
          message: "The assistant API is not configured on the server yet.",
        },
      },
      503,
    );
  }

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const limit = limiter.consume(ip);
  if (!limit.allowed) {
    return json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please try again later.",
        },
      },
      429,
      { "Retry-After": String(limit.retryAfterSeconds ?? 60) },
    );
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const rawBody = await req.text();
  let validated: { messages: ChatMessage[] };
  try {
    validated = parseAndValidate(rawBody);
  } catch (err) {
    if (err instanceof ValidationError) {
      return json(
        { error: { code: "VALIDATION", message: err.message } },
        err.status,
      );
    }
    throw err;
  }

  // ── Assemble request to the model ────────────────────────────────────────
  const messages = [
    { role: "system" as const, content: getSystemPrompt() },
    ...validated.messages,
  ];

  // ── Upstream call (streaming) ────────────────────────────────────────────
  let upstream: Response;
  try {
    upstream = await streamCompletion(messages);
  } catch (err) {
    if (err instanceof GroqConfigError) {
      return json(
        { error: { code: "NOT_CONFIGURED", message: err.message } },
        503,
      );
    }
    console.error("Groq request failed:", err);
    return json(
      { error: { code: "UPSTREAM", message: "Could not reach the language model." } },
      502,
    );
  }

  if (!upstream.ok || !upstream.body) {
    let detail = `Groq returned status ${upstream.status}.`;
    try {
      const text = await upstream.text();
      if (text) detail += ` ${text.slice(0, 300)}`;
    } catch {
      // ignore
    }
    console.error("Groq error:", detail);
    const status = upstream.status === 429 ? 429 : 502;
    return json(
      {
        error: {
          code: "UPSTREAM",
          message:
            status === 429
              ? "The AI service is temporarily busy. Please try again shortly."
              : "The language model returned an error.",
        },
      },
      status,
    );
  }

  return forwardCleanedStream(upstream);
}