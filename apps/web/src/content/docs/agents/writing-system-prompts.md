# Writing system prompts

The system prompt is the highest-leverage field you own. The model is rented; this is yours.

## What it actually is

A system prompt is standing instructions that apply to every turn of every conversation that agent handles. It is not a greeting, not a persona name, and not a one-off — it is the frame the model reads before anything else.

Everything the agent knows about your business that is not in your knowledge base has to be here.

## The shape that works

Four parts, in this order:

1. **Role** — who the agent is, in one line
2. **Scope** — what it handles, and explicitly what it does not
3. **Rules** — the constraints that must always hold
4. **Style** — tone, length, formatting

```text
You are a support agent for Acme, a billing platform.

You handle: invoices, refunds, plan changes, failed payments.
You do not handle: technical outages, account deletion, or anything involving
a customer's bank details. Redirect those to the support team.

Rules:
- Never quote a refund amount without confirming the invoice ID first.
- If the customer is angry, acknowledge once, then move to the fix.
- If you do not know, say so and hand off. Never guess at a policy.

Style: plain sentences, no more than 4 sentences unless asked for detail.
```

## Rules that earn their place

**Say what not to do.** A scope line that names the off-limits topics prevents more bad conversations than any tone instruction.

**Forbid the guess.** "If you do not know, say so" is the single highest-value line in most prompts. Without it, models invent plausible policy.

**Make it checkable.** "Never quote a refund amount without confirming the invoice ID" is verifiable. "Be helpful" is not — drop it.

**Keep it short.** Long prompts cost tokens on every single request and dilute the instructions that matter. If a rule matters, put it near the top.

## Common mistakes

- **Role-play with no substance.** A charming persona that never says what to do produces charming refusals.
- **Rules buried at the bottom.** Models weight early instructions more heavily.
- **Contradicting rules.** "Always be brief" plus "always give full detail" resolves arbitrarily.
- **Encoding your knowledge base into the prompt.** If it changes weekly, it belongs in a [knowledge base](/docs/knowledge-base/uploading-documents), not here.

## Iterating

Write one prompt, then test it against real questions in the [playground](/docs/agents/testing-in-the-playground). The failures tell you which rule to add — almost always a scope or a "don't guess" line, not a tone change.
