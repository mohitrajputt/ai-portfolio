import { defineConfig, loadEnv, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// Dev-only plugin that serves the serverless /api/chat function locally so the
// AI assistant works under `npm run dev` without needing `vercel dev`. It reuses
// the exact same handler (src/server/chat.ts) that runs on Vercel in production
// (bundled to api/chat.js at build time).
//
// The production API needs the Groq key from .env, so we also load every .env
// key (including non-VITE_ secrets like GROQ_API_KEY) into process.env here.
function serveChatApiInDev(): Plugin {
  return {
    name: 'serve-chat-api-in-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/chat', (req, res) => {
        handleChatRequest(server, req, res).catch((err) => {
          console.error('[chat-api] dev error:', err)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                error: { code: 'DEV_ERROR', message: String(err?.message || err) },
              }),
            )
          } else {
            res.end()
          }
        })
      })
    },
  }
}

async function handleChatRequest(server, req, res): Promise<void> {
  // Read the request body.
  const chunks = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const rawBody = Buffer.concat(chunks).toString('utf8')

  // Load the handler through Vite so its TS and JSON imports are transformed.
  const mod = await server.ssrLoadModule('/src/server/chat.ts')
  const handler = mod.default

  // Build a Fetch API Request from the connect IncomingMessage.
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v)
    } else if (value !== undefined) {
      headers.set(key, value)
    }
  }
  const isBodyMethod = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH'
  const request = new Request(`http://localhost${req.url || '/api/chat'}`, {
    method: req.method || 'GET',
    headers,
    body: isBodyMethod ? rawBody : undefined,
  })

  // Invoke the same handler used in production.
  const response = await handler(request)

  res.statusCode = response.status
  for (const [key, value] of response.headers) res.setHeader(key, value)

  // Pipe the response body through (supports the streaming text response).
  if (response.body) {
    const reader = response.body.getReader()
    const pump = async () => {
      const { done, value } = await reader.read()
      if (done) {
        res.end()
        return
      }
      res.write(Buffer.from(value))
      void pump()
    }
    void pump()
  } else {
    const text = await response.text()
    res.end(text)
  }
}

export default defineConfig(({ mode }) => {
  // Load all .env keys (including secrets like GROQ_API_KEY) into process.env
  // for the dev API handler.
  const env = loadEnv(mode, process.cwd(), [''])
  Object.assign(process.env, env)

  return {
    plugins: [
      figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
      serveChatApiInDev(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})

