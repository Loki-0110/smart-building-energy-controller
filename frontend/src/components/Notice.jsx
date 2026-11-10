import { AlertCircle, CheckCircle2, X } from 'lucide-react'
export default function Notice({ notice, onClose }) {
  if (!notice) return null
  return (
    <div className={`notice ${notice.type || 'error'}`}>
      {notice.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
      <span>{notice.message}</span>
      {onClose && <button className="notice-close" onClick={onClose}><X size={16}/></button>}
    </div>
  )
}
