import { Link } from 'react-router-dom'
import { ArrowLeft, Menu } from 'lucide-react'
import { DocsSearch } from '@/components/docs/docs-search'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const GITHUB_URL = 'https://github.com/bilals2008/convio-ai'

// lucide v1 dropped brand marks, so the GitHub logo ships inline.
function GitHubLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}

export function DocsTopbar({ onOpenNav }: { onOpenNav: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenNav}
          aria-label="Open navigation"
        >
          <Menu className="size-5" />
        </Button>

        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Convio home">
          <img src="/logo.png" alt="" className="h-5 w-auto" />
          <span className="font-heading text-sm font-bold">Convio</span>
        </Link>

        <Separator orientation="vertical" className="h-4" />

        <span className="text-sm text-muted-foreground">Docs</span>

        <div className="ml-auto flex items-center gap-2">
          <DocsSearch />

          <Button
            variant="ghost"
            size="icon"
            render={
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Convio on GitHub" />
            }
          >
            <GitHubLogo className="size-4" />
          </Button>

          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link to="/" />}
          >
            <ArrowLeft />
            Back to site
          </Button>
        </div>
      </div>
    </header>
  )
}
