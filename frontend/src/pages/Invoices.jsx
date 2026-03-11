import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { invoiceService } from '../services/api'
import Layout from '../components/layout/Layout'
import { StatusBadge, CategoryBadge } from '../components/ui/Badge'
import { Search, Trash2, Eye, FileText, ChevronUp, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const CATEGORIES = ['All', 'Office Expenses', 'Tools & Software', 'Travel & Petrol', 'Utilities', 'Other']
const STATUSES = ['All', 'Paid', 'Pending', 'Overdue']

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  useEffect(() => {
    let data = [...invoices]
    if (search) data = data.filter(i => i.vendor_name?.toLowerCase().includes(search.toLowerCase()) || i.invoice_number?.toLowerCase().includes(search.toLowerCase()))
    if (category !== 'All') data = data.filter(i => i.category === category)
    if (status !== 'All') data = data.filter(i => i.payment_status === status)
    data.sort((a, b) => {
      const va = a[sortKey] ?? '', vb = b[sortKey] ?? ''
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
    setFiltered(data)
  }, [invoices, search, category, status, sortKey, sortDir])

  const load = async () => {
    try {
      const data = await invoiceService.getAll()
      setInvoices(data)
    } catch { toast.error('Failed to load invoices') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this invoice?')) return
    try {
      await invoiceService.delete(id)
      setInvoices(prev => prev.filter(i => i.id !== id))
      toast.success('Invoice deleted')
    } catch { toast.error('Failed to delete') }
  }

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ k }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
    : <ChevronUp size={12} className="opacity-20" />

  return (
    <Layout title="Invoices">
      {/* Filters */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="card mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input className="input pl-9" placeholder="Search vendor or invoice #..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input w-auto" value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="text-white/40 text-sm self-center">{filtered.length} results</span>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 }} className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {[['vendor_name','Vendor'],['invoice_number','Invoice #'],['invoice_date','Date'],['total_amount','Amount'],['category','Category'],['payment_status','Status']].map(([k, label]) => (
                  <th key={k} onClick={() => toggleSort(k)} className="text-left px-5 py-4 text-white/50 font-medium cursor-pointer hover:text-white transition-colors select-none">
                    <div className="flex items-center gap-1.5">{label}<SortIcon k={k} /></div>
                  </th>
                ))}
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="text-center py-12 text-white/40">Loading invoices...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-white/40">No invoices found. Upload a bill or run the pipeline.</td></tr>
              )}
              {filtered.map((inv, i) => (
                <tr key={inv.id} className="border-b border-white/5 hover:bg-white/3 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center shrink-0">
                        <FileText size={12} className="text-primary-400" />
                      </div>
                      <span className="font-medium text-white">{inv.vendor_name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-white/60 text-xs">{inv.invoice_number || '—'}</td>
                  <td className="px-5 py-4 text-white/60">{inv.invoice_date || '—'}</td>
                  <td className="px-5 py-4 font-mono font-medium text-white">₹{parseFloat(inv.total_amount || 0).toLocaleString()}</td>
                  <td className="px-5 py-4"><CategoryBadge category={inv.category} /></td>
                  <td className="px-5 py-4"><StatusBadge status={inv.payment_status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/invoices/${inv.id}`} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-white/50 hover:text-rose-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </Layout>
  )
}
