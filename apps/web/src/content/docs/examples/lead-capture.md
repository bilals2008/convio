# Lead capture agent

An agent whose whole job is to qualify a visitor and hand a warm lead to your sales inbox — name, company, budget signal, and what they actually need.

## The shape of it

Lead capture is a **guided conversation**, not an FAQ. The agent should ask one question at a time, never lecture, and always know what it still needs. That makes the system prompt more important than the knowledge base.

## Setup

1. **Agents → New**, name it "Intake".
2. Attach a small knowledge base with your pricing tiers and qualification criteria, so the agent can answer "how much do you charge?" without derailing.
3. Use the prompt below.
4. Deploy on the widget, on the pricing page specifically — that is where visitors self-select.

## The prompt

```text
You are qualifying inbound leads for Acme, a B2B scheduling tool.

Your goal: collect (1) what the visitor needs, (2) team size,
(3) timeline. Ask exactly one question per message.

Once you have all three, write a short summary and say a human
will follow up at the email they provided.

Do not pitch. Do not answer questions outside the knowledge base.
If the visitor is clearly just browsing, say thanks and stop asking.
```

"One question per message" is the line that matters. Without it, models ask all three at once and visitors answer none.

## Making it feel human

- **React before you ask.** "Sounds like you are rolling out to a bigger team — how many seats are we talking?" beats a bare form question.
- **Let it quit.** The "clearly just browsing" rule prevents the interrogator vibe that kills conversion.
- **Cap the conversation.** Two unanswered questions and the agent should wrap up politely.

> [!NOTE]
> **Where the leads go**
>
> Convio's channels deliver the conversation; the summary the agent writes at the end is what your team reads. Check the conversation transcript in the dashboard, or forward it via the webhook on the channel.

## Testing checklist

- Give it a vague first message ("hey, what do you guys do?") — it should answer from the knowledge base, then steer back to qualifying.
- Refuse to answer one question — it should move on, not repeat itself.
- Say "I am just looking" — it should stop.

## Next steps

- [Channels & deployment](/docs/channels) — widget placement and webhooks
- [AI agents](/docs/agents) — model choice and temperature
