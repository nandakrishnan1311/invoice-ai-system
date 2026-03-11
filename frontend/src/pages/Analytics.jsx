import { useEffect, useState } from 'react'
import { invoiceService } from '../services/api'
import Layout from '../components/layout/Layout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const COLORS = { 'Office Expenses':'#6366f1','Tools & Software':'#22d3ee','Travel & Petrol':'#f59e0b','Utilities':'#10b981','Other':'#94a3b8' }

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [monthly, setMonthly] = useState([])

  useEffect(() => {
    Promise.all([invoiceService.getSummary(), invoiceService.getMonthly()])
      .then(([s, m]) => { setSummary(s); setMonthly(m) })
      .catch(() => toast.error('Failed to load analytics'))
  }, [])

  const categoryData = summary ? Object.entries(summary.category_totals || {}).map(([name, value]) => ({ name, value: Math.round(value), color: COLORS[name] || '#94a3b8' })) : []
  const statusData = summary ? Object.entries(summary.status_counts || {}).map(([name, value]) => ({ name, value })) : []
  const STATUS_COLORS = { Paid: '#10b981', Pending: '#f59e0b', Overdue: '#f43f5e' }

  const tooltipStyle = { contentStyle: { background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 } }

  return (
    <Layout title="Analytics">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        {/* Spend by Category Bar */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="card">
          <h2 className="font-display font-semibold text-white mb-1">Spend by Category</h2>
          <p className="text-white/40 text-sm mb-5">Total amount per expense category</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={categoryData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="#ffffff40" tick={{ fontSize: 10 }} />
              <YAxis stroke="#ffffff40" tick={{ fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Pie */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 }} className="card">
          <h2 className="font-display font-semibold text-white mb-1">Category Distribution</h2>
          <p className="text-white/40 text-sm mb-5">Percentage share of each category</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={3}>
                  {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {categoryData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-white/60">{d.name}</span>
                  </div>
                  <span className="text-white font-mono font-medium">₹{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.2 }} className="card">
          <h2 className="font-display font-semibold text-white mb-1">Monthly Trend</h2>
          <p className="text-white/40 text-sm mb-5">Total spend over time</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#ffffff40" tick={{ fontSize: 11 }} />
              <YAxis stroke="#ffffff40" tick={{ fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Payment Status */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.3 }} className="card">
          <h2 className="font-display font-semibold text-white mb-1">Payment Status</h2>
          <p className="text-white/40 text-sm mb-5">Invoice count by payment status</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="#ffffff40" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" stroke="#ffffff40" tick={{ fontSize: 12 }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" radius={[0,6,6,0]}>
                {statusData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </Layout>
  )
}
