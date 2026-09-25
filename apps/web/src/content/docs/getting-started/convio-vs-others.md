# Convio vs other platforms

Picking a platform usually means choosing which constraint you can live with. Here is how Convio differs from the usual suspects.

## Against hosted bot builders

Hosted builders are fast to start and slow to leave. You get a proprietary agent format, limited model choice, and per-message pricing that is hard to predict. Convio is self-hosted and MIT licensed, so your prompts, knowledge, and evaluation loop stay yours.

## Against AI SDK wrappers

Wrapping a model API gives you raw capability and no product. You still have to build organizations, permissions, cost controls, streaming infrastructure, and a chat UI. Convio ships those, and lets you bring your own model keys.

## When Convio is the wrong choice

- You need a fully managed, zero-ops deployment. Convio assumes you can run a database and a Node service.
- Your workload is a single prompt with no channels, no team, and no shared knowledge. A direct API call is less machinery.
- You are bound to a closed platform by an existing enterprise contract.

## When it is the right one

- Multiple teams need isolated workspaces with shared billing and audit trails.
- You want model choice per agent, including bring-your-own keys.
- The same agent has to answer on web, API, and messaging surfaces without being rebuilt each time.
