# Testing in the playground

The playground is where agents get fixed. It runs the real agent with the real prompt, model, knowledge base, and tools — and it does not touch production analytics.

## Opening it

Every agent has a playground. From the agent page, open it and start typing.

There is a **Test Settings** panel, and a set of one-click prompts for the two things most likely to be broken: the knowledge base, and the tools. Use them before you write your own question — they are the fastest way to confirm the plumbing works.

## Reading the result

The reply streams in, so you see tokens as they arrive. That is useful for one specific thing: **if the first token takes noticeably long, the model or the reasoning effort is the cause**, not your prompt.

## What to test

Not "does it work" — it will. Test the boundaries:

1. **A question it should answer** — from your own scope
2. **A question it should refuse** — one you named as off-limits
3. **A question it cannot know** — the "does it guess?" test
4. **A tool call** — verify the tool fires and the result comes back
5. **A knowledge question** — ask something only in your documents

Number three is the one that catches most real problems. Ask about a policy you never wrote down. If the agent invents an answer, your prompt is missing an explicit "if you do not know, say so" line.

## Changing settings while testing

Model, temperature, reasoning effort, and the prompt are all editable from the playground, so you can compare a change against the same question without leaving the page.

Change one thing at a time. If you alter the prompt and the temperature together and the answer improves, you have learned nothing about which one did it.

## Before you go live

- The scope refusals work
- It does not guess
- Tools fire, if you attached any
- Knowledge retrieval returns the right documents
- **Status is set to `active`** — draft agents do not accept conversations

## Cost and analytics

Playground runs are not user conversations. They are the fastest way to burn tokens while iterating, so keep the model in mind — a `high` reasoning effort across fifty test runs adds up.

They do not pollute your analytics, so your volume and cost figures stay honest.
