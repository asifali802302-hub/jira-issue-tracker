import React, { useState } from 'react'
import { FolderPlus, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateProjectModal({ isOpen, onClose, onCreateProject, users = [] }) {
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState([])
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleNameChange = (val) => {
    setName(val)
    if (!key || key.length < 3) {
      // Auto suggest key from name
      const suggested = val.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase()
      if (suggested) setKey(suggested)
    }
  }

  const toggleMember = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !key.trim()) {
      toast.error('Project Name and Key are required')
      return
    }

    setSubmitting(true)
    try {
      await onCreateProject({
        name: name.trim(),
        key: key.trim().toUpperCase(),
        description: description.trim(),
        memberIds: selectedMemberIds,
      })
      setName('')
      setKey('')
      setDescription('')
      setSelectedMemberIds([])
      onClose()
    } catch {
      // Ignored
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-lg text-white">Create New Project</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Project Name</label>
            <input
              type="text"
              required
              placeholder="e.g. NextGen Mobile Banking"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Project Key (Short Prefix)</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="e.g. NMB"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-white placeholder-slate-500 outline-none transition uppercase"
            />
            <p className="text-[11px] text-slate-500 mt-1">Used as the ticket ID prefix (e.g. {key || 'PROJ'}-101)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Brief summary of project goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-xs text-slate-200 outline-none transition resize-none"
            />
          </div>

          {/* Members */}
          {users.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Add Team Members</label>
              <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
                {users.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-2.5 p-1.5 hover:bg-slate-900 rounded-lg cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.includes(u.id)}
                      onChange={() => toggleMember(u.id)}
                      className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-0"
                    />
                    <span className="font-medium text-slate-200">{u.name}</span>
                    <span className="text-[10px] text-slate-500">({u.email})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition"
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
