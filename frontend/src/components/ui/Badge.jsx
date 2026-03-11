const statusConfig = {
  Paid:    { bg: 'bg-green-500/10',  text: 'text-green-400',  dot: 'bg-green-400' },
  Pending: { bg: 'bg-amber-500/10',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  Overdue: { bg: 'bg-rose-500/10',   text: 'text-rose-400',   dot: 'bg-rose-400'  },
}

const categoryConfig = {
  'Office Expenses':  { bg: 'bg-blue-500/10',   text: 'text-blue-400'   },
  'Tools & Software': { bg: 'bg-purple-500/10', text: 'text-purple-400' },
  'Travel & Petrol':  { bg: 'bg-orange-500/10', text: 'text-orange-400' },
  'Utilities':        { bg: 'bg-cyan-500/10',   text: 'text-cyan-400'   },
  'Other':            { bg: 'bg-gray-500/10',   text: 'text-gray-400'   },
}

export function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.Pending
  return (
    <span className={`badge ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />
      {status}
    </span>
  )
}

export function CategoryBadge({ category }) {
  const cfg = categoryConfig[category] || categoryConfig.Other
  return (
    <span className={`badge ${cfg.bg} ${cfg.text}`}>{category}</span>
  )
}
