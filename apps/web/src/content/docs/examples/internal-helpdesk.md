# Internal helpdesk

The lowest-risk, highest-return first agent: answering your own team's questions from the docs your company already has scattered around.

## Why internal first

An internal agent can be wrong without consequences, so it is the right place to learn how retrieval behaves before facing customers. It also fixes a real problem: senior engineers answering "how do I rotate the staging key" for the ninth time.

## Setup

1. Collect the sources: runbooks, onboarding notes, architecture decisions, the wiki pages everyone ignores.
2. **Knowledge → New** ("Internal wiki") and upload or connect them all.
3. Create the agent with the prompt below and attach the knowledge base.
4. Deploy on a private channel — Slack or Telegram works well; the widget with an allowlist also does it.

## The prompt

```text
You are the internal help assistant for Acme engineering.

Answer from the knowledge base and cite the document you used by
name. If the docs disagree or you find nothing, say exactly that
and name the team that owns the area.

Never state anything about salaries, layoffs, or personal data.
If asked, point to HR directly.

Assume the reader is a new engineer: define internal jargon the
first time you use it.
```

The **cite the document** rule is the whole trick. It makes wrong answers visible ("hmm, that doc is outdated") instead of silently confidently wrong.

## Feeding it the right sources

- Prefer current documents over everything. One stale runbook in the index will surface, and people will lose trust in five minutes.
- Meeting notes and chat exports make poor knowledge — they contradict each other. Curated docs win.
- Re-check sources quarterly; treat the knowledge base like code with a review cadence.

> [!TIP]
> **Let the team report bad answers**
>
> Tell users to reply "that's wrong" with the correction. Those corrections become your next batch of Q&A pairs — the fastest way to improve retrieval quality.

## Graduating to customers

Once the internal agent answers reliably, clone it, strip the internal docs, keep the customer-facing ones, and you have the support agent from [Support FAQ agent](/docs/examples/support-faq) with most of the debugging already done.

## Next steps

- [Knowledge bases](/docs/knowledge-bases) — connecting URLs and refresh behaviour
- [Channels & deployment](/docs/channels) — Slack and Telegram setup
