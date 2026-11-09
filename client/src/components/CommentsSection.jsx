import React, { useState, useEffect, useCallback } from 'react'
import { commentAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CommentsSection({ issueId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      const res = await commentAPI.getByIssue(issueId)
      setComments(res.data)
    } catch {
      // Ignored
    } finally {
      setLoading(false)
    }
  }, [issueId])

  useEffect(() => {
    if (issueId) {
      fetchComments()
    }
  }, [issueId, fetchComments])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const res = await commentAPI.create(issueId, { content: newComment.trim() })
      setComments((prev) => [...prev, res.data])
      setNewComment('')
      toast.success('Comment posted!')
    } catch {
      toast.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await commentAPI.delete(commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      toast.success('Comment deleted')
    } catch {
      toast.error('Could not delete comment')
    }
  }

  return (
    <div className="space-y-4 pt-4 border-t border-slate-800">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
        <MessageSquare className="w-4 h-4 text-blue-400" />
        <h4>Activity & Discussion ({comments.length})</h4>
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleAddComment} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a comment or status update..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
        />
        <button
          type="submit"
          disabled={submitting || !newComment.trim()}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Post</span>
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-xs text-slate-500 py-3 text-center">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-slate-600 py-3 text-center italic">No comments yet. Start the discussion!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[10px]">
                    {c.author?.name ? c.author.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="font-semibold text-slate-200">{c.author?.name}</span>
                  <span className="text-[10px] text-slate-500">
                    {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>

                {user?.id === c.author?.id && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="text-slate-500 hover:text-rose-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-slate-300 pl-7 text-[12px] leading-relaxed whitespace-pre-wrap">{c.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
