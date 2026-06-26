const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b"

export interface OllamaMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export async function streamFromOllama(messages: OllamaMessage[]) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: true,
      options: { num_ctx: 4096, temperature: 0.7 },
    }),
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error("Ollama model not found. Run: ollama pull " + OLLAMA_MODEL)
    throw new Error("Ollama unavailable (" + res.status + "). Is ollama serve running?")
  }

  return res.body!
}
