# Getting started

Your first agent, live on a channel, in one sitting.

## The five steps

1. **Create an account.** Go to the home page and choose **Get Started**. Register with an email address and password, or continue with Google. No card, no trial countdown.
2. **Create an organization.** Choose **New organization** from the org switcher, give it a name and a slug. The slug becomes part of your public URLs, so pick something you can live with — changing it later breaks existing embeds and shared links.
3. **Create an agent.** **Agents → New**, name it, pick a model, write a system prompt. Everything else can come later.
4. **Test in the playground.** Ask real questions, read the answers, fix the prompt. New agents start as `draft` and do not accept conversations; the playground ignores status, production does not.
5. **Deploy.** Set the status to `active`, deploy to a channel, and send a real message through the real surface.

## Verify your email

We send a verification link to your address. The link expires — request a new one from the login screen if it lapses. If the email never arrives, check spam and confirm your sending domain is verified.

> [!NOTE]
> **Verification unlocks the workspace**
>
> Until you verify, some settings stay read-only and outbound channels cannot be enabled.

To come back, use the same credentials, or Google if you registered that way. Password resets are self-serve from the login screen.

## The dashboard

| Area | What it shows |
|---|---|
| **Sidebar** | Scoped to the current organization, with the org switcher at the top. |
| **Quick stats** | Conversations, message volume, active agents, and token spend for the period. Spend is the one to watch. |
| **Agents** | Every agent with its status, model, and last activity. Click one to edit its prompt or open the playground. |
| **Conversations** | Every message an agent has sent or received, across all channels, filterable by agent. This is where you debug a bad answer: find the conversation, read the transcript, fix the prompt. |
| **Knowledge** | Your document collections and what is indexed in them. |
| **Settings** | Organization, team members, provider keys, billing, and audit logs. |

![The Convio dashboard, with the organization switcher at the top of the sidebar and quick stats for conversations, agents, and token spend](https://placehold.co/1280x720)

## Inviting your team

Add teammates from **Settings → Team members**. Invitations are scoped to a single organization.

Four roles, in descending authority:

| Role | What they can do |
|---|---|
| **Owner** | Billing, ownership transfer, org deletion, data wipe. Exactly one per organization. |
| **Admin** | Everything except billing and ownership transfer. Invites and removes members, manages content and provider keys, reads audit logs. |
| **Member** | Creates and edits agents, knowledge, widgets, and deployments. Tests in the playground. |
| **Viewer** | Read-only. For stakeholders who need to audit without changing anything. |

Two permissions break the pattern and are worth knowing: **only an owner can change roles**, and **only an owner can delete the organization or wipe its data**. Everything is enforced server-side on every org-scoped API call, so a stale or hand-crafted request cannot escalate.

Removing a member revokes their access immediately, but what they built stays. Removal is an access decision, not a content decision.

## Ownership

The owner controls the three irreversible things: deleting the organization, wiping its data, and transferring ownership. Transfer via **Settings → Organization**; the previous owner is demoted to admin, not removed.

> [!WARNING]
> **Transfer ownership before the owner leaves**
>
> A transfer needs the current owner's session. Once they are gone the organization is stuck — nobody can delete it or wipe its data. This is the most common way organizations get stranded.

## Leaving an organization

Members and admins can remove themselves from the team list. Owners cannot — they have to [transfer ownership](#ownership) first.

## Your account security

**Settings → Profile** shows your recent sign-in sessions: device, approximate location, IP address, time, and status. Treat location as a hint, VPNs and carriers make it imprecise; the IP and device are reliable.

You can sign out of this device only, or end every active session across all devices. Signing out everywhere also revokes all refresh tokens. It does not change your password, so change that too if you suspect the password leaked.

Sign-in activity is about your account. The **Settings → Audit log** page is about the organization: who created, updated, deleted, invited, removed, changed roles on, configured, or disabled things. Admins and owners only.

## Glossary

| Term | Meaning |
|---|---|
| **Organization** | The workspace boundary. Owns agents, knowledge, widgets, keys, members, and billing. |
| **Deployment** | A published version of an agent on a channel. Editing the agent does not change what is deployed until you redeploy. |
| **Widget** | The embeddable web chat client you drop into your site. |
| **Knowledge base** | Documents an agent can retrieve from, so answers are grounded in your content. |
| **Tool** | A capability an agent may call: a search, an API call, a Composio integration, or a connected MCP server. |
| **MCP** | Model Context Protocol, an open standard for exposing tools and data to a model. |
| **Conversation** | One thread of messages between a user and an agent, on one channel. |
