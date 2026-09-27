# Tools, MCP & Composio

How to give your agents capabilities beyond answering from their prompt.

## The three ways to add a capability

1. **Built-in tools** — web search, calculator, URL fetcher, date & time. Toggle on per agent.
2. **MCP servers** — connect external tool servers (Notion, GitHub, Linear, Slack, or any custom server).
3. **Composio** — ready-made integrations for hundreds of apps under one API key.

All three are attached on the agent's **Capabilities** section. An attached tool costs nothing until it fires.

## Built-in tools

On the agent's **Capabilities** section, toggle what the agent can use:

| Tool | What it does |
|---|---|
| **Web Search** | Search the internet for current information |
| **Calculator** | Evaluate mathematical expressions |
| **URL Fetcher** | Fetch and read webpage content |
| **Date & Time** | Get the current date and time |

> [!NOTE]
> **Tools are a Pro feature**
>
> On a free plan the toggles are disabled. Upgrade to enable them.

## Connect an MCP server

MCP servers expose tools over an open standard, so an agent can reach systems nobody wrote an integration for. They are organization-scoped: one connection serves every agent that uses it.

### Add a server

1. Go to **Settings → MCP Servers → Add Server**.
2. Fill in the dialog:

| Field | Required | Notes |
|---|---|---|
| **Name** | Yes | e.g. "My MCP Server" |
| **Type** | Yes | **Stdio (Local Command)** or **Streamable HTTP** |
| **Command** | Stdio only | e.g. `npx` |
| **Args** | Stdio only | Comma-separated, e.g. `-y, @modelcontextprotocol/server-github` |
| **URL** | HTTP only | e.g. `https://mcp.example.com` |
| **Authentication** | HTTP only | None, Header (Bearer / custom), or OAuth 2.0 |
| **API Key** | Header auth | Sent as a Bearer token |
| **Custom headers** | Header auth | One per line, `Name: value` |
| **Client ID / Secret** | OAuth only | From the provider's developer console |

3. Click **Save**.

> [!TIP]
> **Start from a template**
>
> The **Templates** tab has pre-filled configs for Notion, GitHub, Linear, and Slack. Click **Use this template** and the Add Server dialog opens pre-filled — just save.

### Test and authorize

On each server card:

- **Test connection** — pings the server. Shows "Connected · N tools" or the error.
- **Connect with OAuth** — OAuth servers only. Redirects to the provider to authorize, then returns to Convio.
- **Enabled** — toggle the server on or off for the whole organization.

> [!NOTE]
> **OAuth without credentials**
>
> Notion, Linear, and Slack support dynamic registration — leave Client ID and Secret blank. For others (GitHub Copilot and similar), create an OAuth app at the provider's developer console and paste the credentials.

### Attach to an agent

On the agent's **Capabilities** section, toggle the servers this agent can use. One server can serve several agents.

## Connect Composio

Composio gives your agents ready-made actions for hundreds of apps — Gmail, Slack, Google Sheets, Trello, and more — under one API key.

### 1. Add your API key

1. Go to **Settings → Composio**.
2. Enter your Composio API key (from [app.composio.dev](https://app.composio.dev)).
3. Click **Save & Verify** — the key is validated before it is stored.

### 2. Enable toolkits

1. In the **App Catalog**, search or filter by category (Productivity, Developer Tools, Communication, CRM & Sales, Finance, Cloud).
2. Toggle the apps you want.
3. Click **Save**.

### 3. Connect the app

1. Click **Connect** on an enabled app.
2. Composio's hosted OAuth page opens — authorize the app.
3. You return to Convio with a **Connected** badge on the card.

> [!NOTE]
> **Connect once, reuse everywhere**
>
> The connection is organization-wide. Every agent you attach the toolkit to reuses the same authorization — you never connect the same app twice.

### 4. Attach to an agent

On the agent's **Capabilities** section, toggle the connected toolkits this agent can use.

> [!NOTE]
> **Composio is a Pro feature**
>
> Free plans cannot connect apps. Upgrade to enable Composio.

## When a tool fails

A failed tool call is a failed answer — the model receives the error and tells the user it could not complete the request. Check the tool before rewriting the prompt:

1. **Test the connection** — on the MCP server card, or check the Composio connection badge.
2. **Check the model supports tools** — `mixtral-8x7b-32768` and OpenRouter's `o1` and `deepseek-r1` cannot call tools. The agent saves, the test passes, and the tool never fires.
3. **Check the prompt mentions the capability** — if the system prompt never mentions the tool, the agent answers from training data instead of reaching for it.
