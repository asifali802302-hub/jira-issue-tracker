import React from 'react'
import { Droppable } from '@hello-pangea/dnd'
import TicketCard from './TicketCard'
import { Plus } from 'lucide-react'

const COLUMN_CONFIG = {
  TODO: {
    title: 'TO DO',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    dotClass: 'bg-slate-400',
  },
  IN_PROGRESS: {
    title: 'IN PROGRESS',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    dotClass: 'bg-blue-400',
  },
  DONE: {
    title: 'DONE',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
  },
}

export default function KanbanColumn({ status, issues = [], onSelectTicket, onQuickCreate, projectKey }) {
  const config = COLUMN_CONFIG[status] || {
    title: status,
    badgeClass: 'bg-slate-800 text-slate-300',
    dotClass: 'bg-slate-400',
  }

  return (
    <div className="flex flex-col bg-slate-950/60 border border-slate-800/80 rounded-2xl w-full md:w-80 min-w-[280px] shrink-0 h-full max-h-[calc(100vh-210px)] overflow-hidden shadow-sm">
      {/* Column Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${config.dotClass}`} />
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">{config.title}</h3>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
            {issues.length}
          </span>
        </div>

        <button
          onClick={() => onQuickCreate(status)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={`Add issue to ${config.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 space-y-2.5 overflow-y-auto min-h-[150px] transition-colors duration-150 ${
              snapshot.isDraggingOver ? 'bg-blue-950/20 ring-1 ring-blue-500/30' : ''
            }`}
          >
            {issues.map((issue, index) => (
              <TicketCard
                key={issue.id}
                issue={issue}
                index={index}
                onSelectTicket={onSelectTicket}
                projectKey={projectKey}
              />
            ))}
            {provided.placeholder}

            {issues.length === 0 && !snapshot.isDraggingOver && (
              <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/70 rounded-xl text-slate-600 text-xs font-medium">
                No tickets
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
