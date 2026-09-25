# Glossary

The vocabulary Convio uses, in one place.

## Agent

The brain behind a conversation. An agent binds a model, a system prompt, and a set of tools. It is the unit you create, test, and publish.

## Organization

The workspace boundary. Owns agents, knowledge bases, provider keys, members, and billing.

## Channel

A surface an agent is published to — the web widget, the API, or an integrated messaging surface. One agent can run on several.

## Deployment

A published version of an agent on a specific channel. Editing an agent does not change what is already deployed until you redeploy it.

## Widget

The embeddable web chat client. You configure its appearance, then drop the embed snippet into your site.

## Knowledge base

A collection of documents an agent can retrieve from, so its answers are grounded in your content.

## Tool

A capability an agent may call during a conversation — a search, an API call, a Composio integration, or an MCP server you connected.

## MCP

Model Context Protocol. An open standard for exposing tools and data to a model. Convio can connect to MCP servers, so an agent can reach systems that were not written for it.

## Conversation

One thread of messages between a user and an agent, on one channel. Transcripts are retained and searchable.
