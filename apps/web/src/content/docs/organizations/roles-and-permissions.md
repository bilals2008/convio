# Roles and permissions

Every member has one of four roles. The role decides what they can see and what they can change, and it is enforced on the server — hiding a button in the UI is not what keeps your data safe.

## The four roles

Roles are hierarchical. A higher role includes everything below it.

| Role | Rank | Use it for |
|---|---|---|
| **Owner** | 3 | The person who holds billing responsibility. Exactly one per organization. |
| **Admin** | 2 | Your technical team. Runs the workspace day to day. |
| **Member** | 1 | Anyone who builds — creating and editing agents, knowledge, and widgets. |
| **Viewer** | 0 | Stakeholders who need to read conversations and analytics, and change nothing. |

## What each role can do

**Viewer** can read the organization, its members, agents, knowledge bases, conversations, analytics, and billing. It cannot create or change anything.

**Member** adds creation rights on top of Viewer: create agents, create knowledge bases and documents, create deployments, test agents in the playground, and export data.

**Admin** adds full control of content: update and delete agents, knowledge, documents, widgets, and deployments. It can invite and remove members, manage provider keys and MCP servers, change org settings, read audit logs, and manage billing.

**Owner** adds the three things that cannot be delegated: deleting the organization, wiping all data, and changing who owns it.

## The permissions that stand out

A few permissions do not follow the "higher includes lower" pattern cleanly, so they are worth knowing:

- **`member.role.change` is owner-only.** An admin can invite and remove members, but cannot promote someone to admin or demote an owner. Only an owner changes roles.
- **`data.wipe` is owner-only.** Irreversible, and separated from ordinary deletion on purpose.
- **`audit-log.read` is admin and owner.** Viewers and members cannot read the audit trail.

## Enforcement

Every org-scoped API route checks the caller's membership before touching data. A request without a membership row is rejected with a 403, and a request whose role is below the required permission is rejected the same way — regardless of what the client sends.

Because the check is server-side, a stale or hand-crafted request cannot escalate. Hiding controls in the UI is for clarity; the API is the boundary.
