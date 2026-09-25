export interface DocPage {
  title: string
  /** Path under /docs, no extension. Empty string is the docs index. */
  slug: string
}

export interface DocSection {
  title: string
  pages: DocPage[]
}

/**
 * Sidebar order. Only pages that have a markdown file belong here — a link with no
 * file behind it renders the not-found state. Follow docs/DOCUMENTATION-ROADMAP.md
 * for what to add next: Organizations, AI Agents, Knowledge Bases, Channels, Billing.
 */
export const docSections: DocSection[] = [
  {
    title: 'Overview',
    pages: [{ title: 'Introduction', slug: '' }],
  },
  {
    title: 'Getting Started',
    pages: [
      { title: 'What is Convio?', slug: 'getting-started/what-is-convio' },
      { title: 'Convio vs other platforms', slug: 'getting-started/convio-vs-others' },
      { title: 'Creating your account', slug: 'getting-started/create-account' },
      { title: 'Dashboard tour', slug: 'getting-started/dashboard-tour' },
      { title: 'Creating an organization', slug: 'getting-started/create-organization' },
      { title: 'Glossary', slug: 'getting-started/glossary' },
    ],
  },
  {
    title: 'Organizations',
    pages: [
      { title: 'Organizations', slug: 'organizations/organizations' },
      { title: 'Roles and permissions', slug: 'organizations/roles-and-permissions' },
      { title: 'Inviting team members', slug: 'organizations/inviting-team-members' },
      { title: 'Managing members', slug: 'organizations/managing-members' },
      { title: 'Transferring ownership', slug: 'organizations/transferring-ownership' },
      { title: 'Leaving an organization', slug: 'organizations/leaving-an-organization' },
      { title: 'Login activity & sessions', slug: 'organizations/login-activity-and-sessions' },
    ],
  },
]

/** Flat, ordered list — drives prev/next. */
export const docPages: DocPage[] = docSections.flatMap((section) => section.pages)
