# Mohit Rajput | Portfolio

Welcome to my portfolio website! This repository contains the code for my personal portfolio built using React.

## About

I am a MERN stack and software developer passionate about creating innovative and user-friendly web applications. This portfolio showcases some of my projects and skills.

## Skills

Here are some of the skills and technologies I'm proficient in:

- **Frontend**: React.js, HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Databases**: MongoDB, FireStore
- **Version Control**: Git, GitHub
- **Other**: RESTful APIs, Responsive Web Design, Vscode

## Features

- Responsive design
- Projects showcase
- Contact form

## Contact

Feel free to reach out to me if you have any questions or feedback!

Email: [999mohitrajput@gmail.com](mailto:999mohitrajput@gmail.com)

## AI Portfolio Assistant

A grounded, RAG-style AI assistant (floating button, bottom-right) that answers
questions **only** about the portfolio owner. It uses a Groq free-tier model and
keeps the API key server-side (never shipped to the browser).

### Architecture

```
api/
  chat.ts                  Vercel serverless function (POST /api/chat)
  lib/
    groq.ts                Groq streaming client (server-side API key)
    rateLimit.ts           In-memory per-IP rate limiter (configurable)
    validate.ts            Input validation (length, history, body size)
    knowledge.ts           Builds the system message from the data files
  prompts/
    systemPrompt.ts        Dedicated, maintainable system prompt
src/
  data/portfolio/*.json    Single source of truth (profile, projects, experience,
                           skills, education, achievements, contact)
  config/chat.ts           Client widget config (endpoint, limits, suggested prompts)
  lib/chat-client.ts       Client streaming fetch + SSE parsing
  components/chat/ChatWidget.tsx  Floating chat UI (respects light/dark theme)
```

### Deploy on Vercel

1. Push this repo to GitHub and import it into **Vercel** (it will detect Vite
   via `vercel.json`; the `api/` folder becomes serverless functions).
2. In Vercel, set these **Environment Variables** (Project → Settings → Environment
   Variables) — keep the real values out of git:
   - `GROQ_API_KEY` (required)
   - `GROQ_BASE_URL` (optional, default `https://api.groq.com/openai/v1`)
   - `GROQ_MODEL` (optional, default `llama-3.3-70b-versatile`)
   - `RATE_LIMIT_MAX` (optional, default `15` requests/IP/hour)
   - `RATE_LIMIT_WINDOW_MS` (optional, default `3600000`)
3. Deploy. The assistant is live at `/api/chat`.

> The rate limiter is in-memory per serverless instance — fine for a portfolio
> site. For fully persistent limits use Vercel's built-in rate limiter or a
> KV-backed store.

### Local development

- `cp .env.example .env` and add your real `GROQ_API_KEY`.
- Run `npm run dev`. A Vite dev middleware serves the same `/api/chat` handler
  locally, so the assistant works end-to-end without `vercel dev`. The `.env`
  secrets are loaded into the dev process via `vite.config.ts`.
- For the Vercel-native flow (serverless function runner), `npx vercel dev`
  works too.

### Keeping the assistant truthful

All answers come from `src/data/portfolio/*.json` via the system prompt in
`api/prompts/systemPrompt.ts`. The prompt forbids the model from inventing any
project, employer, title, technology, credential, achievement, or metric.
Update the JSON files (never edit generated answers) to change what the
assistant knows.

## License

This project is licensed under the [MIT License](LICENSE).
