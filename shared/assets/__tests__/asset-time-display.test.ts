import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  getAssetDateGroup,
  formatAssetRelativeTime,
  getTodoGroupKey,
  type AssetDateGroup,
  type TodoGroupKey,
} from '../asset-time-display'
import type { AssetListItem } from '../assets.types'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

function makeItem(overrides: Partial<AssetListItem> = {}): AssetListItem {
  return {
    id: 'test-id',
    originalText: '',
    title: 'Test',
    excerpt: '',
    type: 'todo',
    url: null,
    timeText: null,
    dueAt: null,
    completed: false,
    createdAt: new Date(),
    ...overrides,
  }
}

describe('formatAssetRelativeTime', () => {
  it('returns "刚刚" for dates within the last minute', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const past = new Date(now.getTime() - 30 * 1000)
    assert.strictEqual(formatAssetRelativeTime(past, 'zh-CN', now), '刚刚')
  })

  it('returns "刚刚" for the current moment', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    assert.strictEqual(formatAssetRelativeTime(now, 'zh-CN', now), '刚刚')
  })

  it('returns minute-based format for minutes ago', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const past = new Date(now.getTime() - 5 * 60 * 1000)
    assert.strictEqual(formatAssetRelativeTime(past, 'zh-CN', now), '5分钟前')
  })

  it('returns "1小时前" for exactly 1 hour ago', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const past = new Date(now.getTime() - 1 * HOUR)
    assert.strictEqual(formatAssetRelativeTime(past, 'zh-CN', now), '1小时前')
  })

  it('returns hour-based format for hours ago', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const past = new Date(now.getTime() - 5 * HOUR)
    assert.strictEqual(formatAssetRelativeTime(past, 'zh-CN', now), '5小时前')
  })

  it('returns "昨天" for exactly 1 day ago', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const past = new Date(now.getTime() - 1 * DAY)
    assert.strictEqual(formatAssetRelativeTime(past, 'zh-CN', now), '昨天')
  })

  it('returns day-based format for multi-day ago (2-7 days)', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const past = new Date(now.getTime() - 3 * DAY)
    assert.strictEqual(formatAssetRelativeTime(past, 'zh-CN', now), '3天前')
  })

  it('returns localized date shape for older than 7 days', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const past = new Date(now.getTime() - 10 * DAY)
    const result = formatAssetRelativeTime(past, 'zh-CN', now)
    assert.match(result, /\d+月\d+日/)
  })
})

describe('getAssetDateGroup', () => {
  it('returns "today" for a date on the same day', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const date = new Date('2024-01-15T08:00:00Z')
    assert.strictEqual(getAssetDateGroup(date, now), 'today')
  })

  it('returns "yesterday" for a date on the previous day', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const date = new Date('2024-01-14T12:00:00Z')
    assert.strictEqual(getAssetDateGroup(date, now), 'yesterday')
  })

  it('returns "older" for a date more than 1 day ago', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const date = new Date('2024-01-13T12:00:00Z')
    assert.strictEqual(getAssetDateGroup(date, now), 'older')
  })

  it('returns "older" for a date far in the past', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const date = new Date('2023-06-01T12:00:00Z')
    assert.strictEqual(getAssetDateGroup(date, now), 'older')
  })
})

describe('getTodoGroupKey', () => {
  it('returns "completed" when todo is completed', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({ completed: true, dueAt: null, timeText: null })
    assert.strictEqual(getTodoGroupKey(item, now), 'completed')
  })

  it('returns "completed" even when dueAt is in the past', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({
      completed: true,
      dueAt: new Date('2024-01-10T12:00:00Z'),
    })
    assert.strictEqual(getTodoGroupKey(item, now), 'completed')
  })

  it('returns "today" when dueAt is within today window', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({
      completed: false,
      dueAt: new Date('2024-01-15T18:00:00Z'),
    })
    assert.strictEqual(getTodoGroupKey(item, now), 'today')
  })

  it('returns "today" when dueAt is exactly at midnight tomorrow (edge case)', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({
      completed: false,
      dueAt: new Date('2024-01-16T00:00:00Z'),
    })
    assert.strictEqual(getTodoGroupKey(item, now), 'today')
  })

  it('returns "thisWeek" when dueAt is within the next 7 days', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({
      completed: false,
      dueAt: new Date('2024-01-18T12:00:00Z'),
    })
    assert.strictEqual(getTodoGroupKey(item, now), 'thisWeek')
  })

  it('returns "thisWeek" when dueAt is 6 days from now', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({
      completed: false,
      dueAt: new Date('2024-01-21T12:00:00Z'),
    })
    assert.strictEqual(getTodoGroupKey(item, now), 'thisWeek')
  })

  it('returns "today" when timeText includes "今天"', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({
      completed: false,
      dueAt: null,
      timeText: '今天',
    })
    assert.strictEqual(getTodoGroupKey(item, now), 'today')
  })

  it('returns "today" when timeText includes "明天"', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({
      completed: false,
      dueAt: null,
      timeText: '明天',
    })
    assert.strictEqual(getTodoGroupKey(item, now), 'today')
  })

  it('returns "thisWeek" when timeText includes "本周"', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({
      completed: false,
      dueAt: null,
      timeText: '本周',
    })
    assert.strictEqual(getTodoGroupKey(item, now), 'thisWeek')
  })

  it('returns "thisWeek" when timeText includes "这周"', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({
      completed: false,
      dueAt: null,
      timeText: '这周',
    })
    assert.strictEqual(getTodoGroupKey(item, now), 'thisWeek')
  })

  it('returns "thisWeek" when timeText includes "周" (e.g. "周三")', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({
      completed: false,
      dueAt: null,
      timeText: '周三',
    })
    assert.strictEqual(getTodoGroupKey(item, now), 'thisWeek')
  })

  it('returns "noDate" when no dueAt and no useful timeText', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({
      completed: false,
      dueAt: null,
      timeText: null,
    })
    assert.strictEqual(getTodoGroupKey(item, now), 'noDate')
  })

  it('returns "noDate" when timeText has no relevant keywords', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({
      completed: false,
      dueAt: null,
      timeText: '随便文本',
    })
    assert.strictEqual(getTodoGroupKey(item, now), 'noDate')
  })

  it('prefers dueAt over timeText for date grouping', () => {
    const now = new Date('2024-01-15T12:00:00Z')
    const item = makeItem({
      completed: false,
      dueAt: new Date('2024-01-20T12:00:00Z'),
      timeText: '今天',
    })
    assert.strictEqual(getTodoGroupKey(item, now), 'thisWeek')
  })
})