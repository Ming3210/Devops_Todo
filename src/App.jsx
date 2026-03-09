import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, 
  Search, 
  Trash2, 
  Check, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  Circle,
  MoreVertical,
  X,
  AlertCircle,
  Clock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import './App.css'

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Persistence
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      priority: priority,
      createdAt: new Date().toISOString()
    };
    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const handleToggle = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDelete = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  // Filtered and Searched Todos
  const filteredTodos = useMemo(() => {
    return todos
      .filter(todo => {
        if (filter === 'active') return !todo.completed;
        if (filter === 'completed') return todo.completed;
        return true;
      })
      .filter(todo => 
        todo.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [todos, filter, searchQuery]);

  const stats = {
    total: todos.length,
    remaining: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  };

  const today = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  }).format(new Date());

  return (
    <div className="app-container">
      {/* Background Blobs for Atmosphere */}
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
          {/* Header Section */}
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
                {stats.remaining} {stats.remaining === 1 ? 'task' : 'tasks'} left
              </div>
            </div>

            {/* Search Bar */}
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

            {/* Input Form */}
            <form onSubmit={handleAddTodo} className="input-form">
              <div className="main-input-group">
                <input 
                  type="text" 
                  placeholder="What's your next move?" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="todo-field"
                />
                <button type="submit" className="add-button">
                  <Plus size={24} />
                  <span>Add Task</span>
                </button>
              </div>
              <div className="input-options">
                <select 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                  className="priority-select"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </form>

            {/* Filter Tabs */}
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

          {/* Todo List */}
          <ul className="todo-list">
            <AnimatePresence mode="popLayout">
              {filteredTodos.map(todo => (
                <motion.li 
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className={clsx('todo-item', todo.completed && 'completed')}
                >
                  <div 
                    className={clsx('checkbox-box', todo.completed && 'checked')}
                    onClick={() => handleToggle(todo.id)}
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
                        {new Date(todo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="item-actions">
                    <button 
                      onClick={() => handleDelete(todo.id)} 
                      className="action-btn delete-btn"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>

            {/* Empty State */}
            {filteredTodos.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-state"
              >
                <div className="empty-icon-container">
                  <CheckCircle2 size={48} className="empty-icon" />
                </div>
                <h3>Nothing to see here</h3>
                <p>Enjoy your productive day!</p>
              </motion.div>
            )}
          </ul>

          {/* Footer Actions */}
          {stats.completed > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: '2rem', textAlign: 'center' }}
            >
              <button onClick={clearCompleted} className="filter-tab" style={{ width: 'auto' }}>
                Clear Completed Tasks
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default App
