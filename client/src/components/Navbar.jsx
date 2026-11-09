import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Kanban, LogOut, Plus, Shield, User, Layers } from 'lucide-react'

export default function Navbar({ onOpenCreateTicket, onOpenCreateProject, currentProject }) {
  const { user, logout, isManager } = useAuth()

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-inner">
            <Kanban className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white tracking-tight">IssueTracker</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                Jira Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {currentProject ? `Active: ${currentProject.name} (${currentProject.key})` : 'Enterprise Agile Issue & Bug Tracking'}
            </p>
          </div>
        </div>

        {/* Actions & Profile */}
        <div className="flex items-center gap-3">
          {isManager && (
            <button
              onClick={onOpenCreateProject}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
              title="Create New Project"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>New Project</span>
            </button>
          )}

          {currentProject && (
            <button
              onClick={onOpenCreateTicket}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Issue</span>
            </button>
          )}

          {/* User Info */}
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl">
            <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center font-bold text-[11px]">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="font-semibold text-white leading-tight truncate max-w-[110px]">{user?.name}</p>
              <p className="text-[10px] text-blue-400 flex items-center gap-0.5">
                <Shield className="w-2.5 h-2.5" />
                {user?.role?.replace('ROLE_', '')}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
