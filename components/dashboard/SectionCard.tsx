'use client'

import Link from 'next/link'

interface SectionCardProps {
  title: string
  description: string
  icon: string
  href: string
  completed: boolean
  required: boolean
  enrichedBadge?: boolean
}

export default function SectionCard({ title, description, icon, href, completed, required, enrichedBadge }: SectionCardProps) {
  return (
    <div
      className={`bg-white rounded-[12px] border p-5 flex flex-col gap-4 transition-all ${
        completed ? 'border-success/30 bg-success/5' : 'border-grey-200 hover:border-brand-500/40 hover:shadow-md'
      }`}
      style={{ boxShadow: '0 1px 3px rgba(0,16,24,.08), 0 1px 2px rgba(0,16,24,.06)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            completed ? 'bg-success/10' : 'bg-brand-50'
          }`}
        >
          <i className={`${icon} text-lg ${completed ? 'text-success' : 'text-brand-500'}`} />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {completed && (
              <span className="inline-flex items-center gap-1 text-success text-xs font-medium">
                <i className="ri-check-line" />
                Complété
              </span>
            )}
            {!required && (
              <span className="text-grey-600 text-xs">Optionnel</span>
            )}
          </div>
          {enrichedBadge && (
            <span className="inline-flex items-center gap-0.5 text-info text-[10px] font-medium bg-info/5 border border-info/20 px-1.5 py-[2px] rounded-full">
              <i className="ri-government-line text-[10px]" />
              Registres officiels
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-condensed font-bold text-grey-900 text-base">{title}</h3>
        <p className="text-grey-600 text-sm leading-relaxed">{description}</p>
      </div>

      <div className="mt-auto">
        {completed ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-grey-600 text-sm font-medium border border-grey-200 rounded-[100px] px-4 py-1.5 hover:border-grey-300 hover:text-grey-900 transition-colors"
          >
            <i className="ri-pencil-line text-sm" />
            Modifier
          </Link>
        ) : (
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-white text-sm font-bold bg-brand-500 hover:bg-brand-600 rounded-[100px] px-4 py-2 transition-colors"
          >
            Compléter
            <i className="ri-arrow-right-line text-sm" />
          </Link>
        )}
      </div>
    </div>
  )
}
