# Channels and deployment

A **deployment** is a published version of an agent on a channel. Editing the agent does not change what is already deployed — the agent and the deployment are separate objects, and that separation is the point.

## Why the separation matters

It means you can change a prompt all afternoon without a single visitor seeing it. Deploy when you are ready, not when you save.

It also means the reverse: an agent can be `active` and still have no web presence, because a deployment was never created. If your agent "is live" but the site is silent, this — not the status — is the thing to check.

## Web widget

The widget is the embeddable chat client. Each one gets a **public key** and can be created per agent or shared.

From **Widgets → New**, pick the agent, name it, and configure the look. Then embed the snippet in your site. The key is public by design — it is not a secret and does not need to be.

### Domain allowlist

`allowedDomains` restricts which sites may load the widget. Leave it empty and the widget loads anywhere; list your domains and it refuses to load elsewhere.

Turn it on before you go live. A public key with no allowlist means anyone can embed your agent on their site, and you will pay for their traffic.

### Widget status

Widgets have their own status and also start as **draft**. A draft widget renders nothing. This is separate from the agent's status — a widget can be draft while its agent is active, and that is the normal state before you publish.

## Other channels

Beyond the widget, agents can be published to messaging and telephony surfaces. Convio ships integrations for:

- **WhatsApp** (via Kapso)
- **Slack**
- **Telegram**
- **Discord**
- **Twilio** — SMS and voice

Each is a deployment with its own credentials and configuration. The agent, prompt, knowledge, and tools are shared — you are publishing the same brain to a different surface, not rebuilding it.

## Deploying

1. The agent is `active` — see [agent statuses](/docs/agents#statuses)
2. Create the deployment for the channel
3. Complete the channel's own credentials and settings
4. Send a real message through the real surface and confirm the answer
5. Only then tell anyone about it

Step 4 is the one people skip. Credentials can be wrong, a number can be unlinked, a channel can reject the format — and the deployment will still report as fine.

## Unpublishing

Setting a deployment to inactive stops it accepting new conversations on that channel. Other channels keep working, and the deployment can be resumed.

The agent's own status does this for every channel at once, which is the right lever during an incident.
