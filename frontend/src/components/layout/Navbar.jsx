import { Bell, Search, Play, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { pipelineService } from '../../services/api'
import toast from 'react-hot-toast'

export default function Navbar({ title }) {
  const [running, setRunning] = useState(false)

  const handleRunPipeline = async () => {
    setRunning(true)
    try {
      await pipelineService.run()
      toast.success('Pipeline started! Checking emails...')
    } catch {
      toast.error('Failed to start pipeline')
    } finally {
      setTimeout(() => setRunning(false), 3000)
    }
  }

  return (
    <header className="sticky top-0 z-10 bg-dark-900/80 backdrop-blur border-b border-white/5 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="font-display font-bold text-xl text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleRunPipeline}
          disabled={running}
          className="btn-primary text-sm"
        >
          {running ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
          {running ? 'Running...' : 'Run Pipeline'}
        </button>
        <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
          <Bell size={16} />
        </button>
      </div>
    </header>
  )
}
