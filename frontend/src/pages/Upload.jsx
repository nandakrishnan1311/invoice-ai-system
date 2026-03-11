import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { invoiceService } from '../services/api'
import Layout from '../components/layout/Layout'
import { Upload, FileText, CheckCircle, XCircle, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

export default function UploadPage() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(accepted => {
    const newFiles = accepted.map(f => ({ file: f, status: 'pending', result: null }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png', '.tiff'] },
    multiple: true
  })

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i))

  const handleUpload = async () => {
    const pending = files.filter(f => f.status === 'pending')
    if (!pending.length) return toast.error('No pending files')
    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue
      setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'processing' } : f))
      try {
        const result = await invoiceService.upload(files[i].file)
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'success', result } : f))
      } catch (e) {
        setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', result: e.message } : f))
      }
    }
    setUploading(false)
    toast.success('Upload complete!')
  }

  const statusIcon = (status) => {
    if (status === 'processing') return <Loader2 size={15} className="animate-spin text-primary-400" />
    if (status === 'success') return <CheckCircle size={15} className="text-green-400" />
    if (status === 'error') return <XCircle size={15} className="text-rose-400" />
    return <FileText size={15} className="text-white/40" />
  }

  return (
    <Layout title="Upload Bills">
      <div className="max-w-2xl mx-auto">
        {/* Drop Zone */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="card mb-4">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive ? 'border-primary-500 bg-primary-500/5' : 'border-white/10 hover:border-primary-500/50 hover:bg-white/3'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
              <Upload size={24} className="text-primary-400" />
            </div>
            <p className="font-display font-semibold text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop bills here'}
            </p>
            <p className="text-white/40 text-sm mb-4">Supports PDF, JPG, PNG, TIFF — scanned or digital</p>
            <span className="btn-ghost inline-flex">Browse files</span>
          </div>
        </motion.div>

        {/* File List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="card mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-white">{files.length} file(s) queued</h3>
                <button onClick={() => setFiles([])} className="text-white/40 hover:text-white text-sm transition-colors">Clear all</button>
              </div>
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${
                    f.status === 'success' ? 'border-green-500/20 bg-green-500/5' :
                    f.status === 'error' ? 'border-rose-500/20 bg-rose-500/5' :
                    'border-white/5 bg-white/3'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      {statusIcon(f.status)}
                      <div className="min-w-0">
                        <p className="text-sm text-white truncate">{f.file.name}</p>
                        <p className="text-xs text-white/40">{(f.file.size / 1024).toFixed(1)} KB</p>
                        {f.result?.vendor && <p className="text-xs text-green-400 mt-0.5">Vendor: {f.result.vendor}</p>}
                      </div>
                    </div>
                    {f.status === 'pending' && (
                      <button onClick={() => removeFile(i)} className="text-white/30 hover:text-white p-1 transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {files.some(f => f.status === 'pending') && (
          <motion.button
            initial={{ opacity:0 }} animate={{ opacity:1 }}
            onClick={handleUpload}
            disabled={uploading}
            className="btn-primary w-full justify-center"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Processing with AI...' : `Upload & Extract ${files.filter(f => f.status === 'pending').length} file(s)`}
          </motion.button>
        )}
      </div>
    </Layout>
  )
}
