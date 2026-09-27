import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { createElement, Fragment, isValidElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { extractHeadings, parseCallout, slugify, toText, unwrapImages } from '../src/lib/docs/markdown.ts'

const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'docs')

/**
 * Runs markdown through react-markdown with the same blockquote/heading overrides the
 * docs renderer uses, so these assertions cover the real element tree — not a mock of it.
 */
function render(markdown) {
  let callout = null
  const html = renderToStaticMarkup(
    createElement(ReactMarkdown, {
      remarkPlugins: [remarkGfm],
      components: {
        h2: ({ children }) => createElement('h2', { id: slugify(toText(children)) }, children),
        h3: ({ children }) => createElement('h3', { id: slugify(toText(children)) }, children),
        blockquote({ children }) {
          callout = parseCallout(children)
          return callout
            ? createElement('aside', { 'data-variant': callout.variant }, callout.body ?? null)
            : createElement('blockquote', null, children)
        },
        img: ({ src, alt }) => createElement('figure', null, createElement('img', { src, alt })),
      },
      rehypePlugins: [unwrapImages],
    }, markdown)
  )
  return { html, callout }
}

test('callout: marker plus a title on the next line', () => {
  const { callout } = render(
    ['> [!WARNING]', '> **Set the allowlist first**', '>', '> A public key with no allowlist.'].join('\n')
  )
  assert.equal(callout.variant, 'warning')
  assert.equal(callout.title, 'Set the allowlist first')
  assert.equal(renderToStaticMarkup(createElement(Fragment, null, ...callout.body)).includes('<p>'), true)
})

test('callout: marker alone falls back to the variant label', () => {
  const { callout } = render(['> [!NOTE]', '>', '> Retrieval supplies facts.'].join('\n'))
  assert.equal(callout.variant, 'info')
  assert.equal(callout.title, undefined)
})

test('callout: text on the marker line is kept, not swallowed', () => {
  const { callout } = render(['> [!TIP] Name the scope', '>', '> Second para.'].join('\n'))
  assert.equal(callout.variant, 'tip')
  assert.equal(callout.title, 'Name the scope')
})

test('callout: GitHub aliases map onto the five variants', () => {
  for (const [marker, variant] of [
    ['NOTE', 'info'], ['IMPORTANT', 'warning'], ['WARN', 'warning'],
    ['TIP', 'tip'], ['SUCCESS', 'success'], ['CAUTION', 'danger'], ['DANGER', 'danger'],
  ]) {
    assert.equal(render(`> [!${marker}]\n>\n> Body.`).callout.variant, variant, marker)
  }
})

test('callout: an unknown marker falls back to info', () => {
  assert.equal(render('> [!WHATEVER]\n>\n> Body.').callout.variant, 'info')
})

test('callout: a plain blockquote stays a blockquote', () => {
  const { callout, html } = render('> A deployment is a published version of an agent.')
  assert.equal(callout, null)
  assert.ok(html.includes('<blockquote>'))
})

test('callout: multiple body paragraphs are all kept', () => {
  const { callout } = render(['> [!CAUTION]', '> **Silently ignored**', '>', '> First.', '>', '> Second.'].join('\n'))
  assert.equal(callout.variant, 'danger')
  assert.equal(callout.body.length, 2)
})

test('heading ids match the TOC for the whole docs corpus', () => {
  const files = readdirSync(CONTENT_DIR).filter((file) => file.endsWith('.md'))
  assert.ok(files.length > 0, 'no docs markdown found')

  for (const file of files) {
    const raw = readFileSync(join(CONTENT_DIR, file), 'utf8')
    const tocIds = extractHeadings(raw).map((heading) => heading.id)
    const domIds = [...render(raw).html.matchAll(/<h[23] id="([^"]*)"/g)].map((match) => match[1])
    assert.deepEqual(domIds, tocIds, `${file}: rendered heading ids drifted from DocHeading[]`)
  }
})

test('every [!TYPE] marker in the corpus renders as a callout', () => {
  for (const file of readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'))) {
    const raw = readFileSync(join(CONTENT_DIR, file), 'utf8')
    const expected = [...raw.matchAll(/^> \[!(\w+)\]/gm)].length
    const { html } = render(raw)
    assert.equal((html.match(/<aside /g) ?? []).length, expected, `${file}: callouts were dropped`)
  }
})

test('every markdown image has alt text', () => {
  for (const file of readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'))) {
    const raw = readFileSync(join(CONTENT_DIR, file), 'utf8')
    for (const [, alt] of raw.matchAll(/^!\[([^\]]*)\]\(/gm)) {
      assert.ok(alt.trim().length > 0, `${file}: an image has empty alt text`)
    }
  }
})

test('a lone image is not wrapped in a <p>, so <figure> is valid', () => {
  const { html } = render('![The Convio dashboard](https://placehold.co/1280x720)\n')
  assert.ok(html.includes('<figure'), `figure should render, got: ${html}`)
  assert.ok(!html.includes('<p><figure'), `figure nested in p, got: ${html}`)
})

test('an image beside text is lifted out instead of nested in the <p>', () => {
  const { html } = render('Text ![shot](https://placehold.co/1280x720) more text\n')
  assert.ok(!html.includes('<p><figure'), `figure nested in p, got: ${html}`)
  assert.ok(html.includes('<p>'), `paragraph should survive, got: ${html}`)
})

test('isValidElement stays importable for the renderer', () => {
  assert.equal(isValidElement(createElement('p')), true)
})
