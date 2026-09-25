import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, relative, sep } from "node:path"

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
    .slice(0, 160)
    .trim()

  return { slug, url: `${BASE_URL}/docs${slug ? `/${slug}` : ""}`, title, description, body: raw }
}

/** Writes llms.txt (link index) and llms-full.txt (whole corpus) for AI crawlers. */
export function buildLlmsFiles(outDir: string): void {
  const docs = walk(CONTENT_DIR)
    .map((path) => parse(path, readFileSync(path, "utf8")))
    .sort((a, b) => a.slug.localeCompare(b.slug))

  const index = [
    "# Convio",
    "",
    "> Open-source platform for building, deploying, and scaling AI agents across every channel.",
    "",
    "## Docs",
    "",
  ]

  for (const doc of docs) {
    index.push(`- [${doc.title}](${doc.url})${doc.description ? `: ${doc.description}` : ""}`)
  }
  index.push("")

  const full = docs
    .map((doc) => `<!-- ${doc.url} -->\n\n${doc.body.trim()}`)
    .join("\n\n---\n\n")

  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, "llms.txt"), index.join("\n"), "utf8")
  writeFileSync(join(outDir, "llms-full.txt"), `# Convio — full documentation\n\n${full}\n`, "utf8")
}
