import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Cpu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { organizations as orgsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { toast } from '@/lib/toast'
import { toastMutationError } from '@/lib/api/mutation-error'

type EmbeddingProvider = 'local' | 'openai'

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

  useEffect(() => {
    if (!orgData) return
    setProvider(orgData.embeddingProvider === 'openai' ? 'openai' : 'local')
    setModel(orgData.embeddingModel ?? '')
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
              How knowledge bases are embedded for search. Switching providers re-indexes documents
              on their next update.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="embedding-provider">Embedding provider</Label>
          <Select
            value={provider}
            onValueChange={(value) => {
              const next = value as EmbeddingProvider
              setProvider(next)
              save(next)
            }}
          >
            <SelectTrigger id="embedding-provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local (built-in)</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {provider === 'openai'
              ? 'Uses your OpenAI key from Provider Keys.'
              : 'Bundled model — no API key needed.'}
          </p>
        </div>

        {provider === 'openai' && (
          <div className="space-y-2">
            <Label htmlFor="embedding-model">Model</Label>
            <Input
              id="embedding-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              onBlur={() => save('openai')}
              placeholder="text-embedding-3-small"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
