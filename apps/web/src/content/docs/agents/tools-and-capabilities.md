# Tools and capabilities

A tool is something the agent may *do* during a conversation, as opposed to something it may say. Tools are how an agent stops being a text generator and starts being useful.

## What a tool enables

Without tools, an agent can only answer from its prompt and its knowledge base. With tools it can look things up, call your APIs, do arithmetic against live data, and take actions.

Every tool has a cost and a risk. Attach the ones the job needs, not the ones that are available.

## Attaching tools

Tools live on the agent's **Capabilities** section. Open the agent, go to **Capabilities**, and add what the agent should be allowed to call.

An agent's tools are stored as a join, so the same tool can serve several agents and one agent can hold many. Attaching a tool to an agent that cannot use it costs you nothing until it fires.

## The tool-call loop

When a question needs a tool, the model does not answer directly. It emits a tool call, Convio executes it, and the result goes back into the conversation as a new message. The model then answers using that result.

Two things follow from that:

- **Tool calls are visible in the playground.** If you see a tool fire there, the wiring is correct.
- **A failed call is a failed answer.** If the tool errors, the model gets an error as its input and will usually tell the user it could not complete the request. Check the tool before you rewrite the prompt.

## MCP servers

MCP — Model Context Protocol — is an open standard for exposing tools and data to a model. Connect an MCP server and its tools become available to attach, the same way built-in tools are.

This is how an agent reaches systems nobody wrote an integration for. Manage servers under **MCP servers** in settings, then attach the ones the agent needs under **Capabilities**.

MCP servers are organization-scoped, so one connection serves every agent in the workspace that uses it.

## Composio toolkits

Composio provides ready-made integrations for third-party services, so you do not have to hand-write an API client for each one. The agent's **Capabilities** section includes Composio toolkits alongside native tools.

## The most common reason a tool never fires

**The model does not support tools.** Not every model can call them — `mixtral-8x7b-32768` and OpenRouter's `o1` and `deepseek-r1` entries cannot. An agent with tools on an unsupported model looks correctly configured and does nothing.

Check the model picker first. See [Choosing a model](/docs/agents/choosing-a-model).

The second most common reason is a prompt that never mentions the capability. If the system prompt does not tell the agent that it can check the time or query an order, it will answer from its training data instead of reaching for the tool.

## Guardrails still apply

Guardrails are evaluated on the way in, so they constrain what a tool-enabled agent can be asked to do — but they do not constrain what the tool itself is allowed to do. Scope a tool narrowly and prefer read-only tools for anything a user can influence.
