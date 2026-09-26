import { openaiBreaker } from "../lib/http/openai.breaker.js";

export async function createEmbedding(text: string) {
  const response = await openaiBreaker.fire("/embeddings", {
    input: text,
    model: "text-embedding-3-small",
  });
  return response.data;
}
