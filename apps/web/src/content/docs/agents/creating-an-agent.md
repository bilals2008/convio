# Creating an agent

There are two starting points: a template, or a blank agent. Both land you in the same editor.

## From a template

**Agents → Templates** shows every pre-built agent. Pick one and it creates a real agent in your organization, pre-filled with a system prompt and a suggested temperature that you can then edit.

The eleven templates:

| Template | For |
|---|---|
| **Sales** | Lead qualification and product Q&A |
| **FAQ** | Answering repetitive questions from a knowledge base |
| **Onboarding** | Walking new users through setup |
| **Interviewer** | Structured candidate screening |
| **Tutor** | Explanatory teaching and practice |
| **Translator** | Language conversion and phrasing |
| **Recruiter** | Sourcing and scheduling candidates |
| **Researcher** | Summarising and synthesising sources |
| **Writer** | Drafting and editing copy |
| **Coach** | Feedback against a standard |
| **Custom** | A minimal starting point |

Templates are starting points, not fixed configurations. Everything is editable afterwards, and nothing links back to the template — once created, it is yours.

## From scratch

**Agents → New** opens the create form. Four things matter:

1. **Name** — what your team calls it
2. **Model** — the engine
3. **System prompt** — the instructions
4. **Temperature** — randomness, `0` to `2`

Everything else — knowledge base, tools, guardrails, reasoning effort — can be added after the agent exists.

## The editor

Once created, an agent opens with five sections:

- **Overview** — the basics and status
- **Builder** — prompt, model, and behavior
- **Knowledge** — attach a knowledge base
- **Capabilities** — tools and MCP servers
- **Analytics** — volume, cost, and resolution

## The first thing to do

Set the **status**. New agents are created as `draft`, which does not accept conversations. Nothing is live until you switch it to `active` — see [Agent statuses](/docs/agents/agent-statuses).

Then test it before anyone else sees it: [Testing in the playground](/docs/agents/testing-in-the-playground).
