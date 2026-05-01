import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DatePicker from 'react-datepicker'
import { useEffect, useMemo, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import type { TodoTask, TodoTaskDraft } from '../types'

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4 16.5V20h3.5L19 8.5 15.5 5 4 16.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 6.5l3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5 7h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 7V5.5h6V7M8.4 7l.6 11h6l.6-11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5.5 12.5l4 4L18.5 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M7 4v2M17 4v2M4.5 9h15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <rect
        x="4.5"
        y="6"
        width="15"
        height="13"
        rx="2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

const INITIAL_TASKS: TodoTask[] = [
  { id: 'todo-1', title: '酒店出发，前往甲秀楼', completed: false, time: '2026-05-01T09:00' },
  { id: 'todo-2', title: '花果园附近午餐', completed: false, time: '2026-05-01T12:10' },
  { id: 'todo-3', title: '青云市集夜游', completed: false, time: '2026-05-01T19:00' },
]

const TODO_STORAGE_KEY = 'guiyang.schedule.todo.tasks.v1'

function normalizeStoredTask(value: unknown): TodoTask | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<TodoTask>

  if (typeof candidate.id !== 'string' || candidate.id.trim().length === 0) {
    return null
  }

  if (typeof candidate.title !== 'string' || candidate.title.trim().length === 0) {
    return null
  }

  if (typeof candidate.completed !== 'boolean') {
    return null
  }

  return {
    id: candidate.id,
    title: candidate.title,
    completed: candidate.completed,
    time: typeof candidate.time === 'string' && candidate.time.trim().length > 0 ? candidate.time : undefined,
  }
}

function loadStoredTasks() {
  if (typeof window === 'undefined') {
    return INITIAL_TASKS
  }

  try {
    const raw = window.localStorage.getItem(TODO_STORAGE_KEY)

    if (!raw) {
      return INITIAL_TASKS
    }

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return INITIAL_TASKS
    }

    return parsed
      .map((task) => normalizeStoredTask(task))
      .filter((task): task is TodoTask => task !== null)
  } catch {
    return INITIAL_TASKS
  }
}

const DATE_TIME_DISPLAY_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function toDateTimeInputValue(rawValue?: string) {
  if (!rawValue) {
    return ''
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(rawValue)) {
    return rawValue
  }

  if (/^\d{2}:\d{2}$/.test(rawValue)) {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}T${rawValue}`
  }

  return ''
}

function formatTaskDateTime(rawValue?: string) {
  if (!rawValue) {
    return ''
  }

  const normalized = toDateTimeInputValue(rawValue)

  if (!normalized) {
    return rawValue
  }

  const parsedDate = new Date(normalized)

  if (Number.isNaN(parsedDate.getTime())) {
    return rawValue
  }

  return DATE_TIME_DISPLAY_FORMATTER.format(parsedDate)
}

function toDateTimeObject(rawValue?: string) {
  const normalized = toDateTimeInputValue(rawValue)

  if (!normalized) {
    return null
  }

  const parsedDate = new Date(normalized)

  if (Number.isNaN(parsedDate.getTime())) {
    return null
  }

  return parsedDate
}

function toDateTimeStorageValue(date: Date | null) {
  if (!date) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function createTodoId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `todo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

interface SortableTodoItemProps {
  task: TodoTask
  isEditing: boolean
  isMobileViewport: boolean
  draft: TodoTaskDraft
  onToggleCompleted: (id: string) => void
  onStartEdit: (task: TodoTask) => void
  onDelete: (id: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDraftChange: (field: keyof TodoTaskDraft, value: string) => void
}

function SortableTodoItem({
  task,
  isEditing,
  isMobileViewport,
  draft,
  onToggleCompleted,
  onStartEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onDraftChange,
}: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const saveDisabled = draft.title.trim().length === 0

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`schedule-todo-item ${task.completed ? 'is-completed' : ''} ${
        isDragging ? 'is-dragging' : ''
      } ${isEditing ? 'is-editing' : ''}`}
    >
      <button
        type="button"
        className="todo-grip"
        aria-label={`拖拽排序 ${task.title}`}
        {...attributes}
        {...listeners}
      >
        <span className="todo-grip-dot" />
        <span className="todo-grip-dot" />
        <span className="todo-grip-dot" />
        <span className="todo-grip-dot" />
        <span className="todo-grip-dot" />
        <span className="todo-grip-dot" />
      </button>

      <label className="todo-check" aria-label={`切换 ${task.title} 完成状态`}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleCompleted(task.id)}
        />
      </label>

      <div className="todo-main">
        {isEditing ? (
          <div className="todo-inline-editor">
            <input
              type="text"
              value={draft.title}
              onChange={(event) => onDraftChange('title', event.target.value)}
              className="todo-edit-title"
              placeholder="任务标题"
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !saveDisabled) {
                  onSaveEdit()
                }
                if (event.key === 'Escape') {
                  onCancelEdit()
                }
              }}
            />
            <DatePicker
              selected={toDateTimeObject(draft.time)}
              onChange={(date: Date | null) => onDraftChange('time', toDateTimeStorageValue(date))}
              showTimeSelect
              timeIntervals={10}
              dateFormat="yyyy-MM-dd HH:mm"
              timeFormat="HH:mm"
              className="todo-edit-time"
              wrapperClassName="todo-edit-time-wrapper"
              popperClassName="todo-datepicker-popper"
              calendarClassName="todo-datepicker"
              popperPlacement="top-start"
              withPortal={isMobileViewport}
              placeholderText="选择日期和时间"
              isClearable
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !saveDisabled) {
                  onSaveEdit()
                }
                if (event.key === 'Escape') {
                  onCancelEdit()
                }
              }}
            />
            <div className="todo-inline-actions">
              <button
                type="button"
                className="todo-inline-btn save icon-only"
                onClick={onSaveEdit}
                disabled={saveDisabled}
                aria-label="保存编辑"
                title="保存"
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                className="todo-inline-btn icon-only"
                onClick={onCancelEdit}
                aria-label="取消编辑"
                title="取消"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              className="todo-title-btn"
              onClick={() => onStartEdit(task)}
              aria-label={`编辑任务 ${task.title}`}
            >
              <span className="todo-title">{task.title}</span>
            </button>
            {task.time ? <span className="todo-time">{formatTaskDateTime(task.time)}</span> : null}
          </>
        )}
      </div>

      <div className="todo-row-actions">
        {!isEditing && (
          <>
            <button
              type="button"
              className="todo-action-btn icon-only"
              onClick={() => onStartEdit(task)}
              aria-label={`编辑任务 ${task.title}`}
              title="编辑"
            >
              <EditIcon />
            </button>
            <button
              type="button"
              className="todo-action-btn danger icon-only"
              onClick={() => onDelete(task.id)}
              aria-label={`删除任务 ${task.title}`}
              title="删除"
            >
              <DeleteIcon />
            </button>
          </>
        )}
      </div>
    </li>
  )
}

interface TodoComposerProps {
  titleValue: string
  timeValue: string
  isMobileViewport: boolean
  onTitleChange: (value: string) => void
  onTimeChange: (value: string) => void
  onSubmit: () => void
}

function TodoComposer({
  titleValue,
  timeValue,
  isMobileViewport,
  onTitleChange,
  onTimeChange,
  onSubmit,
}: TodoComposerProps) {
  return (
    <div className="schedule-composer">
      <button
        type="button"
        onClick={onSubmit}
        className="composer-plus"
        disabled={titleValue.trim().length === 0}
        aria-label="新增任务"
      >
        +
      </button>

      <input
        type="text"
        value={titleValue}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="添加新任务..."
        aria-label="新增任务标题"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onSubmit()
          }
        }}
      />

      <DatePicker
        selected={toDateTimeObject(timeValue)}
        onChange={(date: Date | null) => onTimeChange(toDateTimeStorageValue(date))}
        showTimeSelect
        timeIntervals={10}
        dateFormat="yyyy-MM-dd HH:mm"
        timeFormat="HH:mm"
        placeholderText="选择日期和时间"
        withPortal={isMobileViewport}
        popperClassName="todo-datepicker-popper"
        calendarClassName="todo-datepicker"
        popperPlacement="top-start"
        customInput={
          <button
            type="button"
            className="composer-time icon-only"
            aria-label="选择任务日期和时间"
            title={timeValue ? `已选择 ${formatTaskDateTime(timeValue)}` : '选择日期和时间'}
          >
            <span className="icon-box" aria-hidden="true">
              <CalendarIcon />
            </span>
          </button>
        }
      />
    </div>
  )
}

function TodoOverlayItem({ task }: { task: TodoTask }) {
  return (
    <div className={`schedule-todo-item is-overlay ${task.completed ? 'is-completed' : ''}`}>
      <span className="todo-grip" aria-hidden="true">
        <span className="todo-grip-dot" />
        <span className="todo-grip-dot" />
        <span className="todo-grip-dot" />
        <span className="todo-grip-dot" />
        <span className="todo-grip-dot" />
        <span className="todo-grip-dot" />
      </span>
      <div className="todo-main">
        <span className="todo-title">{task.title}</span>
        {task.time ? <span className="todo-time">{formatTaskDateTime(task.time)}</span> : null}
      </div>
      <span className="todo-overlay-label">拖拽中</span>
    </div>
  )
}

export function SchedulePanel() {
  const [tasks, setTasks] = useState<TodoTask[]>(() => loadStoredTasks())
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskTime, setNewTaskTime] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<TodoTaskDraft>({ title: '', time: '' })
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 640px)')
    const update = (event: MediaQueryList | MediaQueryListEvent) => {
      setIsMobileViewport(event.matches)
    }

    update(mediaQuery)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update)
      return () => mediaQuery.removeEventListener('change', update)
    }

    mediaQuery.addListener(update)
    return () => mediaQuery.removeListener(update)
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // 忽略隐私模式或存储不可用导致的写入异常
    }
  }, [tasks])

  const sensors = useSensors(
    // 鼠标：移动 8px 后激活，不影响点击
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    // 触屏：长按 250ms 后激活，短触摸让位给页面滚动
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeDragId) ?? null,
    [tasks, activeDragId],
  )

  const completedCount = tasks.filter((task) => task.completed).length

  const handleAddTask = () => {
    const title = newTaskTitle.trim()

    if (!title) {
      return
    }

    setTasks((currentTasks) => [
      ...currentTasks,
      {
        id: createTodoId(),
        title,
        completed: false,
        time: newTaskTime || undefined,
      },
    ])
    setNewTaskTitle('')
    setNewTaskTime('')
  }

  const handleToggleCompleted = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
            }
          : task,
      ),
    )
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))

    if (editingId === taskId) {
      setEditingId(null)
      setDraft({ title: '', time: '' })
    }
  }

  const handleStartEdit = (task: TodoTask) => {
    setEditingId(task.id)
    setDraft({
      title: task.title,
      time: toDateTimeInputValue(task.time),
    })
  }

  const handleSaveEdit = () => {
    if (!editingId) {
      return
    }

    const nextTitle = draft.title.trim()

    if (!nextTitle) {
      return
    }

    const nextTime = draft.time.trim()

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === editingId
          ? {
              ...task,
              title: nextTitle,
              time: nextTime || undefined,
            }
          : task,
      ),
    )
    setEditingId(null)
    setDraft({ title: '', time: '' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setDraft({ title: '', time: '' })
  }

  const handleDraftChange = (field: keyof TodoTaskDraft, value: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }))
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)

    if (!over || active.id === over.id) {
      return
    }

    setTasks((currentTasks) => {
      const oldIndex = currentTasks.findIndex((task) => task.id === active.id)
      const newIndex = currentTasks.findIndex((task) => task.id === over.id)

      if (oldIndex < 0 || newIndex < 0) {
        return currentTasks
      }

      return arrayMove(currentTasks, oldIndex, newIndex)
    })
  }

  return (
    <section className="module-shell">
      <header className="module-header">
        <div className="section-intro">
          <p className="section-kicker">Module 03</p>
          <h2>行程清单</h2>
          <p>用 Todo 方式维护当天任务：可勾选完成、行内编辑、删除和拖拽重排。</p>
        </div>
      </header>

      <div className="schedule-todo-panel" aria-label="行程清单">
        <header className="schedule-todo-header">
          <div>
            <p className="mini-label">Trip Todo</p>
            <h3>今日行程任务</h3>
          </div>
          <span className="status-pill">
            {completedCount}/{tasks.length} done
          </span>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragId(null)}
        >
          <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
            {tasks.length > 0 ? (
              <ul className="schedule-todo-list">
                {tasks.map((task) => (
                  <SortableTodoItem
                    key={task.id}
                    task={task}
                    isEditing={editingId === task.id}
                    isMobileViewport={isMobileViewport}
                    draft={draft}
                    onToggleCompleted={handleToggleCompleted}
                    onStartEdit={handleStartEdit}
                    onDelete={handleDeleteTask}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    onDraftChange={handleDraftChange}
                  />
                ))}
              </ul>
            ) : (
              <div className="schedule-empty">暂无任务，先在下方添加第一条行程。</div>
            )}
          </SortableContext>

          <DragOverlay>
            {activeTask ? <TodoOverlayItem task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>

        <TodoComposer
          titleValue={newTaskTitle}
          timeValue={newTaskTime}
          isMobileViewport={isMobileViewport}
          onTitleChange={setNewTaskTitle}
          onTimeChange={setNewTaskTime}
          onSubmit={handleAddTask}
        />
      </div>
    </section>
  )
}