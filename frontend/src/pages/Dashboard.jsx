import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { invoiceService, reportService } from '../services/api'
import Layout from '../components/layout/Layout'
import KPICard from '../components/dashboard/KPICard'
import { StatusBadge, CategoryBadge } from '../components/ui/Badge'
import { FileText, DollarSign, AlertCircle, CheckCircle, Download, Loader2, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const COLORS = ['#6366f1','#22d3ee','#f59e0b','#10b981','#f43f5e']
const CATEGORY_COLORS = {
  'Office Expenses': '#6366f1',
  'Tools & Software': '#22d3ee',
  'Travel & Petrol': '#f59e0b',
  'Utilities': '#10b981',
  'Other': '#94a3b8'
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [recentInvoices, setRecentInvoices] = useState([])
  const [generatingReport, setGeneratingReport] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      invoiceService.getSummary(),
      invoiceService.getMonthly(),
      invoiceService.getAll()
    ]).then(([s, m, invs]) => {
      setSummary(s)
      setMonthly(m)
      setRecentInvoices(invs.slice(0, 6))
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false))
  }, [])

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    try {
      const res = await reportService.generate()
      const url = reportService.downloadUrl(res.filename)
      window.open(url, '_blank')
      toast.success('Report generated & downloaded!')
    } catch {
      toast.error('Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
  }

  const categoryData = summary ? Object.entries(summary.category_totals || {}).map(([name, value]) => ({ name, value: Math.round(value) })) : []

  return (
    <Layout title="Dashboard">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard title="Total Invoices" value={summary?.total_invoices ?? '—'} icon={FileText} color="indigo" index={0} />
        <KPICard title="Total Spend" value={summary ? `₹${summary.total_spend.toLocaleString()}` : '—'} icon={DollarSign} color="green" index={1} />
        <KPICard title="Pending" value={summary?.status_counts?.Pending ?? 0} icon={AlertCircle} color="amber" index={2} />
        <KPICard title="Paid" value={summary?.status_counts?.Paid ?? 0} icon={CheckCircle} color="indigo" index={3} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 mb-6">
        {/* Monthly Trend */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.35 }} className="card xl:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-semibold text-white">Monthly Spend</h2>
              <p className="text-white/40 text-sm mt-0.5">Expense trend over time</p>
            </div>
            <TrendingUp size={18} className="text-primary-400" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#ffffff40" tick={{ fontSize: 11 }} />
              <YAxis stroke="#ffffff40" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.4 }} className="card xl:col-span-2">
          <div className="mb-4">
            <h2 className="font-display font-semibold text-white">By Category</h2>
            <p className="text-white/40 text-sm mt-0.5">Spend distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {categoryData.slice(0, 4).map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[d.name] || COLORS[i] }} />
                  <span className="text-white/60 truncate max-w-[120px]">{d.name}</span>
                </div>
                <span className="text-white font-medium font-mono">₹{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Invoices + Generate Report */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.45 }} className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white">Recent Invoices</h2>
            <Link to="/invoices" className="text-primary-400 hover:text-primary-300 text-sm transition-colors">View all →</Link>
          </div>
          <div className="space-y-2">
            {recentInvoices.length === 0 && <p className="text-white/40 text-sm text-center py-8">No invoices yet. Upload one or run the pipeline.</p>}
            {recentInvoices.map(inv => (
              <Link to={`/invoices/${inv.id}`} key={inv.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <FileText size={14} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-primary-300 transition-colors">{inv.vendor_name}</p>
                    <p className="text-xs text-white/40">{inv.invoice_date || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CategoryBadge category={inv.category} />
                  <StatusBadge status={inv.payment_status} />
                  <span className="text-white font-mono text-sm">₹{parseFloat(inv.total_amount || 0).toLocaleString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.5 }} className="card">
          <h2 className="font-display font-semibold text-white mb-2">Generate Report</h2>
          <p className="text-white/40 text-sm mb-6">Export all invoices and analytics to Excel with charts.</p>
          <button onClick={handleGenerateReport} disabled={generatingReport} className="btn-primary w-full justify-center">
            {generatingReport ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {generatingReport ? 'Generating...' : 'Download Excel Report'}
          </button>
          <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/5">
            <p className="text-xs text-white/40 mb-1">Report includes:</p>
            {['Full invoice list', 'Line items breakdown', 'Category summary + charts'].map((t, i) => (
              <div key={i} className="flex items-center gap-2 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                <span className="text-xs text-white/60">{t}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
