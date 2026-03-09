import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Search,
  Trash2,
  Check,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [priority, setPriority] = useState('medium')
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  // Load todos from JSON Server
  useEffect(() => {
    fetch("/api/todos")
      .then(res => res.json())
      .then(data => {
        setTodos(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handleAddTodo = async (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const newTodo = {
      text: inputValue.trim(),
      completed: false,
      priority: priority,
      createdAt: new Date().toISOString()
    }

    const res = await fetch("/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newTodo)
    })

    const data = await res.json()
    setTodos([data, ...todos])
    setInputValue('')
  }

  const handleToggle = async (id) => {
    const todo = todos.find(t => t.id === id)
    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        completed: !todo.completed
      })
    })

    const updated = await res.json()
    setTodos(todos.map(t => t.id === id ? updated : t))
  }

  const handleDelete = async (id) => {
    await fetch(`/api/todos/${id}`, {
      method: "DELETE"
    })
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const clearCompleted = async () => {
    const completed = todos.filter(t => t.completed)
    await Promise.all(
      completed.map(todo =>
        fetch(`/api/todos/${todo.id}`, {
          method: "DELETE"
        })
      )
    )
    setTodos(todos.filter(t => !t.completed))
  }

  const filteredTodos = useMemo(() => {
    return todos
      .filter(todo => {
        if (filter === 'active') return !todo.completed
        if (filter === 'completed') return todo.completed
        return true
      })
      .filter(todo =>
        todo.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [todos, filter, searchQuery])

  const stats = {
    total: todos.length,
    remaining: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  }

  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).format(new Date())

  return (
    <div className="app-container">
      {/* Giữ lại Background Blobs cho giao diện đẹp */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="app-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          <header className="header">
            <div className="header-top">
              <div className="title-section">
                <h1>My Focus</h1>
                <p className="date-text">
                  <Calendar size={14} />
                  {today}
                </p>
              </div>
              <div className="stats-badge">
                {loading ? <Loader2 className="animate-spin" size={14}/> : `${stats.remaining} tasks left`}
              </div>
            </div>

            <div className="search-bar">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <form onSubmit={handleAddTodo} className="input-form">
              <div className="main-input-group">
                <input
                  type="text"
                  className="todo-field"
                  placeholder="What's your next move?"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <button type="submit" className="add-button">
                  <Plus size={20}/>
                  <span>Add</span>
                </button>
              </div>
              <div className="input-options">
                <select
                  className="priority-select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Canh tác hào quang</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </form>

            <div className="filters-tabs">
              {['all', 'active', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={clsx('filter-tab', filter === f && 'active')}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </header>

          <ul className="todo-list">
            {loading ? (
              <div className="empty-state">
                <Loader2 className="animate-spin" size={32} />
                <p>Syncing with database...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredTodos.map(todo => (
                  <motion.li
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={clsx('todo-item', todo.completed && 'completed')}
                  >
                    <div
                      onClick={() => handleToggle(todo.id)}
                      className={clsx('checkbox-box', todo.completed && 'checked')}
                    >
                      {todo.completed && <Check size={16} strokeWidth={3} color="white" />}
                    </div>

                    <div className="todo-content">
                      <h3 className="todo-title">{todo.text}</h3>
                      <div className="todo-meta">
                        <span className={clsx('priority-tag', `priority-${todo.priority}`)}>
                          {todo.priority}
                        </span>
                        <span className="todo-time">
                          <Clock size={12} style={{ marginRight: '4px' }} />
                          {new Date(todo.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="item-actions">
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="action-btn delete-btn"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            )}

            {!loading && filteredTodos.length === 0 && (
              <div className="empty-state">
                <CheckCircle2 size={48} className="empty-icon" />
                <h3>Nothing to see here</h3>
                <p>Enjoy your productive day!</p>
              </div>
            )}
          </ul>

          {stats.completed > 0 && (
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <button onClick={clearCompleted} className="filter-tab" style={{ width: 'auto' }}>
                Clear Completed
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default App
