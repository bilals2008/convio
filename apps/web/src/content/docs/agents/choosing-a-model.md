# Choosing a model

Convio is provider-agnostic. The same agent runs on OpenAI, Anthropic, Google, Groq, OpenRouter, or anything OpenAI-compatible, and you can switch per agent.

## Available providers

| Provider | Notes |
|---|---|
| **OpenAI** | `gpt-4o`, `gpt-4o-mini` (the default) |
| **Anthropic** | `claude-3-5-sonnet`, `claude-3-haiku` |
| **Google** | Gemini 3.6 / 3.5 Flash, Flash-Lite, 3.1 Pro, 3 Flash, 2.5 Flash, 2.5 Pro — 65k context |
| **Groq** | `llama-3.1-70b-versatile` (128k, tools), `mixtral-8x7b-32768` (32k, **no tool support**) |
| **OpenRouter** | The widest catalogue — GPT, Claude, Gemini, Llama, Mistral, DeepSeek, Qwen under one key |
| **OpenCode** | Free models: DeepSeek V4 Flash, Mimo 2.5, Nemotron 3 Ultra, North Mini Code, Laguna S 2.1 |
| **OpenAI-compatible** | Mistral, Together, DeepSeek, Perplexity, Agnes AI — point at any compatible endpoint |

## Which to pick

**Just shipping something** — `gpt-4o-mini`. It is the default for a reason: cheap, fast, and good enough for most support and FAQ traffic.

**Quality matters more than cost** — `gpt-4o`, or Claude 3.5 Sonnet. Both handle long, nuanced instructions and multi-step reasoning noticeably better than the mini class.

**Latency and cost are the constraint** — Groq's `llama-3.1-70b-versatile`, or one of the free OpenCode models. Good for high-volume, narrow-scope work.

**You want one key and many models** — OpenRouter. It is the only provider here exposing other vendors' models behind your own credentials.

**Very long documents** — Gemini Pro and Flash carry a 65k window, and OpenRouter's Gemini entries go higher. Everything else sits at 32k–200k.

## Check tool support before you attach tools

Not every model can call tools. `mixtral-8x7b-32768` and OpenRouter's `o1` and `deepseek-r1` entries are marked as **not supporting tools**. Attaching tools to an agent on one of those means the tools silently never fire.

The model picker flags this, but it is the single most common "my tool does nothing" cause.

## Reasoning effort

Independent of provider, every agent has a **reasoning effort**: `none`, `low`, `medium`, `high`, or `xhigh`. It defaults to `medium`.

- `none` / `low` — fast and cheap, fine for lookups and greetings
- `medium` — the default; a reasonable balance
- `high` / `xhigh` — slower and dearer, worth it for multi-step reasoning

Raise it when the agent needs to think, not when you want better prose.

## Bringing your own key

Agents can use your own provider credentials instead of the platform default. Add keys under **Settings → Provider keys**, then point an agent at one. Falls back to the platform key when none is selected — see the BYOK notes in your deployment docs.
