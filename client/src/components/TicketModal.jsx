import React, { useState, useEffect } from 'react'
import { issueAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import CommentsSection from './CommentsSection'
import { getIssueTypeIcon, getPriorityIcon } from './TicketCard'
import { X, Trash2, Calendar, User, Check, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TicketModal({
  isOpen,
  onClose,
  issue,
  onIssueUpdated,
  onIssueDeleted,
  users = [],
  projectKey,
}) {
  const { user, isManager } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('TODO')
  const [priority, setPriority] = useState('MEDIUM')
  const [type, setType] = useState('BUG')
  const [assigneeId, setAssigneeId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (issue) {
      setTitle(issue.title || '')
      setDescription(issue.description || '')
      setStatus(issue.status || 'TODO')
      setPriority(issue.priority || 'MEDIUM')
      setType(issue.type || 'BUG')
      setAssigneeId(issue.assignee ? issue.assignee.id.toString() : '')
    }
  }, [issue])

  if (!isOpen || !issue) return null

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        type,
        projectId: issue.project.id,
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
      }
      const res = await issueAPI.update(issue.id, payload)
      toast.success('Ticket updated!')
      onIssueUpdated(res.data)
      onClose()
    } catch {
      toast.error('Failed to update ticket')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return
    try {
      await issueAPI.delete(issue.id)
      toast.success('Ticket deleted')
      onIssueDeleted(issue.id)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete ticket')
    }
  }

  const canDelete =
    isManager ||
    user?.id === issue.reporter?.id ||
    user?.id === issue.project?.owner?.id

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            {getIssueTypeIcon(type)}
            <span className="font-mono text-xs font-bold text-blue-400">
              {projectKey || 'ISSUE'}-{issue.id}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Created by {issue.reporter?.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                title="Delete ticket"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-sm font-semibold text-white outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Add details, steps to reproduce, or acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl p-3 text-xs text-slate-200 outline-none transition resize-none"
            />
          </div>

          {/* Grid Settings: Status, Priority, Type, Assignee */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="BUG">Bug</option>
                <option value="TASK">Task</option>
                <option value="STORY">Story</option>
                <option value="EPIC">Epic</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

          {/* Discussion comments */}
          <CommentsSection issueId={issue.id} />
        </form>
      </div>
    </div>
  )
}
