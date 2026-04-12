export type AssetInputType = 'note' | 'link' | 'todo'

export type AssetClassification = {
  kind: 'asset'
  type: AssetInputType
  url: string | null
  timeText: string | null
  dueAt: Date | null
}

export type QueryClassification = {
  kind: 'query'
}

export type InputClassification = AssetClassification | QueryClassification

const URL_REGEX = /https?:\/\/[^\s]+/g

export function extractUrl(text: string): string | null {
  const matches = text.match(URL_REGEX)
  return matches ? matches[0] : null
}

const QUERY_KEYWORDS = ['查询', '最近记过', '在哪', '有哪些', '找一下', '查一下', '帮我找']
const QUERY_SUFFIXES = ['吗', '么']

export function isObviousQuery(text: string): boolean {
  if (text.startsWith('找')) {
    return true
  }
  if (QUERY_KEYWORDS.some((kw) => text.includes(kw))) {
    return true
  }
  if (QUERY_SUFFIXES.some((suffix) => text.endsWith(suffix))) {
    return true
  }
  return false
}

const TODO_KEYWORDS = ['记得', '提醒', '待办', '要', '处理', '发', '提交', '整理', '预订', '回复']

export function hasTodoIntent(text: string): boolean {
  return TODO_KEYWORDS.some((kw) => text.includes(kw))
}

const TIME_PATTERNS = [
  '今天',
  '明天',
  '后天',
  '本周',
  '下周',
  '周一',
  '周二',
  '周三',
  '周四',
  '周五',
  '周六',
  '周日',
  '下周一',
  '下周二',
  '下周三',
  '下周四',
  '下周五',
  '下周六',
  '下周日',
  '上午',
  '下午',
  '晚上',
]

export function extractTimeText(text: string): string | null {
  for (const pattern of TIME_PATTERNS) {
    if (text.includes(pattern)) {
      return pattern
    }
  }
  return null
}

function getDateForTimeText(timeText: string | null): Date | null {
  if (!timeText) return null

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (timeText === '今天') {
    return today
  }
  if (timeText === '明天') {
    return new Date(today.getTime() + 24 * 60 * 60 * 1000)
  }

  return null
}

export function classifyAssetInput(text: string): InputClassification {
  if (isObviousQuery(text)) {
    return { kind: 'query' }
  }

  const url = extractUrl(text)
  if (url) {
    const timeText = extractTimeText(text)
    const dueAt = getDateForTimeText(timeText)
    return {
      kind: 'asset',
      type: 'link',
      url,
      timeText,
      dueAt,
    }
  }

  if (hasTodoIntent(text)) {
    const timeText = extractTimeText(text)
    const dueAt = getDateForTimeText(timeText)
    return {
      kind: 'asset',
      type: 'todo',
      url: null,
      timeText,
      dueAt,
    }
  }

  return {
    kind: 'asset',
    type: 'note',
    url: null,
    timeText: null,
    dueAt: null,
  }
}
