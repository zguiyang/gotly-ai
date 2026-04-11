"use client";

import { Bot, Package, Bookmark, CheckSquare } from "lucide-react";

const navItems = [
  { icon: Bot, label: "助手", href: "#", active: true },
  { icon: Package, label: "全部", href: "#" },
  { icon: Bookmark, label: "收藏", href: "#" },
  { icon: CheckSquare, label: "待办", href: "#" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-100 dark:bg-slate-900 flex flex-col py-6 px-4 font-[family-name:var(--font-manrope)] text-sm font-medium z-50">
      <div className="flex flex-col mb-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-blue-700 dark:text-blue-400">
              Gotly AI
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
              Quiet Architect
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 ease-in-out group ${
                item.active
                  ? "text-blue-700 dark:text-blue-400 font-bold border-r-2 border-blue-700 bg-slate-200/50 dark:bg-slate-800/50"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
              }`}
              href={item.href}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}