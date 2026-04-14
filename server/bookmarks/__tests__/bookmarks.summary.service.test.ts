import assert from 'node:assert/strict'
import test from 'node:test'

import { buildBookmarkSummaryPromptInput } from '../bookmarks.summary.service'
import type { AssetListItem } from '@/shared/assets/assets.types'

test('buildBookmarkSummaryPromptInput transforms bookmarks correctly', () => {
  const bookmarks: AssetListItem[] = [
    {
      id: 'link-1',
      originalText: '收藏 https://example.com',
      title: '收藏',
      excerpt: '收藏 https://example.com',
      type: 'link',
      url: 'https://example.com',
      timeText: null,
      dueAt: null,
      completed: false,
      createdAt: new Date('2026-04-14T02:00:00.000Z'),
    },
  ]

  const result = buildBookmarkSummaryPromptInput(bookmarks)

  assert.equal(result.length, 1)
  assert.equal(result[0].id, 'link-1')
  assert.equal(result[0].url, 'https://example.com')
  assert.equal(result[0].text, '收藏 https://example.com')
  assert.equal(result[0].createdAt, '2026-04-14T02:00:00.000Z')
})

test('buildBookmarkSummaryPromptInput handles null url', () => {
  const bookmarks: AssetListItem[] = [
    {
      id: 'link-1',
      originalText: '书签',
      title: '书签',
      excerpt: '书签',
      type: 'link',
      url: null,
      timeText: null,
      dueAt: null,
      completed: false,
      createdAt: new Date('2026-04-14T02:00:00.000Z'),
    },
  ]

  const result = buildBookmarkSummaryPromptInput(bookmarks)

  assert.equal(result[0].url, null)
})

test('buildBookmarkSummaryPromptInput respects BOOKMARK_SUMMARY_LIMIT', () => {
  const bookmarks: AssetListItem[] = Array.from({ length: 15 }, (_, i) => ({
    id: `link-${i}`,
    originalText: `书签 ${i}`,
    title: `书签 ${i}`,
    excerpt: `书签 ${i}`,
    type: 'link' as const,
    url: `https://example.com/${i}`,
    timeText: null,
    dueAt: null,
    completed: false,
    createdAt: new Date(),
  }))

  const result = buildBookmarkSummaryPromptInput(bookmarks)

  assert.ok(result.length <= 10, 'Should respect BOOKMARK_SUMMARY_LIMIT')
})
