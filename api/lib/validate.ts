// Input validation for the AI Portfolio Assistant API.
// Keeps context/token usage low and blocks abuse (oversized or malformed bodies).

export const MAX_MESSAGE_LENGTH = 800; // chars, per user message
export const MAX_HISTORY = 12; // total messages sent to the model (incl. current)
export const MAX_BODY_BYTES = 60_000;

export type ChatRole = "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ValidatedRequest {
  messages: ChatMessage[];
}

export class ValidationError extends Error {
  constructor(message: string, public readonly status: number = 400) {
    super(message);
    this.name = "ValidationError";
  }
}

export function parseAndValidate(rawBody: string | null): ValidatedRequest {
  if (!rawBody || rawBody.trim().length === 0) {
    throw new ValidationError("Empty request body.", 400);
  }
  if (rawBody.length > MAX_BODY_BYTES) {
    throw new ValidationError("Request body too large.", 413);
  }

  let data: unknown;
  try {
    data = JSON.parse(rawBody);
  } catch {
    throw new ValidationError("Invalid JSON body.", 400);
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new ValidationError("Request body must be a JSON object.", 400);
  }

  const body = data as Record<string, unknown>;
  const rawMessages = body.messages;

  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    throw new ValidationError("'messages' must be a non-empty array.", 400);
  }
  if (rawMessages.length > MAX_HISTORY) {
    throw new ValidationError(`Conversation history too long (max ${MAX_HISTORY} messages).`, 400);
  }

  const messages: ChatMessage[] = [];
  for (const item of rawMessages) {
    if (typeof item !== "object" || item === null) {
      throw new ValidationError("Each message must be an object.", 400);
    }
    const msg = item as Record<string, unknown>;
    const role = msg.role;
    const content = msg.content;

    if (role !== "user" && role !== "assistant") {
      throw new ValidationError("Message role must be 'user' or 'assistant'.", 400);
    }
    if (typeof content !== "string") {
      throw new ValidationError("Message content must be a string.", 400);
    }

    const trimmed = content.trim();
    if (trimmed.length === 0) {
      throw new ValidationError("Message content cannot be empty.", 400);
    }
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      throw new ValidationError(`Message too long (max ${MAX_MESSAGE_LENGTH} characters).`, 400);
    }

    messages.push({ role, content: trimmed });
  }

  // The last message must come from the user.
  if (messages[messages.length - 1].role !== "user") {
    throw new ValidationError("The last message must come from the user.", 400);
  }

  return { messages };
}
