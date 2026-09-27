# Data management

How to see what Convio stores about your organization, export it, and delete it.

> [!WARNING]
> **Deleted data cannot be recovered**
>
> Every delete on this page is permanent. Export first if there is any chance you will want it back.

## See what is stored

**Settings → Data Management** opens with a workspace summary: total items, estimated storage, and the last time anything changed.

Below it, the categories:

| Category | What is in it | Also deleted with it |
|---|---|---|
| **Agents** | Agent configs, deployments, analytics | Their conversations, deployments, and analytics |
| **Conversations** | Chat threads and messages across agents | — |
| **Knowledge Bases** | Bases, documents, embeddings | Nothing — but attached agents lose their knowledge source |
| **Documents** | Uploaded docs and vector embeddings | — |
| **Integrations** | Channel deployments (WhatsApp, Slack, etc.) | — |
| **Provider Keys** | Your BYOK API keys | — |
| **Analytics** | Analytics data and performance metrics | — |

Click a category to browse its items — searchable, status-filterable, paginated.

"Also deleted with it" means exactly that: delete **Agents** and their conversations, deployments, and analytics go with them. You do not delete them one by one — the delete follows the dependency.

## Export

The **Export Data** card exports CSV files: **Agents**, **Conversations**, **Analytics**, **Knowledge Bases**, **Deployments**, or **All** (one file per category, combined).

Export before cancelling. See [Billing and usage](/docs/billing) — cancelling a subscription keeps the data, cancelling an organization does not.

## Delete one category

1. Click the trash icon on a category.
2. The confirmation shows how many items will be deleted and what gets deleted along with them.
3. Click **Delete {Category}** to confirm.

> [!CAUTION]
> **Deleting Agents takes everything they touched**
>
> Delete **Agents** and their conversations, deployments, and analytics are deleted with them. Delete **Knowledge Bases** and the agents still work — they just have nothing to retrieve from. Detach the base from those agents first if you want to keep it.

## Delete everything

The **Danger Zone** at the bottom deletes the entire workspace:

1. Click **Delete Entire Workspace**.
2. Type `DELETE` to confirm.
3. Every category is wiped.

This is owner-only and permanent. If you only want to stop paying, cancel the subscription instead — the data stays.
