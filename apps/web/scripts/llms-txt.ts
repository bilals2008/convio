import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative, sep } from "node:path"

const CONTENT_DIR = join(import.meta.dirname, "../src/content/docs")
const BASE_URL = process.env.SITE_URL ?? "https://app.convio.ai"

interface DocFile {
  slug: string
  url: string
  title: string
  description: string
  body: string
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => join(entry.parentPath, entry.name))
}

function parse(path: string, raw: string): DocFile {
  const slug = relative(CONTENT_DIR, path).replace(/\.md$/, "").split(sep).join("/")
  const title = /^#\s+(.+)$/m.exec(raw)?.[1]?.trim() ?? slug
  const firstLine =
    raw
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith("#") && !line.startsWith("```")) ?? ""
  const description = firstLine
    .replace(/[*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  // The spec asks for concise descriptions, so cap the length — but cut on a word
  // boundary, because a description that ends mid-word reads as broken.
  const clipped =
    description.length <= 160
      ? description
      : `${description.slice(0, description.lastIndexOf(" ", 160)).trimEnd()}…`

  return { slug, url: `${BASE_URL}/docs${slug ? `/${slug}` : ""}`, title, description: clipped, body: raw }
}

/** Writes llms.txt (link index), llms-full.txt (whole corpus) and a .md per page. */
export function buildLlmsFiles(outDir: string): void {
  const docs = walk(CONTENT_DIR)
    .map((path) => parse(path, readFileSync(path, "utf8")))
    .sort((a, b) => a.slug.localeCompare(b.slug))

  // llmstxt.org: the index links to LLM-friendly content, so each page also ships as
  // markdown at the same URL with a .md extension.
  const index = [
    "# Convio",
    "",
    "> Platform for building, deploying, and scaling AI agents across every channel.",
    "",
    "One agent definition — a model, a system prompt, a knowledge base and tools — deployed to",
    "the web widget, WhatsApp, Slack, Telegram, Discord and SMS. Pages are self-contained and",
    "cross-link inside the prose, so any single page can be read on its own.",
    "",
    "## Docs",
    "",
  ]

  for (const doc of docs) {
    index.push(`- [${doc.title}](${BASE_URL}/docs/${doc.slug}.md)${doc.description ? `: ${doc.description}` : ""}`)
  }

  // Convention from the spec: secondary material an agent can skip for a shorter context.
  index.push(
    "",
    "## Optional",
    "",
    `- [Full documentation in one file](${BASE_URL}/llms-full.txt): every page above, concatenated — read this instead of following the links when you need the whole corpus.`,
    ""
  )

  const full = docs
    .map((doc) => `<!-- ${doc.url} -->\n\n${doc.body.trim()}`)
    .join("\n\n---\n\n")

  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, "llms.txt"), index.join("\n"), "utf8")
  writeFileSync(join(outDir, "llms-full.txt"), `# Convio — full documentation\n\n${full}\n`, "utf8")

  for (const doc of docs) {
    const target = doc.slug ? join(outDir, "docs", doc.slug) : join(outDir, "docs", "index")
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(`${target}.md`, `${doc.body.trim()}\n`, "utf8")
  }
}
