import Layout from '../components/layout/Layout'
import { motion } from 'framer-motion'
import { Save, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Settings() {
  const [show, setShow] = useState({})
  const toggle = (k) => setShow(p => ({ ...p, [k]: !p[k] }))

  const sections = [
    {
      title: 'AI Provider',
      desc: 'Choose which AI model to use for invoice extraction',
      fields: [
        { key: 'AI_PROVIDER', label: 'Provider', type: 'select', options: ['gemini', 'openai', 'huggingface'] },
        { key: 'GEMINI_API_KEY', label: 'Gemini API Key', type: 'password' },
        { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', type: 'password' },
        { key: 'HUGGINGFACE_API_KEY', label: 'HuggingFace Token', type: 'password' },
        { key: 'HF_MODEL', label: 'HF Model', type: 'text', placeholder: 'mistralai/Mistral-7B-Instruct-v0.3' },
      ]
    },
    {
      title: 'Email Configuration',
      desc: 'Connect your inbox for automatic invoice monitoring',
      fields: [
        { key: 'EMAIL_ADDRESS', label: 'Email Address', type: 'email', placeholder: 'you@gmail.com' },
        { key: 'EMAIL_PASSWORD', label: 'App Password', type: 'password' },
        { key: 'IMAP_SERVER', label: 'IMAP Server', type: 'text', placeholder: 'imap.gmail.com' },
        { key: 'IMAP_PORT', label: 'IMAP Port', type: 'text', placeholder: '993' },
      ]
    },
    {
      title: 'System',
      desc: 'Local paths and OCR configuration',
      fields: [
        { key: 'TESSERACT_CMD', label: 'Tesseract Path', type: 'text', placeholder: 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe' },
        { key: 'BILLS_DIR', label: 'Bills Directory', type: 'text', placeholder: 'bills' },
        { key: 'REPORTS_DIR', label: 'Reports Directory', type: 'text', placeholder: 'reports' },
      ]
    }
  ]

  return (
    <Layout title="Settings">
      <div className="max-w-2xl mx-auto space-y-4">
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
          ⚠️ Settings are configured via the <code className="font-mono bg-black/20 px-1 rounded">.env</code> file in the backend folder. This page shows the current config reference.
        </motion.div>

        {sections.map((section, si) => (
          <motion.div key={si} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: si * 0.1 }} className="card">
            <h2 className="font-display font-semibold text-white mb-1">{section.title}</h2>
            <p className="text-white/40 text-sm mb-5">{section.desc}</p>
            <div className="space-y-3">
              {section.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-white/60 text-xs mb-1.5">{field.label}</label>
                  <div className="relative">
                    {field.type === 'select' ? (
                      <select className="input">
                        {field.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type === 'password' && !show[field.key] ? 'password' : 'text'}
                        className="input pr-10"
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                        disabled
                      />
                    )}
                    {field.type === 'password' && (
                      <button onClick={() => toggle(field.key)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                        {show[field.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: 0.4 }} className="card">
          <h2 className="font-display font-semibold text-white mb-2">How to configure</h2>
          <div className="bg-dark-900 rounded-xl p-4 font-mono text-xs text-green-400 space-y-1">
            <p># 1. Copy the example file</p>
            <p className="text-white/60">cp backend/.env.example backend/.env</p>
            <p className="mt-2"># 2. Edit with your values</p>
            <p className="text-white/60">nano backend/.env</p>
            <p className="mt-2"># 3. Restart the backend</p>
            <p className="text-white/60">uvicorn app:app --reload</p>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
