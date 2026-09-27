interface DocsImageProps {
  src: string
  /** Required. A screenshot with no alt text is a screenshot nobody can use. */
  alt: string
  width: number
  height: number
  /** Markdown image title, used as the caption. */
  caption?: string
}

/**
 * Screenshot frame for docs prose. Intrinsic width/height reserve the box so the
 * article never reflows as images arrive, and `not-typeset` keeps `.typeset` from
 * adding a second radius and margin on top of these.
 */
export function DocsImage({ src, alt, width, height, caption }: DocsImageProps) {
  return (
    <figure className="not-typeset my-6">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="w-full rounded-lg border border-border bg-muted"
      />
      {caption ? (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  )
}
