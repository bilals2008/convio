# Knowledge bases

A knowledge base is a collection of documents an agent can retrieve from, so its answers are grounded in your content instead of its training data.

## Why it exists

A system prompt can only hold so much, and it costs tokens on every single request. Content that changes weekly does not belong there at all. A knowledge base is the right home for anything you would otherwise find yourself pasting into a prompt.

## How it works

Documents are uploaded, split into chunks, and embedded as vectors. When a question arrives, Convio finds the chunks closest in meaning and puts them in front of the model as context.

The agent therefore answers from **retrieved text**, not from memory. If nothing relevant is in the knowledge base, the good outcome is that it says it does not know — which is why your [system prompt](/docs/system-prompts) needs an explicit "if you do not know, say so" rule.

## Creating one

**Knowledge → New**, then name it. A knowledge base holds:

- **Documents** — uploaded files or connected URLs
- **Q&A pairs** — question and answer pairs you write yourself

Attach it to an agent on the agent's **Knowledge** section. One knowledge base can be shared by several agents; an agent has at most one.

## Documents

Each document has a status, and it starts as **pending** while it is being processed. Wait for it to leave that state before testing retrieval — a half-indexed document will return partial answers, and people usually blame the prompt.

> [!TIP]
> **Wait for `ready` before you test**
>
> A document still processing returns partial chunks, which looks exactly like a bad prompt. Check the status first — it saves an hour of rewriting something that was never broken.

Documents can be files or URLs. Anything that changes often is better as a URL than an upload.

You can delete a document without touching the rest of the base.

## Q&A pairs are the highest-value input

Q&A pairs beat uploaded documents for anything you actually care about being right. A paragraph of prose gets chunked and diluted; a question and its exact answer is a clean, targeted match.

Write them for the questions your team field every week. Ten good pairs outperform a hundred pages of documentation.

## Attaching to an agent

The agent's **Knowledge** section picks the base. Once attached, every conversation on that agent retrieves from it.

Two rules:

- **The prompt still decides the behaviour.** Retrieval supplies facts; the prompt decides what to do when nothing relevant comes back. Without a scope rule, the agent will improvise.
- **Scope the base to the agent's job.** One knowledge base covering everything means more irrelevant chunks in context. Two focused bases beat one kitchen sink.

## Checking retrieval

The playground is the place to verify this. There is a one-click prompt that tests the knowledge base directly — use it before writing your own question.

The failure looks like this: the agent answers confidently and wrongly, from its own knowledge, while the document that would have corrected it sits in the base. That means retrieval found nothing relevant, not that the model ignored it. Check the document is fully processed, then check the question is answerable from the text as written.

## Deleting a base

Deleting a knowledge base deletes its documents, chunks, and Q&A pairs, and detaches it from every agent using it. There is no undo. Detaching an agent first, if you only want to stop it being used.
