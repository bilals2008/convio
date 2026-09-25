# Billing and usage

## How you are charged

Convio meters what your agents actually do. The number that matters is **token usage** — input and output tokens across every conversation on every agent in the organization.

Cost is tracked per agent, per day. That is what the analytics page graphs, and it is why agent-level cost is the thing to watch: one misconfigured agent is visible immediately, where a monthly total would hide it.

## Plans

Each plan carries its own limits and features. Both are defined on the plan itself, so what applies to you depends on the plan your organization is on.

Check **Settings → Billing** for the limits that apply to you. The ones that bite in practice:

- **Monthly token allowance** — the ceiling on usage
- **Agent count** — how many agents the organization can hold
- **Knowledge base size** — how much you can upload

Plan changes take effect on the current billing period, not immediately, unless you are changing at the period boundary.

## Trials

A plan can carry a trial period, in days. The subscription records `trialEndsAt`, and you can see where you stand under **Settings → Billing**.

Nothing is deleted at the end of a trial. If you do not upgrade, the organization drops to the plan's limits rather than losing data — but agents beyond a free plan's agent count stop being usable, so check the count before you hit the date.

## Cancelling

Cancellation is not immediate by default. The subscription records `cancelAtPeriodEnd`, so cancelling means you keep everything until the period runs out, and then the limits change.

You can usually reverse a cancellation before the date it takes effect. Check **Settings → Billing** — if the option is not there, the change has already been processed.

Cancelling an organization is a different thing entirely, and it is permanent: it takes the agents, documents, conversations, and history with it. Owners only. If you only want to stop paying, cancel the subscription instead. The data stays.

## Invoices

Every paid period produces an invoice, available under **Settings → Billing**. Each records the provider reference, the amount, and the period it covers.

## Keeping costs predictable

Three habits cover most cases.

**Watch the agent breakdown, not the total.** Analytics are per agent, so an anomaly names its cause.

**Set the status to `inactive` when an agent misbehaves.** A looping agent is a bill, and pausing it is instant.

**Lower reasoning effort for high-volume work.** `high` across a busy FAQ agent costs several times `low` for no visible benefit on lookups.

If you brought your own provider keys, those calls bill your provider directly and are not part of Convio's metering — which is worth knowing when reconciling two invoices.
