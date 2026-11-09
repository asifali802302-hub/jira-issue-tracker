import React from 'react'
import { Draggable } from '@hello-pangea/dnd'
import {
  Bug,
  CheckSquare,
  Bookmark,
  Zap,
  ArrowUp,
  ArrowDown,
  Equal,
  ChevronsUp,
  User,
} from 'lucide-react'

export const getIssueTypeIcon = (type) => {
  switch (type) {
    case 'BUG':
      return <Bug className="w-3.5 h-3.5 text-rose-400" />
    case 'TASK':
      return <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
    case 'STORY':
      return <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
    case 'EPIC':
      return <Zap className="w-3.5 h-3.5 text-purple-400" />
    default:
      return <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
  }
}

export const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'URGENT':
      return (
        <span className="flex items-center text-red-500 text-[11px] font-bold" title="Urgent">
          <ChevronsUp className="w-3.5 h-3.5" />
        </span>
      )
    case 'HIGH':
      return (
        <span className="flex items-center text-amber-500 text-[11px] font-bold" title="High">
          <ArrowUp className="w-3.5 h-3.5" />
        </span>
      )
    case 'MEDIUM':
      return (
        <span className="flex items-center text-yellow-500 text-[11px]" title="Medium">
          <Equal className="w-3.5 h-3.5" />
        </span>
      )
    case 'LOW':
      return (
        <span className="flex items-center text-emerald-400 text-[11px]" title="Low">
          <ArrowDown className="w-3.5 h-3.5" />
        </span>
      )
    default:
      return null
  }
}

export default function TicketCard({ issue, index, onSelectTicket, projectKey }) {
  return (
    <Draggable draggableId={issue.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onSelectTicket(issue)}
          className={`p-3.5 rounded-xl border transition-all duration-150 cursor-pointer select-none group ${
            snapshot.isDragging
              ? 'bg-slate-800 border-blue-500 shadow-2xl scale-[1.02] ring-2 ring-blue-500/20 z-50'
              : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700 shadow-sm'
          }`}
        >
          {/* Title */}
          <p className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition line-clamp-2 mb-3">
            {issue.title}
          </p>

          {/* Bottom Row */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 text-slate-400">
            <div className="flex items-center gap-1.5">
              {getIssueTypeIcon(issue.type)}
              <span className="font-mono text-[11px] font-bold text-slate-400">
                {projectKey || 'ISSUE'}-{issue.id}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {getPriorityIcon(issue.priority)}

              {/* Assignee Avatar */}
              {issue.assignee ? (
                <div
                  className="w-5 h-5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 flex items-center justify-center text-[10px] font-bold"
                  title={`Assigned to: ${issue.assignee.name}`}
                >
                  {issue.assignee.name[0].toUpperCase()}
                </div>
              ) : (
                <div
                  className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center"
                  title="Unassigned"
                >
                  <User className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
