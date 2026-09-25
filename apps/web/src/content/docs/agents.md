# AI agents

An agent is the brain behind a conversation. It holds everything needed to answer: which model, what instructions, what it may do, and what it may know.

## Agent, model, bot

These get used interchangeably. They are not the same thing.

A **model** is the engine — GPT-4o, Claude, Gemini, Llama. It knows how to produce text and nothing about your business. No memory of your users, no access to your documents, no idea it is a support agent.

An **agent** is your configuration of that model. It pins the model, adds your system prompt, optionally attaches a knowledge base, and grants specific tools. The model is interchangeable; the agent is the thing you own.

A **bot** is what a visitor perceives. In Convio a bot is a *deployment* of an agent on a channel, not a separate object.

## What an agent is made of

| Part | Purpose |
|---|---|
| **Model** | The engine. Defaults to `gpt-4o-mini`. |
| **System prompt** | The instructions. The highest-leverage field you own. |
| **Temperature** | Randomness, `0`–`2`. Defaults to `0.7`. |
| **Max tokens** | Optional cap on response length. |
| **Reasoning effort** | `none`, `low`, `medium`, `high`, `xhigh`. Defaults to `medium`. |
| **Knowledge base** | Optional. Grounds answers in your documents. |
| **Tools & MCP servers** | Optional. Actions the agent may take. |
| **Provider key** | Optional. Which credentials this agent uses. |
| **Guardrails** | Optional. Blocked words and restricted topics. |
| **Status** | `draft`, `active`, or `inactive`. New agents start as `draft`. |

## Creating one

From **Agents → New** for a blank start, or **Agents → Templates** for a pre-filled one. The eleven templates: **sales**, **faq**, **onboarding**, **interviewer**, **tutor**, **translator**, **recruiter**, **researcher**, **writer**, **coach**, and **custom**.

A template creates a real agent with a system prompt and a suggested temperature already filled in. Everything is editable afterwards, and nothing links back to the template — once created, it is yours.

The editor has five sections: **Overview**, **Builder** (prompt, model, behavior), **Knowledge**, **Capabilities** (tools and MCP), and **Analytics**.

The one thing to do immediately: set the **status**. Draft agents do not accept conversations.

## Choosing a model

| Provider | Models |
|---|---|
| **OpenAI** | `gpt-4o`, `gpt-4o-mini` (default) |
| **Anthropic** | `claude-3-5-sonnet`, `claude-3-haiku` |
| **Google** | Gemini 3.6 / 3.5 Flash, Flash-Lite, 3.1 Pro, 3 Flash, 2.5 Flash, 2.5 Pro — 65k context |
| **Groq** | `llama-3.1-70b-versatile` (128k, tools), `mixtral-8x7b-32768` (32k, **no tools**) |
| **OpenRouter** | The widest catalogue — GPT, Claude, Gemini, Llama, Mistral, DeepSeek, Qwen under one key |
| **OpenCode** | Free: DeepSeek V4 Flash, Mimo 2.5, Nemotron 3 Ultra, North Mini Code, Laguna S 2.1 |
| **OpenAI-compatible** | Mistral, Together, DeepSeek, Perplexity, Agnes AI |

**Just shipping** — `gpt-4o-mini`. Cheap, fast, good enough for most support and FAQ traffic.

**Quality over cost** — `gpt-4o` or Claude 3.5 Sonnet. Both handle long, multi-step instructions noticeably better.

**Latency and cost are the constraint** — Groq's `llama-3.1-70b-versatile`, or a free OpenCode model.

**One key, many models** — OpenRouter, the only provider exposing other vendors' models under your credentials.

**Very long documents** — Gemini Pro and Flash carry 65k; OpenRouter's Gemini entries go higher. Everything else sits at 32k–200k.

**Reasoning effort** is a latency and cost dial, not a prose dial. `none`/`low` for lookups and greetings, `medium` as the default, `high`/`xhigh` for multi-step reasoning and tool orchestration. Raising it everywhere is an easy way to make a fast product slow.

Switching models never touches the prompt, knowledge base, or tools. Analytics are tracked per agent, so history stays continuous.

## Configuration

**Temperature** — `0`–`0.3` is deterministic, right for classification and extraction. `0.4`–`0.8` is the normal conversation band, which is where the default `0.7` sits. `0.9`+ is visibly loose; avoid it for anything a human reads on your behalf, because the same question can get two answers.

**Max tokens** — leave empty and the model decides. Set it when you need a hard ceiling.

**Guardrails** — blocked words and restricted topics, applied on top of the prompt. A cheap hard stop for compliance floors, not a substitute for a good prompt.

There is no top-p and there are no stop sequences in Convio. Express sampling constraints in the prompt instead — it is more predictable anyway.

## Tools and capabilities

A tool is something the agent may *do*, not just say. Without tools an agent only answers from its prompt and knowledge base. With them it can look things up, call your APIs, and take actions.

Attach tools on the agent's **Capabilities** section. The same tool can serve several agents; an attached tool costs nothing until it fires.

**MCP servers** expose tools over an open standard, so an agent can reach systems nobody wrote an integration for. They are organization-scoped, so one connection serves every agent that uses it. **Composio toolkits** provide ready-made third-party integrations.

### The tool-call loop

When a question needs a tool, the model does not answer. It emits a tool call, Convio executes it, and the result returns as a new message. The model then answers using that result.

So a **failed call is a failed answer** — the model receives the error and tells the user it could not complete the request. Check the tool before rewriting the prompt.

### Why a tool never fires

**The model does not support tools.** `mixtral-8x7b-32768` and OpenRouter's `o1` and `deepseek-r1` cannot call tools. An agent with tools on one of those looks correctly configured and does nothing. Check this first.

Second most common: the system prompt never mentions the capability, so the agent answers from training data instead of reaching for the tool.

## Welcome messages

A short message shown when the conversation opens, before the visitor has typed anything. It is optional, and the cheapest conversion improvement available.

A good one names what the agent does, sets scope, and invites a concrete first message:

> Hi — I'm Acme's support assistant. I can help with invoices, refunds, plan changes, and failed payments. What do you need?

Compare with "Hi! 👋 How can I assist?" — nothing about scope, nothing about what is possible. The visitor has to guess, and most close the tab.

Keep it to about three lines. Longer and it pushes the input out of view on mobile, which is most widget traffic. Set it on the agent, not the widget, so every channel greets people the same way.

## Testing in the playground

The playground runs the real agent with the real prompt, model, knowledge, and tools, without touching production analytics. It streams, so you see tokens as they arrive — useful because a slow first token points at the model or reasoning effort, not your prompt.

There is a **Test Settings** panel and one-click prompts for the two things most likely to be broken: the knowledge base, and the tools. Run those before writing your own question.

Test the boundaries, not "does it work":

1. A question it should answer
2. A question it should refuse
3. **A question it cannot know** — the "does it guess?" test
4. A tool call
5. A knowledge question only your documents can answer

Number three catches the most problems. Ask about a policy you never wrote down — if the agent invents an answer, your prompt is missing an explicit "if you do not know, say so" line.

Change one thing at a time. Prompt and temperature together teach you nothing.

Playground runs do not pollute analytics, but they do spend tokens. A `high` reasoning effort across fifty test runs adds up.

## Statuses

| Status | Behaviour |
|---|---|
| **Draft** | Does not accept conversations. The default. |
| **Active** | Accepts conversations. |
| **Inactive** | Accepts nothing, keeps everything. |

Draft is the default on purpose, so a half-written prompt never reaches a user. The trap: an agent that works perfectly in the playground returns nothing in production until you switch it to `active`.

**Inactive is the pause button.** It stops new conversations immediately while keeping the config, knowledge attachment, tools, and history. Use it for bad answers, an expired provider key, a down model, or a finished campaign. One click to resume; deleting is not reversible.

Status is not the same as a **deployment**. Status decides whether the agent accepts conversations at all; a deployment is a published version on a specific channel. An active agent with no deployment has no published web presence — if your agent seems live but the site is silent, look at the deployment and the widget embed, not the status.

Safe release order: build and test in the playground, set `active`, deploy and confirm, and if it misbehaves set `inactive` — no rollback needed.
