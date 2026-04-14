import assert from 'node:assert/strict'
import test from 'node:test'

import { buildNoteSummaryPromptInput } from '../notes.summary.service'
import type { AssetListItem } from '@/shared/assets/assets.types'

test('buildNoteSummaryPromptInput transforms notes correctly', () => {
  const notes: AssetListItem[] = [
    {
      id: 'note-1',
      originalText: '测试笔记内容',
      title: '测试笔记',
      excerpt: '测试笔记内容',
      type: 'note',
      url: null,
      timeText: null,
      dueAt: null,
      completed: false,
      createdAt: new Date('2026-04-13T02:00:00.000Z'),
    },
  ]

  const result = buildNoteSummaryPromptInput(notes)

  assert.equal(result.length, 1)
  assert.equal(result[0].id, 'note-1')
  assert.equal(result[0].text, '测试笔记内容')
  assert.equal(result[0].createdAt, '2026-04-13T02:00:00.000Z')
})

test('buildNoteSummaryPromptInput respects NOTE_SUMMARY_LIMIT', () => {
  const notes: AssetListItem[] = Array.from({ length: 15 }, (_, i) => ({
    id: `note-${i}`,
    originalText: `笔记内容 ${i}`,
    title: `笔记 ${i}`,
    excerpt: `摘要 ${i}`,
    type: 'note' as const,
    url: null,
    timeText: null,
    dueAt: null,
    completed: false,
    createdAt: new Date(),
  }))

  const result = buildNoteSummaryPromptInput(notes)

  assert.ok(result.length <= 10, 'Should respect NOTE_SUMMARY_LIMIT')
})
