# Organizations

An organization is the workspace boundary in Convio. Agents, knowledge bases, widgets, deployments, provider keys, and billing all belong to exactly one — and members only ever see the ones they belong to.

## What lives inside

Everything you build in Convio is org-scoped:

- **Agents** and their deployments
- **Knowledge bases** and the documents in them
- **Widgets** and their embed configuration
- **Tools** and connected MCP servers
- **Provider keys** — the model credentials this org uses
- **Conversations** and analytics
- **Billing**, plan limits, and audit logs

There is no cross-org sharing. If two teams need the same agent, you move or rebuild it — deliberately, so access never leaks by accident.

## Settings that matter

From **Settings → Organization** you can change the display name, the slug, and the logo.

The slug becomes part of your public URLs, so treat it as permanent. Changing it breaks existing embeds and shared links. Pick something short and readable before you ship a widget.

## Multiple organizations

You can belong to more than one, and you switch between them from the org switcher in the sidebar. Each switch changes the entire context — sidebar, data, and permissions all follow the active org.

This is the normal setup for agencies and consultants: one org per client, one login, clean separation.

## Deleting an organization

Deletion is permanent and takes everything with it — agents, documents, conversations, and audit history. Owners only. Convio asks for confirmation and then does it; there is no undo and no soft-delete window.

If you only want to stop paying for an org, cancel the subscription instead. The data stays.
