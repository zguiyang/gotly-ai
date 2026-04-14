import assert from 'node:assert/strict'
import test from 'node:test'

import { buildTodoReviewPromptInput } from '../todos.review.service'
import type { AssetListItem } from '@/shared/assets/assets.types'

test('buildTodoReviewPromptInput transforms todos correctly', () => {
  const todos: AssetListItem[] = [
    {
      id: 'todo-1',
      originalText: '完成报告',
      title: '完成报告',
      excerpt: '完成报告',
      type: 'todo',
      url: null,
      timeText: '明天',
      dueAt: new Date('2026-04-15T06:00:00.000Z'),
      completed: false,
      createdAt: new Date('2026-04-13T02:00:00.000Z'),
    },
  ]

  const result = buildTodoReviewPromptInput(todos)

  assert.equal(result.length, 1)
  assert.equal(result[0].id, 'todo-1')
  assert.equal(result[0].text, '完成报告')
  assert.equal(result[0].timeText, '明天')
  assert.equal(result[0].dueAt, '2026-04-15T06:00:00.000Z')
})

test('buildTodoReviewPromptInput handles null timeText and dueAt', () => {
  const todos: AssetListItem[] = [
    {
      id: 'todo-1',
      originalText: '完成报告',
      title: '完成报告',
      excerpt: '完成报告',
      type: 'todo',
      url: null,
      timeText: null,
      dueAt: null,
      completed: false,
      createdAt: new Date('2026-04-13T02:00:00.000Z'),
    },
  ]

  const result = buildTodoReviewPromptInput(todos)

  assert.equal(result[0].timeText, null)
  assert.equal(result[0].dueAt, null)
})

test('buildTodoReviewPromptInput respects TODO_REVIEW_LIMIT', () => {
  const todos: AssetListItem[] = Array.from({ length: 15 }, (_, i) => ({
    id: `todo-${i}`,
    originalText: `待办 ${i}`,
    title: `待办 ${i}`,
    excerpt: `摘要 ${i}`,
    type: 'todo' as const,
    url: null,
    timeText: null,
    dueAt: null,
    completed: false,
    createdAt: new Date(),
  }))

  const result = buildTodoReviewPromptInput(todos)

  assert.ok(result.length <= 10, 'Should respect TODO_REVIEW_LIMIT')
})
