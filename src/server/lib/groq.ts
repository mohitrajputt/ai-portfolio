// Groq API client for the AI Portfolio Assistant.
// Uses the OpenAI-compatible Groq endpoint with streaming. The API key is read
// from server-side environment variables only (never shipped to the browser).

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class GroqConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GroqConfigError";
  }
}

const BASE_URL = (process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1").replace(/\/+$/, "");
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
// const API_KEY = process.env.GROQ_API_KEY || "";
const API_KEY = import.meta.env.GROQ_API_KEY || "";

export function isConfigured(): boolean {
  return API_KEY.length > 0;
}

export async function streamCompletion(
  messages: GroqMessage[],
  signal?: AbortSignal,
): Promise<Response> {
  if (!isConfigured()) {
    throw new GroqConfigError("GROQ_API_KEY is not configured on the server.");
  }

  return fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: true,
      temperature: 0.3,
      max_tokens: 700,
    }),
    signal,
  });
}