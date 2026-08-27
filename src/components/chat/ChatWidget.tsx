import { useEffect, useRef, useState } from "react";
import { Send, X, Sparkles, Bot, User } from "lucide-react";
import { CHAT_CONFIG } from "../../config/chat";
import {
  streamChat,
  readStream,
  ChatApiError,
  type ChatMessage,
} from "../../lib/chat-client";

type UiMessage = ChatMessage;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [started, setStarted] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Seed the conversation with a greeting the first time the panel opens.
  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      setMessages([{ role: "assistant", content: CHAT_CONFIG.greeting }]);
    }
  }, [open, started]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, isStreaming]);

  // Focus input whenever the panel opens and a stream is not running.
  useEffect(() => {
    if (open && !isStreaming) inputRef.current?.focus();
  }, [open, isStreaming]);

  const remaining = CHAT_CONFIG.maxMessageLength - input.length;

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const history: UiMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(history);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    let acc = "";
    try {
      const stream = await streamChat(history);
      await readStream(stream, (chunk) => {
        acc += chunk;
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      });

      if (!acc.trim()) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content:
              "I couldn't find an answer for that. Please try another question about the portfolio.",
          };
          return copy;
        });
      }
    } catch (err) {
      const msg =
        err instanceof ChatApiError
          ? err.message
          : "Something went wrong. Please try again.";
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: `⚠️ ${msg}` };
        return copy;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  function onSend() {
    void send(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        title="Ask my AI assistant"
        className="fixed bottom-5 right-5 z-[70] inline-flex items-center gap-2 rounded-full pl-4 pr-5 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105"
        style={{ background: "var(--primary)" }}
      >
        <Bot className="size-5" />
        <span className="hidden sm:inline">Ask AI</span>
        {open && <X className="size-4" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-[70] flex w-[calc(100vw-2.5rem)] max-w-[24rem] flex-col overflow-hidden rounded-2xl border"
          style={{
            background: "var(--card)",
            borderColor: "var(--border-strong)",
            color: "var(--foreground)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.25), 0 0 0 1px var(--border-soft)",
          }}
          role="dialog"
          aria-label="AI portfolio assistant"
        >
          {/* Header */}
          <div
            className="flex items-start justify-between gap-2 px-4 py-3 border-b"
            style={{ borderColor: "var(--border-soft)" }}
          >
            <div className="flex items-start gap-2.5">
              <span
                className="inline-flex items-center justify-center size-8 rounded-full shrink-0"
                style={{ background: "var(--primary)" }}
              >
                <Sparkles className="size-4 text-primary-foreground" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  {CHAT_CONFIG.headerTitle}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  {CHAT_CONFIG.headerSubtitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-1 rounded-lg transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ minHeight: "16rem", maxHeight: "24rem" }}
          >
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={i}
                  className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}
                >
                  <span
                    className="inline-flex items-center justify-center size-6 rounded-full shrink-0 mt-0.5"
                    style={{
                      background: isUser ? "var(--primary)" : "var(--input-background)",
                      color: isUser ? "var(--primary-foreground)" : "var(--muted-foreground)",
                    }}
                  >
                    {isUser ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
                  </span>
                  <div
                    className="max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
                    style={
                      isUser
                        ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                        : { background: "var(--input-background)", color: "var(--foreground)" }
                    }
                  >
                    {m.content}
                    {isStreaming && i === messages.length - 1 && (
                      <span
                        className="inline-block w-1.5 h-4 ml-0.5 align-middle animate-pulse"
                        style={{ background: "var(--muted-foreground)" }}
                      />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Suggested prompts */}
            {showSuggestions && !isStreaming && (
              <div className="flex flex-wrap gap-2 pt-1">
                {CHAT_CONFIG.suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => void send(p)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                    style={{
                      borderColor: "var(--border-soft)",
                      color: "var(--text-secondary)",
                      background: "transparent",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t" style={{ borderColor: "var(--border-soft)" }}>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) =>
                  setInput(e.target.value.slice(0, CHAT_CONFIG.maxMessageLength))
                }
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Ask about my work..."
                className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm outline-none focus-visible:ring-2"
                style={{
                  background: "var(--input-background)",
                  color: "var(--foreground)",
                  borderColor: "var(--border-soft)",
                }}
              />
              <button
                onClick={onSend}
                disabled={!input.trim() || isStreaming}
                aria-label="Send message"
                className="inline-flex items-center justify-center size-9 rounded-xl text-primary-foreground disabled:opacity-40 transition-all"
                style={{ background: "var(--primary)" }}
              >
                <Send className="size-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              {remaining >= 0 ? `${remaining} chars left` : "0 chars left"} · Answers
              from Mohit's portfolio only.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

