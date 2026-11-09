import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { projectAPI, issueAPI, authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import KanbanBoard from '../components/KanbanBoard'
import TicketModal from '../components/TicketModal'
import CreateTicketModal from '../components/CreateTicketModal'
import CreateProjectModal from '../components/CreateProjectModal'
import { getIssueTypeIcon, getPriorityIcon } from '../components/TicketCard'
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Bug,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Trash2,
  FolderOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [issues, setIssues] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState('KANBAN') // 'KANBAN' or 'LIST'

  // Modals
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [defaultStatusForNewTicket, setDefaultStatusForNewTicket] = useState('TODO')

  // Load Projects & Users
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      const [projRes, usersRes] = await Promise.all([
        projectAPI.getAll(),
        authAPI.getAllUsers(),
      ])

      setProjects(projRes.data)
      setUsers(usersRes.data)

      if (projRes.data.length > 0) {
        // If current project not selected yet, pick first
        setCurrentProject((prev) => prev || projRes.data[0])
      }
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // Load issues when currentProject changes
  const loadIssues = useCallback(async () => {
    if (!currentProject) return
    try {
      const res = await issueAPI.getByProject(currentProject.id)
      setIssues(res.data)
    } catch {
      toast.error('Failed to load tickets')
    }
  }, [currentProject])

  useEffect(() => {
    loadIssues()
  }, [loadIssues])

  // Create Project
  const handleCreateProject = async (data) => {
    try {
      const res = await projectAPI.create(data)
      toast.success('Project created!')
      setProjects((prev) => [...prev, res.data])
      setCurrentProject(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project')
      throw err
    }
  }

  // Create Ticket
  const handleCreateTicket = async (data) => {
    try {
      const res = await issueAPI.create(data)
      toast.success('Issue created!')
      setIssues((prev) => [res.data, ...prev])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create issue')
      throw err
    }
  }

  // Update Ticket
  const handleIssueUpdated = (updated) => {
    setIssues((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
  }

  // Delete Ticket
  const handleIssueDeleted = (id) => {
    setIssues((prev) => prev.filter((item) => item.id !== id))
  }

  // Handle Drag & Drop across columns
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const issueId = parseInt(draggableId)
    const newStatus = destination.droppableId
    const newOrderIndex = destination.index

    // Optimistically update UI
    setIssues((prev) =>
      prev.map((item) =>
        item.id === issueId
          ? { ...item, status: newStatus, orderIndex: newOrderIndex }
          : item
      )
    )

    try {
      await issueAPI.updateStatus(issueId, {
        status: newStatus,
        orderIndex: newOrderIndex,
      })
    } catch {
      toast.error('Failed to sync ticket position')
      loadIssues() // rollback on error
    }
  }

  const handleQuickCreate = (status) => {
    setDefaultStatusForNewTicket(status)
    setIsCreateTicketOpen(true)
  }

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (issue.description && issue.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchType = typeFilter === 'ALL' || issue.type === typeFilter
      const matchPriority = priorityFilter === 'ALL' || issue.priority === priorityFilter
      return matchSearch && matchType && matchPriority
    })
  }, [issues, searchTerm, typeFilter, priorityFilter])

  // Stats calculation
  const stats = useMemo(() => {
    const total = issues.length
    const inProgress = issues.filter((i) => i.status === 'IN_PROGRESS').length
    const done = issues.filter((i) => i.status === 'DONE').length
    const bugs = issues.filter((i) => i.type === 'BUG' && i.status !== 'DONE').length
    return { total, inProgress, done, bugs }
  }, [issues])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        onOpenCreateTicket={() => {
          setDefaultStatusForNewTicket('TODO')
          setIsCreateTicketOpen(true)
        }}
        onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        currentProject={currentProject}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col space-y-6">
        {/* Project Selector Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Select Project</p>
              {projects.length > 0 ? (
                <select
                  value={currentProject?.id || ''}
                  onChange={(e) => {
                    const found = projects.find((p) => p.id === parseInt(e.target.value))
                    if (found) setCurrentProject(found)
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-sm font-bold text-white outline-none focus:border-blue-500 mt-0.5 cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.key})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-slate-500">No projects found. Create one!</span>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Total</span>
              <p className="text-sm font-extrabold text-white">{stats.total}</p>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-blue-400 font-bold uppercase">Active</span>
              <p className="text-sm font-extrabold text-blue-400">{stats.inProgress}</p>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Done</span>
              <p className="text-sm font-extrabold text-emerald-400">{stats.done}</p>
            </div>
            <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-rose-400 font-bold uppercase">Bugs</span>
              <p className="text-sm font-extrabold text-rose-400">{stats.bugs}</p>
            </div>
          </div>
        </div>

        {/* Filter and View Mode Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="BUG">Bugs Only</option>
              <option value="TASK">Tasks Only</option>
              <option value="STORY">Stories Only</option>
              <option value="EPIC">Epics Only</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-blue-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* View Switcher (Kanban vs List) */}
          <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'KANBAN' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'LIST' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>

        {/* Main Board or List View */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs">Loading project board...</p>
          </div>
        ) : !currentProject ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl text-center p-6">
            <Layers className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Projects Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Get started by creating your first agile project to organize issues and track bugs on the Kanban board.
            </p>
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Project</span>
            </button>
          </div>
        ) : viewMode === 'KANBAN' ? (
          <div className="flex-1">
            <KanbanBoard
              issues={filteredIssues}
              onDragEnd={handleDragEnd}
              onSelectTicket={(ticket) => setSelectedTicket(ticket)}
              onQuickCreate={handleQuickCreate}
              projectKey={currentProject.key}
            />
          </div>
        ) : (
          /* Table / List View */
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                  <th className="p-3.5 font-semibold">Key</th>
                  <th className="p-3.5 font-semibold">Type</th>
                  <th className="p-3.5 font-semibold">Title</th>
                  <th className="p-3.5 font-semibold">Status</th>
                  <th className="p-3.5 font-semibold">Priority</th>
                  <th className="p-3.5 font-semibold">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => setSelectedTicket(issue)}
                    className="hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    <td className="p-3.5 font-mono font-bold text-blue-400">
                      {currentProject.key}-{issue.id}
                    </td>
                    <td className="p-3.5">{getIssueTypeIcon(issue.type)}</td>
                    <td className="p-3.5 font-semibold text-white max-w-xs truncate">{issue.title}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {issue.status}
                      </span>
                    </td>
                    <td className="p-3.5">{getPriorityIcon(issue.priority)}</td>
                    <td className="p-3.5 text-slate-400">{issue.assignee?.name || 'Unassigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        onCreateTicket={handleCreateTicket}
        projectId={currentProject?.id}
        users={users}
        defaultStatus={defaultStatusForNewTicket}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreateProject={handleCreateProject}
        users={users}
      />

      <TicketModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        issue={selectedTicket}
        onIssueUpdated={handleIssueUpdated}
        onIssueDeleted={handleIssueDeleted}
        users={users}
        projectKey={currentProject?.key}
      />
    </div>
  )
}
