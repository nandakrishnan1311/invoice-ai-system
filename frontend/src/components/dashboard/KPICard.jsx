import { motion } from 'framer-motion'

const colorMap = {
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  green:  'bg-green-500/10 text-green-400 border-green-500/20',
  amber:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  rose:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

export default function KPICard({ title, value, subtitle, icon: Icon, color = 'indigo', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={18} />
        </div>
        {subtitle && (
          <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-lg">{subtitle}</span>
        )}
      </div>
      <p className="text-3xl font-display font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-white/50">{title}</p>
    </motion.div>
  )
}
