# Agent statuses

Every agent is in exactly one of three states, and the state decides whether it accepts conversations.

## The three states

| Status | Behaviour | Use it for |
|---|---|---|
| **Draft** | Does not accept conversations | Work in progress. The default for new agents. |
| **Active** | Accepts conversations | Live. |
| **Inactive** | Accepts nothing, keeps everything | Paused. Not deleted. |

## Draft is the default, on purpose

A new agent starts as `draft` and stays there until you change it. Nothing goes live by accident, and a half-written prompt never reaches a user.

This catches people out. An agent that works perfectly in the playground will return nothing in production until the status is switched — the playground ignores status, production does not.

## Inactive is the pause button

Switching to `inactive` stops new conversations immediately while keeping the agent's configuration, its knowledge base attachment, its tools, and its full history.

Use it when:

- The agent is producing bad answers and you need it off before you fix the prompt
- A provider key expired or a model is down
- You are over budget and need cost to stop accruing
- The season is over and the campaign agent is done

The difference from deleting: an inactive agent can be reactivated in one click with nothing lost. Deleting is not reversible.

## Changing status

Set it in the agent's **Settings → Agent Status**. Each option states its own effect before you pick it, so the choice is visible rather than implied.

Status changes take effect immediately. There is no deploy step and no propagation delay.

## Status versus deployment

These are separate, and confusing them costs an afternoon.

- **Status** is whether the agent *accepts* conversations at all.
- A **deployment** is a published version of an agent on a specific channel.

An active agent with no deployment is reachable through the API and anything else wired to it directly, but has no published web presence. If your agent seems live but nothing answers on your site, the status is not the problem — the deployment or the widget embed is.

## A safe release

The order that avoids surprises:

1. Build and test in the playground
2. Set status to `active`
3. Deploy to the channel and confirm the widget answers
4. If it misbehaves, set `inactive` immediately — no rollback needed
