import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Cpu, TriangleAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox'
import { organizations as orgsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { toast } from '@/lib/toast'
import { toastMutationError } from '@/lib/api/mutation-error'

type EmbeddingProvider = 'local' | 'openai'

const PROVIDER_ITEMS = [
  { value: 'local' as const, label: 'Local (built-in)', description: 'Runs on your server — no API key, downloads once' },
  { value: 'openai' as const, label: 'OpenAI', description: 'Uses your OpenAI key from Provider Keys' },
]

const LOCAL_MODELS = [
  { value: 'all-minilm', label: 'MiniLM', description: 'Default — fastest, English' },
  { value: 'bge-small', label: 'BGE Small', description: 'Better quality, English, same speed' },
  { value: 'multilingual-e5', label: 'Multilingual E5', description: 'Urdu, Hindi, Arabic, Chinese + English' },
] as const

interface EmbeddingOrg {
  embeddingProvider?: string | null
  embeddingModel?: string | null
}

export function EmbeddingSettingsCard() {
  const { orgId } = useOrg()
  const queryClient = useQueryClient()

  const { data: orgData } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      const res = await orgsApi.get(orgId!)
      return (res.data.data || {}) as EmbeddingOrg
    },
    enabled: !!orgId,
  })

  const [provider, setProvider] = useState<EmbeddingProvider>('local')
  const [model, setModel] = useState('')
  const [original, setOriginal] = useState<{ provider: string; model: string }>({ provider: '', model: '' })

  useEffect(() => {
    if (!orgData) return
    const p = orgData.embeddingProvider === 'openai' ? 'openai' : 'local'
    const m = orgData.embeddingModel ?? ''
    setProvider(p)
    setModel(m)
    setOriginal({ provider: p, model: m })
  }, [orgData])

  const mutation = useMutation({
    mutationFn: (value: { embeddingProvider: EmbeddingProvider; embeddingModel: string | null }) =>
      orgsApi.update(orgId!, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', orgId] })
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Embedding settings updated')
    },
    onError: (error) => toastMutationError(error, 'Failed to update embedding settings'),
  })

  // Changing the model (not the provider) swaps the vector space, so existing
  // documents must be re-indexed or search degrades silently.
  const modelChanged = original.provider === provider && original.model !== model

  function save(nextProvider: EmbeddingProvider, nextModel: string = model) {
    mutation.mutate({
      embeddingProvider: nextProvider,
      embeddingModel: nextModel.trim() ? nextModel.trim() : null,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cpu className="size-4" />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle>Embeddings</CardTitle>
            <CardDescription>
              How knowledge bases are embedded for search. All models produce compatible 384-dim
              vectors.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Embedding provider</Label>
          <Combobox
            items={PROVIDER_ITEMS}
            value={PROVIDER_ITEMS.find((p) => p.value === provider)}
            onValueChange={(item) => {
              if (!item) return
              setProvider(item.value)
              save(item.value, item.value === 'local' ? '' : model)
            }}
            itemToStringValue={(item) => item.label}
          >
            <ComboboxTrigger className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm">
              <ComboboxValue>
                {(item) => item.label}
              </ComboboxValue>
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxEmpty>No providers found.</ComboboxEmpty>
              <ComboboxList>
                {PROVIDER_ITEMS.map((p) => (
                  <ComboboxItem key={p.value} value={p} className="items-start py-2">
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-sm font-medium">{p.label}</span>
                      <span className="text-xs text-muted-foreground">{p.description}</span>
                    </span>
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        {provider === 'local' && (
          <div className="space-y-2">
            <Label htmlFor="embedding-model">Model</Label>
            <Combobox
              items={LOCAL_MODELS}
              value={LOCAL_MODELS.find((m) => m.value === (model || 'all-minilm'))}
              onValueChange={(item) => {
                if (!item) return
                setModel(item.value === 'all-minilm' ? '' : item.value)
                save('local', item.value === 'all-minilm' ? '' : item.value)
              }}
              itemToStringValue={(item) => item.label}
            >
              <ComboboxTrigger
                id="embedding-model"
                className="flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
              >
                <ComboboxValue>{(item) => item.label}</ComboboxValue>
              </ComboboxTrigger>
              <ComboboxContent className="w-[var(--anchor-width)]">
                <ComboboxEmpty>No models found.</ComboboxEmpty>
                <ComboboxList>
                  {LOCAL_MODELS.map((m) => (
                    <ComboboxItem key={m.value} value={m} className="items-start py-2">
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <span className="text-sm font-medium">{m.label}</span>
                        <span className="text-xs text-muted-foreground">{m.description}</span>
                      </span>
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        )}

        {modelChanged && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3">
            <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
            <p className="text-xs text-muted-foreground">
              Re-index your documents after changing the model — old embeddings won't match new
              search queries.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
