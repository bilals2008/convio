# Writing system prompts

The system prompt is the highest-leverage field you own. The model is rented; this is yours. Everything the agent knows about your business that is not in a knowledge base has to be here.

## The shape that works

Four parts, in this order.

**1. Role**: who the agent is, in one line.

**2. Scope**: what it handles, and explicitly what it does not.

**3. Rules**: the constraints that must always hold.

**4. Style**: tone, length, formatting.

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

**Say what not to do.** A scope line naming the off-limits topics prevents more bad conversations than any tone instruction.

**Forbid the guess.** "If you do not know, say so" is the highest-value line in most prompts. Without it, models invent plausible policy.

> [!IMPORTANT]
> **One line does more work than the rest of the prompt**
>
> "If you do not know, say so and hand off. Never guess at a policy." It is the difference between an agent that admits the gap and one that invents a refund window that does not exist.

**Make it checkable.** "Never quote a refund amount without confirming the invoice ID" is verifiable. "Be helpful" is not. Drop it.

**Keep it short.** Long prompts cost tokens on every request and dilute the instructions that matter. If a rule matters, put it near the top.

## Common mistakes

**Role-play with no substance.** A charming persona that never says what to do produces charming refusals.

**Rules buried at the bottom.** Models weight early instructions more heavily.

**Contradicting rules.** "Always be brief" plus "always give full detail" resolves arbitrarily.

**Your knowledge base pasted into the prompt.** If it changes weekly it belongs in a [knowledge base](/docs/knowledge-bases), not here.

## A worked example

A FAQ agent for a hardware store, cut down to what matters:

```text
You are a support assistant for Northwind Hardware.

You handle: orders, shipping status, returns, warranties, and product specs.
You do not handle: refunds over $500, bulk pricing, or complaints about a
delivery driver. Escalate those to the support team.

Rules:
- Always confirm the order number before discussing an order.
- Never promise a delivery date. Give the carrier's estimate only.
- If a product is not in our catalog, say we do not carry it. Do not
  substitute a similar product.
- If you do not know, say so and hand off. Never invent a policy.

Style: 3 sentences maximum. Prices in USD. No exclamation marks.
```

Note what is absent: "You are a helpful and friendly assistant." It adds nothing the rules do not already imply, and it dilutes them.

## Iterating

Write one prompt, then test it against real questions in the [playground](/docs/agents#testing-in-the-playground). The failures tell you which rule to add, almost always a scope line or a "don't guess" line, almost never a tone change.

The test that finds the most problems: ask about a policy you never wrote down. If the agent answers with confidence, you have found your next rule.
