import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type SortingState, type ColumnDef } from '@/lib/table'
import { useQueryClient } from '@tanstack/react-query'
import { Tags, Plus, Pencil, Trash2, Star, List, LayoutGrid, Bot, MessageSquare, Database, Building2, ArrowRight, ChevronDown, SlidersHorizontal, RefreshCw, MoreHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/admin/page-header'
import { EmptyState } from '@/components/admin/empty-state'
import { DataTableColumnHeader } from '@/components/admin/data-table-column-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useAdminPlans, useCreemPlansStatus } from '@/admin/hooks/use-admin'
import { adminApi, type AdminPlan, type CreemPlansStatus } from '@/admin/services/admin-api'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'grid'

const fmtLimit = (v: number | null | undefined) =>
  v === null || v === undefined || v === Infinity ? '∞' : v.toLocaleString()

interface CreemChip {
  text: string
  variant: 'inactive' | 'failed' | 'pending' | 'active'
}

// Collapses both periods into one chip, worst state first, so a broken product
// never hides behind a healthy one.
function creemChipFor(planId: string, status?: CreemPlansStatus): CreemChip | null {
  const entry = status?.plans.find((p) => p.planId === planId)
  if (!entry) return null

  const linked = entry.periods.filter((p) => p.productId)
  if (linked.length === 0) return { text: 'Not linked', variant: 'inactive' }
  if (linked.some((p) => !p.found)) return { text: 'Not found', variant: 'failed' }
  if (linked.some((p) => p.mismatchCount > 0)) return { text: 'Mismatch', variant: 'pending' }
  return { text: 'Verified', variant: 'active' }
}

function LimitRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11px] leading-tight text-muted-foreground">{label}</p>
        <p className="text-xs font-medium leading-tight tabular-nums">{value}</p>
      </div>
    </div>
  )
}

function PlanCard({ plan, creem, onOpen }: { plan: AdminPlan; creem: CreemChip | null; onOpen: () => void }) {
  const [limitsOpen, setLimitsOpen] = useState(false)
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className={cn(
        'group cursor-pointer p-0 outline-none transition-all duration-200',
        plan.highlighted && 'border-primary/40 ring-1 ring-primary/10',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      <CardContent className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {plan.highlighted && <Star className="size-3.5 shrink-0 fill-warning text-warning" />}
            <h3 className="truncate text-sm font-semibold">{plan.name}</h3>
          </div>
          {plan.active
            ? <Badge variant="active">Active</Badge>
            : <Badge variant="inactive">Hidden</Badge>}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {plan.badge && <Badge variant="pro">{plan.badge}</Badge>}
          <code className="min-w-0 truncate rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-muted-foreground">{plan.key}</code>
          {creem && <Badge variant={creem.variant}>{creem.text}</Badge>}
          {plan.trialPeriodDays ? <Badge variant="member">{plan.trialPeriodDays}d trial</Badge> : null}
          <span className="ml-auto shrink-0 text-[11px] text-muted-foreground tabular-nums">{plan.features?.length ?? 0} features</span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-semibold tabular-nums">{plan.price || '—'}</span>
          {plan.yearlyPrice && <span className="text-[11px] text-muted-foreground">/ {plan.yearlyPrice} yearly</span>}
        </div>

        <p className="line-clamp-1 text-xs text-muted-foreground" title={plan.description ?? undefined}>
          {plan.description || `No description — ${plan.features?.length ?? 0} features`}
        </p>

        <Collapsible open={limitsOpen} onOpenChange={setLimitsOpen} className="group/collapsible mt-auto border-t border-border/60 pt-2">
          <CollapsibleTrigger
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex w-full items-center justify-between gap-2 rounded-md py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
              <SlidersHorizontal className="size-3" />
              Limits
            </span>
            <ChevronDown className="size-3 text-muted-foreground transition-transform duration-200 group-data-open/collapsible:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
            <LimitRow icon={Bot} label="Agents" value={fmtLimit(plan.limits?.agents)} />
            <LimitRow icon={MessageSquare} label="Messages / mo" value={fmtLimit(plan.limits?.messagesPerMonth)} />
            <LimitRow icon={Database} label="Knowledge bases" value={fmtLimit(plan.limits?.knowledgeBases)} />
            <LimitRow icon={Building2} label="Organizations" value={fmtLimit(plan.limits?.organizations)} />
          </CollapsibleContent>
        </Collapsible>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {plan.comingSoon ? 'Coming soon' : `Sort #${plan.sortOrder}`}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Open plan
            <ArrowRight className="size-3" />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminPricingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [sorting, setSorting] = useState<SortingState>([])
  const [pendingDelete, setPendingDelete] = useState<AdminPlan | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [view, setView] = useState<ViewMode>(() =>
    typeof localStorage !== 'undefined' && localStorage.getItem('admin-pricing-view') === 'grid' ? 'grid' : 'list'
  )
  const { data, isLoading } = useAdminPlans()
  const creemStatus = useCreemPlansStatus()

  const setViewMode = (v: ViewMode) => {
    setView(v)
    try { localStorage.setItem('admin-pricing-view', v) } catch { /* noop */ }
  }

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await adminApi.deletePlan(pendingDelete.id)
      await queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'creem'] })
      // The public pricing pages render these same plan rows.
      await queryClient.invalidateQueries({ queryKey: ['pricing', 'plans'] })
      toast.success(`${pendingDelete.name} plan deleted`)
      setPendingDelete(null)
    } catch (error) {
      toast.error((error as Error).message || 'Unable to delete plan.')
    } finally {
      setDeleting(false)
    }
  }, [pendingDelete, queryClient])

  const columns = useMemo<ColumnDef<AdminPlan>[]>(() => [
    { accessorKey: 'name', header: ({ column }) => <DataTableColumnHeader column={column} title="Plan" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.highlighted && <Star className="size-3.5 shrink-0 fill-warning text-warning" />}
          <span className="text-sm font-medium">{row.original.name}</span>
          {row.original.badge && <Badge variant="pro">{row.original.badge}</Badge>}
          {row.original.trialPeriodDays ? <Badge variant="member">{row.original.trialPeriodDays}d trial</Badge> : null}
          {!row.original.active && <Badge variant="inactive">Hidden</Badge>}
        </div>
      ) },
    { accessorKey: 'key', header: ({ column }) => <DataTableColumnHeader column={column} title="Key" />,
      cell: ({ row }) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">{row.original.key}</code> },
    { accessorKey: 'priceMonthly', header: ({ column }) => <DataTableColumnHeader column={column} title="Price" />,
      cell: ({ row }) => {
        const p = row.original
        return (
          <div className="text-sm">
            <span className="font-medium tabular-nums">{p.price || '—'}</span>
            {p.yearlyPrice && <span className="ml-1.5 text-xs text-muted-foreground tabular-nums">/ {p.yearlyPrice} yr</span>}
          </div>
        )
      } },
    { id: 'creem', header: ({ column }) => <DataTableColumnHeader column={column} title="Creem" />,
      cell: ({ row }) => {
        const chip = creemChipFor(row.original.id, creemStatus.data)
        if (!chip) return <span className="text-xs text-muted-foreground">—</span>
        return <Badge variant={chip.variant}>{chip.text}</Badge>
      } },
    { id: 'limits', header: ({ column }) => <DataTableColumnHeader column={column} title="Limits" />,
      cell: ({ row }) => {
        const l = row.original.limits
        return (
          <span className="text-xs text-muted-foreground tabular-nums">
            {fmtLimit(l?.agents)} agents · {fmtLimit(l?.knowledgeBases)} KB · {fmtLimit(l?.messagesPerMonth)} msgs · {fmtLimit(l?.organizations)} orgs
          </span>
        )
      } },
    { id: 'features', header: ({ column }) => <DataTableColumnHeader column={column} title="Features" />,
      cell: ({ row }) => <span className="text-sm tabular-nums">{row.original.features?.length ?? 0}</span> },
    { accessorKey: 'sortOrder', header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
      cell: ({ row }) => <span className="text-sm tabular-nums">#{row.original.sortOrder}</span> },
    { id: 'actions', header: () => null, enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${row.original.name}`}>
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => navigate(`/admin/pricing/${row.original.id}`)}>
                <Pencil className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => setPendingDelete(row.original)}>
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) },
  ], [navigate, creemStatus.data])

  const table = useReactTable({
    data: data || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const plans = data || []

  return (
    <div>
      <PageHeader
        title="Pricing"
        description="Manage plans, prices, features, and limits."
        actions={
          <div className="flex items-center gap-2">
            {creemStatus.data && (
              <Badge variant={creemStatus.data.mode === 'test' ? 'pending' : 'destructive'}>
                Creem {creemStatus.data.mode.toUpperCase()}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => creemStatus.refetch()}
              disabled={creemStatus.isFetching}
              aria-label="Re-check Creem products"
            >
              <RefreshCw className={cn('size-3.5', creemStatus.isFetching && 'animate-spin')} />
            </Button>
            <ToggleGroup
              variant="outline"
              size="sm"
              spacing={0}
              value={[view]}
              onValueChange={(vals) => {
                const v = vals[0]
                if (v === 'list' || v === 'grid') setViewMode(v)
              }}
            >
              <ToggleGroupItem value="grid" aria-label="Grid view"><LayoutGrid className="size-3.5" /></ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view"><List className="size-3.5" /></ToggleGroupItem>
            </ToggleGroup>
            <Button size="sm" onClick={() => navigate('/admin/pricing/new')}>
              <Plus data-icon="inline-start" /> New Plan
            </Button>
          </div>
        }
      />

      {view === 'list' ? (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((h) => (
                    <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{columns.map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
                ))
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-10">
                    <EmptyState icon={Tags} title="No plans yet" description="Create your first plan to show on the pricing page." />
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="odd:bg-muted/30 cursor-pointer"
                    onClick={() => navigate(`/admin/pricing/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 rounded-xl border border-border/60 bg-card p-4">
                <div className="space-y-2.5">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))
          ) : plans.length === 0 ? (
            <div className="col-span-full rounded-xl border border-border/60 bg-card py-16">
              <EmptyState icon={Tags} title="No plans yet" description="Create your first plan to show on the pricing page." />
            </div>
          ) : (
            plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                creem={creemChipFor(plan.id, creemStatus.data)}
                onOpen={() => navigate(`/admin/pricing/${plan.id}`)}
              />
            ))
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => { if (!open) setPendingDelete(null) }}
        title={`Delete the "${pendingDelete?.name}" plan?`}
        description="Organizations already on this plan keep their access, but the plan disappears from the pricing page and can no longer be purchased."
        confirmText={deleting ? 'Deleting…' : 'Delete plan'}
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
