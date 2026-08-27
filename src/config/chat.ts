// Client-side configuration for the AI Portfolio Assistant widget.
// The endpoint hits the Vercel serverless function, which holds the API key
// server-side. Override VITE_CHAT_ENDPOINT in .env for local/preview testing.

export const CHAT_CONFIG = {
  endpoint: import.meta.env.VITE_CHAT_ENDPOINT || "/api/chat",
  maxMessageLength: 800,
  maxHistory: 12,
  headerTitle: "Ask Mohit's AI assistant",
  headerSubtitle: "Projects, experience, skills & background",
  greeting:
    "Hi! I'm the AI assistant for Mohit Rajput's portfolio. Ask me about his projects, experience, skills, background, or how to get in touch.",
  suggestedPrompts: [
    "Recommend a project to look at",
    "Summarize your experience",
    "What are your core skills?",
    "What are you working on right now?",
    "How can I contact you?",
  ],
};
