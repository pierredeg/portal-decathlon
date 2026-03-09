interface ProgressBarProps {
  completed: number
  total: number
}

export default function ProgressBar({ completed, total }: ProgressBarProps) {
  const percent = Math.round((completed / total) * 100)

  return (
    <div className="bg-white rounded-[12px] border border-grey-200 p-5" style={{ boxShadow: '0 1px 3px rgba(0,16,24,.08)' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-condensed font-bold text-grey-900 text-lg">Progression de votre dossier</h2>
          <p className="text-grey-600 text-sm mt-0.5">
            {completed === total
              ? 'Toutes les sections sont complètes !'
              : `${total - completed} section${total - completed > 1 ? 's' : ''} restante${total - completed > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="text-right">
          <span className="font-condensed font-bold text-2xl text-brand-500">{completed}</span>
          <span className="text-grey-600 text-sm">/{total}</span>
        </div>
      </div>

      {/* Bar */}
      <div className="h-2 bg-grey-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            background: completed === total ? '#008A3E' : '#3643BA',
          }}
        />
      </div>
    </div>
  )
}
