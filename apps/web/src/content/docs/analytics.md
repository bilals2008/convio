# Analytics

How to read your agent traffic, cost, and retrieval quality — and find the one agent causing the problem.

## Open analytics

The analytics page works at two levels:

- **Organization level** — every agent, every channel, the whole period. Opens by default.
- **Agent level** — one agent's daily breakdown. Opens from the agent's **Analytics** section.

## 1. Pick a date range

Choose **7 days**, **30 days** (default), or **90 days** at the top of the page. Every card, chart, and table on the page follows that selection. Compare like with like — a 7-day spike against a 30-day average tells you nothing.

## 2. Read the overview cards

Four numbers, in priority order:

- **Conversations** — how many threads started. Volume.
- **Messages** — total messages across those threads. Messages per conversation tells you whether visitors get answers or get lost.
- **Unique users** — how many distinct people. Users vs conversations tells you whether people come back.
- **Token cost** — what the period cost. The one to watch: a flat conversation count with rising cost means longer or more expensive answers, not more traffic.

## 3. Read the charts

**Activity** — conversations, messages, and users per day. Look for the shape: a weekday rhythm is normal, a flatline on a formerly busy day is not. A single-day spike usually traces to one deployment or one campaign.

**Response time** — how long the agent takes to answer. A slow first token points at the model or reasoning effort, not your prompt.

**Channel performance** — the same metrics split by surface. Your widget and your WhatsApp number are different products with different traffic; this is where you see which one actually works.

**Token cost trend** — daily spend. This is the graph to watch. A smooth rise is growth; a step change is a config change; a cliff is usually a deployment going live or a broadcast.

## 4. Find the cause in the tables

**Agent performance** — per-agent conversations, messages, tokens, and cost for the period. Sorted by cost by default, because that is the question that matters: which agent is spending money and is it earning it. One expensive agent with few conversations is a config problem, not a volume problem.

**Top documents** — which knowledge-base documents actually got retrieved. A document never retrieved is either irrelevant, badly chunked, or outranked by Q&A pairs. A document retrieved constantly with bad answers means the content or the Q&A pairs need work.

## 5. Drill into one agent

Open the agent's **Analytics** section for the daily breakdown of that agent alone. This is where you confirm a suspicion from the org-level view: the cost spike was agent X, on the day you changed Y.

## 6. Act on it

The pattern is almost always one of three:

- **Cost up, conversations flat** — raise the agent's efficiency: lower reasoning effort for lookups, shorten answers in the prompt, check for loops in the tool calls.
- **Conversations up, answers flat** — a channel or campaign is bringing traffic the agent cannot handle. Check the welcome message and the scope.
- **Everything up together** — that is growth. Make sure the plan's token allowance keeps up.
