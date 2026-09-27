import type { AIProvider, EmbedOptions, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'
import { toProviderError } from './errors.js'

const LOCAL_BASE = process.env.LOCAL_API_URL || 'http://localhost:20128/v1'

/**
 * Supported local embedding models — all 384-dim to match DocumentChunk vector(384).
 * MiniLM is the legacy default; bge-small is the same-size quality upgrade;
 * multilingual-e5 covers non-English KBs. All download on first use via
 * @huggingface/transformers and cache on the VPS.
 */
export const LOCAL_EMBEDDING_MODELS = {
  'all-minilm': 'Xenova/all-MiniLM-L6-v2',
  'bge-small': 'Xenova/bge-small-en-v1.5',
  'multilingual-e5': 'Xenova/multilingual-e5-small',
} as const

export type LocalEmbeddingModelId = keyof typeof LOCAL_EMBEDDING_MODELS

const DEFAULT_LOCAL_EMBEDDING_MODEL: LocalEmbeddingModelId =
  (process.env.LOCAL_EMBEDDING_MODEL as LocalEmbeddingModelId) in LOCAL_EMBEDDING_MODELS
    ? (process.env.LOCAL_EMBEDDING_MODEL as LocalEmbeddingModelId)
    : 'all-minilm'

/** bge/e5 need an instruction prefix on queries only (not stored documents). */
const QUERY_PREFIX: Record<string, string> = {
  'Xenova/bge-small-en-v1.5': 'Represent this sentence for searching relevant passages: ',
  'Xenova/multilingual-e5-small': 'query: ',
}

let embedPipeline: any = null
let embedPipelineModel: string | null = null

/**
 * The pipeline is model-bound: switching models swaps the cached pipeline.
 * One process should stick to one model — the org setting is read once per
 * embed call, but transformers.js caches downloaded weights on disk either way.
 */
async function getEmbedPipeline(modelId: string) {
  if (!embedPipeline || embedPipelineModel !== modelId) {
    const { pipeline } = await import('@huggingface/transformers')
    await embedPipeline?.dispose?.()
    embedPipeline = await pipeline('feature-extraction', modelId)
    embedPipelineModel = modelId
  }
  return embedPipeline
}

export class LocalProvider implements AIProvider {
  id = 'local'
  name = 'OmniRoute'

  private buildBody(params: GenerateParams, stream?: boolean): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: params.model,
      messages: params.messages,
      temperature: params.temperature,
      max_tokens: params.maxTokens,
    }

    if (params.tools && params.tools.length > 0) {
      body.tools = params.tools.map(t => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }))
    }

    if (params.reasoningEffort) body.reasoning_effort = params.reasoningEffort
    if (params.thinking !== undefined) body.thinking = params.thinking
    if (stream) body.stream = true

    return body
  }

  private async fetchCompletions(body: Record<string, unknown>, apiKey?: string): Promise<Response> {
    return fetch(`${LOCAL_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify(body),
    })
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    try {
      const body = this.buildBody(params)
      const res = await this.fetchCompletions(body, params.apiKey)

      if (!res.ok) {
        const err = await res.text().catch(() => res.statusText)
        throw new Error(`OmniRoute API error (${res.status}): ${err}`)
      }

      const data = await res.json()
      const choice = data.choices?.[0]

      return {
        content: choice?.message?.content || choice?.message?.reasoning_content || '',
        usage: {
          promptTokens: data.usage?.prompt_tokens ?? 0,
          completionTokens: data.usage?.completion_tokens ?? 0,
          totalTokens: data.usage?.total_tokens ?? 0,
        },
      }
    } catch (error) {
      throw toProviderError(error, 'OmniRoute')
    }
  }

  async *stream(params: GenerateParams): AsyncIterable<StreamChunk> {
    const body = this.buildBody(params, true)
    let res: Response
    try {
      res = await this.fetchCompletions(body, params.apiKey)
    } catch (error) {
      throw toProviderError(error, 'OmniRoute')
    }

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText)
      throw toProviderError(new Error(`OmniRoute API error (${res.status}): ${err}`), 'OmniRoute')
    }

    const reader = res.body?.getReader()
    if (!reader) throw toProviderError(new Error('No response body'), 'OmniRoute')

    const decoder = new TextDecoder()
    let buffer = ''
    let finalUsage: StreamChunk['usage']
    const toolCallAccum: Record<number, { id: string; name: string; arguments: string }> = {}

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue

        const payload = trimmed.slice(6)
        if (payload === '[DONE]') continue

        try {
          const parsed = JSON.parse(payload)
          const delta = parsed.choices?.[0]?.delta
          if (delta?.content) yield { type: 'text', content: delta.content }
          if (delta?.reasoning_content) yield { type: 'reasoning', content: delta.reasoning_content }
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index
              if (tc.id) {
                toolCallAccum[idx] = { id: tc.id, name: tc.function?.name || '', arguments: tc.function?.arguments || '' }
              } else if (toolCallAccum[idx]) {
                toolCallAccum[idx].arguments += tc.function?.arguments || ''
              }
            }
          }
          if (parsed.usage) {
            finalUsage = {
              promptTokens: parsed.usage.prompt_tokens ?? 0,
              completionTokens: parsed.usage.completion_tokens ?? 0,
              totalTokens: parsed.usage.total_tokens ?? 0,
            }
          }
        } catch { /* skip malformed SSE */ }
      }
    }

    for (const tc of Object.values(toolCallAccum)) {
      try {
        const args = JSON.parse(tc.arguments) as Record<string, unknown>
        yield {
          type: 'tool_call',
          toolCall: { id: tc.id, name: tc.name, arguments: args },
        }
      } catch { /* skip malformed tool call JSON */ }
    }

    yield { type: 'done', usage: finalUsage }
  }

  async embed(text: string, options?: EmbedOptions): Promise<number[]> {
    try {
      const key = (options?.model as LocalEmbeddingModelId) ?? DEFAULT_LOCAL_EMBEDDING_MODEL
      const modelId = LOCAL_EMBEDDING_MODELS[key] ?? LOCAL_EMBEDDING_MODELS[DEFAULT_LOCAL_EMBEDDING_MODEL]
      const prefixed = options?.task === 'query' ? (QUERY_PREFIX[modelId] ?? '') + text : text
      const pipe = await getEmbedPipeline(modelId)
      const result = await pipe(prefixed, { pooling: 'mean', normalize: true })
      return Array.from(result.data) as number[]
    } catch (error) {
      throw toProviderError(error, 'OmniRoute')
    }
  }

  async moderate(_text: string): Promise<ModerationResult> {
    return { flagged: false, categories: {} }
  }

  async listModels(): Promise<Model[]> {
    const response = await fetch(`${LOCAL_BASE}/models`)
    if (!response.ok) return []

    const data = await response.json() as { data: Array<{ id: string }> }
    return (data.data || []).map((m) => ({
      id: m.id,
      name: m.id,
      provider: 'local',
      maxTokens: 1048576,
      supportsTools: true,
      supportsStreaming: true,
    }))
  }
}
