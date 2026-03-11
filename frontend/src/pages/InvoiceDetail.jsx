import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { invoiceService } from '../services/api'
import Layout from '../components/layout/Layout'
import { StatusBadge, CategoryBadge } from '../components/ui/Badge'
import { ArrowLeft, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function InvoiceDetail() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState(null)

  useEffect(() => {
    invoiceService.getOne(id)
      .then(setInvoice)
      .catch(() => toast.error('Failed to load invoice'))
  }, [id])

  if (!invoice) return (
    <Layout title="Invoice Detail">
      <div className="flex items-center justify-center h-64 text-white/40">Loading...</div>
    </Layout>
  )

  return (
    <Layout title="Invoice Detail">
      <Link to="/invoices" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to invoices
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main Info */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="card xl:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                <FileText size={22} className="text-primary-400" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl text-white">{invoice.vendor_name}</h2>
                <p className="text-white/40 font-mono text-sm">{invoice.invoice_number}</p>
              </div>
            </div>
            <StatusBadge status={invoice.payment_status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[
              ['Invoice Date', invoice.invoice_date],
              ['Due Date', invoice.due_date],
              ['Total Amount', `₹${parseFloat(invoice.total_amount||0).toLocaleString()}`],
              ['Tax Amount', `₹${parseFloat(invoice.tax_amount||0).toLocaleString()}`],
            ].map(([label, val]) => (
              <div key={label} className="bg-white/3 rounded-xl p-3 border border-white/5">
                <p className="text-white/40 text-xs mb-1">{label}</p>
                <p className="text-white font-medium">{val || '—'}</p>
              </div>
            ))}
            <div className="bg-white/3 rounded-xl p-3 border border-white/5">
              <p className="text-white/40 text-xs mb-1">Category</p>
              <CategoryBadge category={invoice.category} />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h3 className="font-display font-semibold text-white mb-3">Line Items</h3>
            {!invoice.line_items?.length && <p className="text-white/40 text-sm">No line items extracted.</p>}
            {invoice.line_items?.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Description','Qty','Unit Price','Total'].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-white/40 font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.line_items.map((item, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-3 px-3 text-white">{item.description}</td>
                      <td className="py-3 px-3 text-white/60">{item.quantity}</td>
                      <td className="py-3 px-3 font-mono text-white/60">₹{parseFloat(item.unit_price||0).toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono font-medium text-white">₹{parseFloat(item.item_total||0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Side Info */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: 0.1 }} className="card h-fit">
          <h3 className="font-display font-semibold text-white mb-4">File Info</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">File path</span>
              <span className="text-white/70 font-mono text-xs text-right max-w-[150px] truncate">{invoice.file_path || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Added</span>
              <span className="text-white/70">{invoice.created_at?.split('T')[0] || '—'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
