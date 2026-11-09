import React, { useMemo } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import KanbanColumn from './KanbanColumn'

const COLUMNS = ['TODO', 'IN_PROGRESS', 'DONE']

export default function KanbanBoard({
  issues = [],
  onDragEnd,
  onSelectTicket,
  onQuickCreate,
  projectKey,
}) {
  // Group issues by status
  const columnsData = useMemo(() => {
    const map = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    }

    issues.forEach((issue) => {
      const status = issue.status || 'TODO'
      if (map[status]) {
        map[status].push(issue)
      } else {
        map.TODO.push(issue)
      }
    })

    return map
  }, [issues])

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 h-full min-h-[500px]">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            issues={columnsData[status] || []}
            onSelectTicket={onSelectTicket}
            onQuickCreate={onQuickCreate}
            projectKey={projectKey}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
