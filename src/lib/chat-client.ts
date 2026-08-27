// Minimal streaming client for the AI Portfolio Assistant.

import { CHAT_CONFIG } from "../config/chat";

export type ChatRole = "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export class ChatApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ChatApiError";
  }
}

export async function streamChat(
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(CHAT_CONFIG.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: messages.slice(-CHAT_CONFIG.maxHistory) }),
    signal,
  });

  if (!res.ok) {
    let code: string | undefined;
    let message = `Request failed (${res.status}).`;
    try {
      const data = await res.json();
      code = data?.error?.code;
      if (data?.error?.message) message = data.error.message;
    } catch {
      // fall through with default message
    }
    throw new ChatApiError(message, code, res.status);
  }

  if (!res.body) {
    throw new ChatApiError("The server returned an empty response.", "EMPTY", 200);
  }
  return res.body;
}

export async function readStream(
  stream: ReadableStream<Uint8Array>,
  onChunk: (text: string) => void,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value, { stream: true }));
    }
    // Flush any remaining decoder state.
    const rest = decoder.decode();
    if (rest) onChunk(rest);
  } finally {
    reader.releaseLock();
  }
}
