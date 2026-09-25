# What is an AI agent?

An agent is the brain behind a conversation. It holds everything needed to answer: which model to use, what instructions to follow, what it is allowed to do, and what it is allowed to know.

## Agent, model, bot

These three get used interchangeably. They are not the same thing.

A **model** is the engine — GPT-4o, Claude, Gemini, Llama. It knows how to produce text and nothing about your business. A model has no memory of your users, no access to your documents, and no idea it is a support agent.

An **agent** is your configuration of that model. It pins the model, adds your system prompt, optionally attaches a knowledge base, and grants specific tools. The model is interchangeable; the agent is the thing you own.

A **bot** is what a visitor perceives — the thing they type into. In Convio a bot is a *deployment* of an agent on a channel, not a separate object. One agent, deployed to web, is one bot from the user's point of view.

## What an agent is made of

| Part | What it does |
|---|---|
| **Model** | The engine. Defaults to `gpt-4o-mini`. |
| **System prompt** | The instructions. The single highest-leverage field you own. |
| **Temperature** | Randomness. Defaults to `0.7`. |
| **Max tokens** | Optional cap on response length. |
| **Reasoning effort** | How hard the model thinks: `none`, `low`, `medium`, `high`, `xhigh`. Defaults to `medium`. |
| **Knowledge base** | Optional. Grounds answers in your documents. |
| **Tools** | Optional. Actions the agent may call. |
| **MCP servers** | Optional. External tool servers you connected. |
| **Provider key** | Optional. Which model credentials this agent uses. |
| **Guardrails** | Optional. Blocked words and restricted topics. |
| **Status** | `draft`, `active`, or `inactive`. New agents start as `draft`. |

## What an agent is not

An agent is not a workflow, and it does not remember previous sessions by default. Each conversation starts fresh apart from whatever the channel carries forward. If you need continuity across days, that belongs in your knowledge base or your own storage, not in the agent config.

## What it connects to

One agent can be reused across everything it owns:

- **Deployments** — published versions on a channel
- **Widgets** — embeddable web chat clients
- **Conversations** — every message it has sent or received
- **Analytics** — daily rollups of volume, cost, latency, and resolution
- **Broadcasts** — outbound messages

That is the point of the model. Change the prompt once, and every channel gets the change.
