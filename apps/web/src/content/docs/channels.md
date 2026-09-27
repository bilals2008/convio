# Channels and deployment

How to publish an agent to your website, WhatsApp, Slack, Telegram, Discord, or SMS.

A **deployment** is a published version of an agent on a channel. Editing the agent does not change what is already deployed — deploy when you are ready, not when you save.

## Deploy to the web widget

1. **Widgets → New**, pick the agent, name it, and configure the look.
2. **Set the domain allowlist** before you publish. `allowedDomains` restricts which sites may load the widget. Leave it empty and the widget loads anywhere.

> [!WARNING]
> **Set the allowlist before you publish**
>
> `allowedDomains` is empty by default, so a public key loads anywhere. Anyone who finds it can put your agent on their site and run up your bill.

3. **Embed the snippet** in your site. The public key is public by design — it is not a secret and does not need to be.
4. Widgets start as **draft** and render nothing. A widget can be draft while its agent is active; that is the normal state before you publish.

## Deploy to a messaging channel

Beyond the widget, agents can be published to messaging and telephony surfaces. Convio ships integrations for:

- **WhatsApp** (via Kapso)
- **Slack**
- **Telegram**
- **Discord**
- **Twilio**: SMS and voice

Each is a deployment with its own credentials and configuration. The agent, prompt, knowledge, and tools are shared — you are publishing the same brain to a different surface, not rebuilding it.

![The deployment list, showing one agent published to several channels at once](https://placehold.co/1280x720)

## The release checklist

1. The agent is `active`, see [agent statuses](/docs/agents#set-the-status)
2. Create the deployment for the channel
3. Complete the channel's own credentials and settings
4. Send a real message through the real surface and confirm the answer
5. Only then tell anyone about it

Step 4 is the one people skip. Credentials can be wrong, a number can be unlinked, a channel can reject the format, and the deployment will still report as fine.

## Unpublish

Setting a deployment to inactive stops it accepting new conversations on that channel. Other channels keep working, and the deployment can be resumed.

The agent's own status does this for every channel at once, which is the right lever during an incident.
