# WhatsApp order status

A retail staple: customers message "where is my order?" on WhatsApp and get an instant, correct answer without anyone touching the phone.

## Why WhatsApp

In markets where WhatsApp is the default support channel, an email-only web widget leaves your customers somewhere you are not listening. The WhatsApp channel connects a number to an agent exactly like the widget connects a page.

## Setup

1. **Channels → New → WhatsApp** and connect your business number.
2. Create an agent ("Order Desk") with the prompt below.
3. Attach a knowledge base with shipping timelines, return policy, and service-area rules.
4. For real order lookups, expose an API tool to the agent (see below).
5. Deploy, then message it from your own phone — the playground cannot test channel formatting.

## The prompt

```text
You are the order-status assistant for Acme Store on WhatsApp.

Be brief: this is a phone chat, not an email. Two or three short
sentences max unless asked for more.

If the customer gives an order number, use the lookup_order tool
and report what it returns. If the tool fails or the number looks
wrong, ask them to re-check it in their confirmation message.

Without an order number, answer only from the knowledge base
(shipping times, carriers, returns). Never guess a delivery date.
```

## Real lookups with a tool

Static knowledge covers "how long does shipping take" but not "where is order 4821". Give the agent a `lookup_order` tool pointing at your orders API — it returns status, carrier, and ETA, and the agent turns that JSON into a human sentence.

> [!WARNING]
> **Keep the tool read-only**
>
> An agent on a public messaging channel should never be able to change anything. Look up, never refund, never reship. Anything that mutates state stays behind a human.

## WhatsApp-specific polish

- No markdown tables — they do not render. Use plain lines.
- Long messages get truncated in previews; front-load the answer.
- Order numbers are easy to mistype; have the agent echo what it received before looking it up.

## Testing checklist

- Valid order number → correct status, no invented ETA.
- Garbage order number → asks to re-check, does not hallucinate a shipment.
- "I want to return" → answers from the policy doc, not the order tool.

## Next steps

- [Channels & deployment](/docs/channels) — WhatsApp connection details
- [Knowledge bases](/docs/knowledge-bases) — grounding the policy answers
