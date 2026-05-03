"use client"
import { useEffect } from 'react'

type Toast = {
  id: number
  type: 'success' | 'error' | 'info'
  message: string
}

export default function Toasts({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timers = toasts.map(t => {
      return setTimeout(() => onRemove(t.id), 5000)
    })
    return () => timers.forEach(t => clearTimeout(t))
  }, [toasts, onRemove])

  if (!toasts || toasts.length === 0) return null

  const meta = {
    success: {
      title: 'Success',
      icon: '✓',
      ring: 'ring-emerald-400/30',
      bar: 'from-emerald-300 via-emerald-400 to-teal-400',
      shell: 'from-emerald-500/15 via-emerald-500/10 to-cyan-500/10',
    },
    error: {
      title: 'Attention',
      icon: '!',
      ring: 'ring-rose-400/30',
      bar: 'from-rose-300 via-rose-400 to-orange-400',
      shell: 'from-rose-500/15 via-rose-500/10 to-orange-500/10',
    },
    info: {
      title: 'Heads up',
      icon: 'i',
      ring: 'ring-sky-400/30',
      bar: 'from-sky-300 via-indigo-400 to-violet-400',
      shell: 'from-sky-500/15 via-indigo-500/10 to-violet-500/10',
    },
  }

  return (
    <>
      <div className="fixed left-1/2 top-4 z-50 flex w-[min(92vw,24rem)] -translate-x-1/2 flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto relative overflow-hidden rounded-2xl border border-white/20 bg-white/90 backdrop-blur-xl shadow-[0_20px_45px_rgba(15,23,42,0.18)] ring-1 ${meta[t.type].ring} animate-[toastIn_.28s_ease-out]`}
        >
          <div className={`h-1 w-full bg-gradient-to-r ${meta[t.type].bar}`} />
          <div className={`absolute inset-0 bg-gradient-to-br ${meta[t.type].shell} pointer-events-none`} />
          <div className="relative flex items-start gap-3 p-4">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta[t.type].bar} text-white font-black shadow-lg`}>
              <span className="text-base leading-none">{meta[t.type].icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{meta[t.type].title}</p>
                <button
                  type="button"
                  onClick={() => onRemove(t.id)}
                  className="rounded-full p-1 text-slate-500 transition hover:bg-slate-900/5 hover:text-slate-900"
                  aria-label="Dismiss notification"
                >
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 10-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 10-1.06-1.06L10 8.94 6.28 5.22z"/></svg>
                </button>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-700">{t.message}</p>
            </div>
          </div>
          <div className="relative h-1 overflow-hidden bg-slate-200/70">
            <div className={`h-full w-full origin-left bg-gradient-to-r ${meta[t.type].bar} animate-[toastTime_5s_linear_forwards]`} />
          </div>
        </div>
      ))}
      </div>
      <style jsx>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes toastTime {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </>
  )
}
