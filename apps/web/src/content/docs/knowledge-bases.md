# Knowledge bases

Ground your agent's answers in your own documents instead of its training data.

## 1. Create the base

**Knowledge → New**, then name it. A knowledge base holds:

- **Documents**: uploaded files or connected URLs
- **Q&A pairs**: question and answer pairs you write yourself

Scope the base to the agent's job. One knowledge base covering everything means more irrelevant chunks in context. Two focused bases beat one kitchen sink.

## 2. Add documents

Upload files or connect URLs. Anything that changes often is better as a URL than an upload.

Each document starts as **pending** while it is being processed. Wait for it to leave that state before testing retrieval.

> [!TIP]
> **Wait for `ready` before you test**
>
> A document still processing returns partial chunks, which looks exactly like a bad prompt. Check the status first. It saves an hour of rewriting something that was never broken.

You can delete a document without touching the rest of the base.

## 3. Add Q&A pairs

Q&A pairs beat uploaded documents for anything you actually care about being right. A paragraph of prose gets chunked and diluted; a question and its exact answer is a clean, targeted match.

Write them for the questions your team field every week. Ten good pairs outperform a hundred pages of documentation.

## 4. Attach it to an agent

The agent's **Knowledge** section picks the base. Once attached, every conversation on that agent retrieves from it. One knowledge base can be shared by several agents; an agent has at most one.

The prompt still decides the behaviour. Retrieval supplies facts; the prompt decides what to do when nothing relevant comes back. Without a scope rule, the agent will improvise.

## 5. Verify retrieval in the playground

There is a one-click prompt that tests the knowledge base directly. Use it before writing your own question.

The failure looks like this: the agent answers confidently and wrongly, from its own knowledge, while the document that would have corrected it sits in the base. That means retrieval found nothing relevant, not that the model ignored it. Check the document is fully processed, then check the question is answerable from the text as written.

## 6. Maintain it

Deleting a knowledge base deletes its documents, chunks, and Q&A pairs, and detaches it from every agent using it. There is no undo. Detach agents first if you only want to stop it being used.

Re-check sources quarterly. One stale document in the index will surface, and people will lose trust in five minutes.
