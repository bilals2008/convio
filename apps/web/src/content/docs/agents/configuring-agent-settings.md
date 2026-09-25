# Configuring agent settings

Everything below lives in the agent's **Settings** section. All of it is changeable after creation — nothing here is permanent.

## Status

The one setting that decides whether the agent is live at all.

| Status | Meaning |
|---|---|
| **Draft** | Still in development. Does not accept conversations. This is the default. |
| **Active** | Accepts conversations. |
| **Inactive** | Paused. Keeps its config and history, accepts nothing. |

`inactive` is the one to reach for when something is wrong in production. It stops new conversations immediately without deleting anything.

## Temperature

How random the output is, from `0` to `2`. Defaults to `0.7`.

- **`0`–`0.3`** — deterministic. Classification, extraction, routing, anything where you parse the result.
- **`0.4`–`0.8`** — the normal band for conversation. The default sits here on purpose.
- **`0.9`–`2`** — visibly loose. Creative writing, brainstorming. Avoid for anything a human reads on your behalf, because the same question can get two different answers.

Templates suggest a temperature. The FAQ and Sales templates lean lower because their answers should be consistent.

## Max tokens

Optional. Leave it empty and the model decides. Set it when you need a hard ceiling — a chat reply that must stay under a widget's height, or a budget you cannot exceed.

## Reasoning effort

`none`, `low`, `medium`, `high`, or `xhigh`. Defaults to `medium`.

This is a latency and cost dial, not a quality dial in the way people expect. It controls how much the model deliberates before answering.

- Lookups, greetings, routing → `none` or `low`
- Normal conversation → `medium`
- Multi-step reasoning, calculations, tool orchestration → `high` or `xhigh`

Raising it on every agent is an easy way to make a fast product slow.

## Model

The engine, changeable at any time. Switching models does not touch the prompt, the knowledge base, or the tools — the same agent runs on a different model immediately. Analytics split by agent, not by model, so history stays continuous.

## Guardrails

Two lists, applied on top of the prompt:

- **Blocked words** — messages containing these are refused
- **Restricted topics** — subjects the agent will not engage with

Guardrails are a cheap hard stop, not a substitute for a good prompt. They catch the obvious cases; they do not catch a determined workaround. Use them for compliance floors, and use the [system prompt](/docs/agents/writing-system-prompts) for everything else.

## Provider key

Which model credentials this agent uses. Leave empty to use the platform default. See [Choosing a model](/docs/agents/choosing-a-model).

## What is not configurable here

There is no top-p and there are no stop sequences. Convio does not expose them. If you need tighter sampling control, express the constraint in the prompt instead — it is more predictable anyway.
