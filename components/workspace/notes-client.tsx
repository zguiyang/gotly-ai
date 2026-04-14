'use client'

import { FileText } from 'lucide-react'

import { formatAssetRelativeTime } from '@/shared/assets/asset-time-display'
import { type AssetListItem } from '@/shared/assets/assets.types'

function NoteCard({ note }: { note: AssetListItem }) {
  const hasTitle = note.title && note.title !== note.excerpt

  return (
    <div className="break-inside-avoid mb-4 min-h-[140px] bg-surface-container-lowest rounded-lg shadow-note-card p-4 transition-shadow duration-200 flex flex-col">
      <div className="flex justify-end mb-2">
        <span className="text-[10px] text-on-surface-variant/60">
          {note.timeText || formatAssetRelativeTime(note.createdAt)}
        </span>
      </div>

      <div className="flex-1">
        {hasTitle && (
          <h3 className="text-sm font-medium text-on-surface mb-1 leading-snug line-clamp-2">
            {note.title}
          </h3>
        )}
        <p className="text-xs text-on-surface-variant whitespace-pre-wrap leading-relaxed line-clamp-4">
          {note.excerpt}
        </p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="mt-20 text-center py-16 border-2 border-dashed border-outline-variant/10 rounded-lg">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-surface-container-low flex items-center justify-center">
        <FileText className="w-6 h-6 text-on-surface-variant/40" />
      </div>
      <p className="text-sm text-on-surface-variant font-medium">暂无笔记</p>
      <p className="text-xs text-on-surface-variant/60 mt-2">
        从启动台/统一入口保存一条文本记录
      </p>
    </div>
  )
}

export function NotesClient({ notes }: { notes: AssetListItem[] }) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight mb-2 font-[family-name:var(--font-manrope)]">
          笔记
        </h1>
        <p className="text-sm text-on-surface-variant">
          从统一入口保存的文本记录，会整理在这里
        </p>
      </div>

      {notes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
