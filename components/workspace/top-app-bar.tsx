"use client";

import Image from "next/image";
import { Bell, HelpCircle, LayoutGrid } from "lucide-react";

type TopAppBarProps = {
  userName: string
  userImage?: string | null
}

export function TopAppBar({ userName, userImage }: TopAppBarProps) {
  const fallbackInitial = userName.trim().slice(0, 1).toUpperCase() || 'G'

  return (
    <header className="h-14 w-full sticky top-0 bg-slate-50 dark:bg-slate-950 flex justify-between items-center px-6 z-40 font-[family-name:var(--font-manrope)] tracking-tight text-sm">
      <h2 className="text-lg font-bold text-blue-700 dark:text-blue-400">
        首页工作台
      </h2>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <button
            className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-300 transition-colors active:opacity-70"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-300 transition-colors active:opacity-70"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-300 transition-colors active:opacity-70"
            aria-label="Apps"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden cursor-pointer border border-slate-200 dark:border-slate-800">
          {userImage ? (
            <Image
              alt={`${userName} 的头像`}
              className="h-full w-full object-cover"
              height={32}
              src={userImage}
              width={32}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300">
              {fallbackInitial}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}