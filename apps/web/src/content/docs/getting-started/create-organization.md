# Creating an organization

An organization is the workspace boundary. Agents, knowledge bases, provider keys, and billing all live inside one, and members only ever see the organizations they belong to.

## Why it exists

Without a workspace boundary, every agent and every document belongs to whoever created it. The moment a second person joins, you need isolation — for access control, for billing, and for audit logs that mean something.

## Creating one

Choose **New organization** from the org switcher. Give it a name and a slug. The slug becomes part of your public URLs, so pick something you can live with — changing it later breaks existing links.

## Inviting your team

Add teammates from **Settings → Team members**. Invitations are scoped to the organization, so a new member sees only this workspace until you invite them elsewhere.

## Roles

Every member has a role, and the role decides what they can touch:

- **Owner** — billing, ownership transfer, and deletion. One per organization.
- **Admin** — everything except billing and ownership transfer.
- **Member** — create and edit agents, knowledge bases, and widgets.
- **Viewer** — read-only. Useful for stakeholders who need to audit conversations without changing anything.

## Ownership

Owners can transfer ownership from organization settings. The transfer is immediate and cannot be undone by the previous owner, so confirm the new owner can actually administer billing before you hand it over.
