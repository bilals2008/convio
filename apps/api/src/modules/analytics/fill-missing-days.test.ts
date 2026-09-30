import { describe, expect, it } from 'vitest'
import { fillMissingDays } from './analytics.service.js'

describe('fillMissingDays', () => {
  it('pads days without activity so charts have more than one point', () => {
    const rows = [
      {
        date: '2026-09-27',
        totalConversations: 2,
        totalMessages: 8,
        uniqueUsers: 1,
        avgResponseTime: 8.6,
        inputTokens: 3267,
        outputTokens: 830,
      },
    ]

    const filled = fillMissingDays(
      rows,
      new Date('2026-09-25T00:00:00.000Z'),
      new Date('2026-09-28T23:59:59.999Z'),
    )

    expect(filled.map((d) => d.date)).toEqual([
      '2026-09-25',
      '2026-09-26',
      '2026-09-27',
      '2026-09-28',
    ])
    expect(filled[2]).toEqual(rows[0])
    expect(filled[0].inputTokens).toBe(0)
    expect(filled[0].totalConversations).toBe(0)
  })

  it('returns empty when there is no data at all', () => {
    expect(
      fillMissingDays([], new Date('2026-09-01T00:00:00.000Z'), new Date('2026-09-30T23:59:59.999Z')),
    ).toEqual([])
  })
})
