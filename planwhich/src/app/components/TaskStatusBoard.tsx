'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, X, Calendar } from 'lucide-react';

export type TaskStatusType = 'To-Do' | 'In Progress' | 'Complete';

export interface Task {
  id: number;
  name: string;
  description: string;
  collaborators: string;
  status: TaskStatusType;
  dueDate: string;
}

interface TaskBoardPopupProps {
  tasks: Task[];
  onClose: () => void;
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: number, newStatus: TaskStatusType) => void;
}

const TaskBoardPopup: React.FC<TaskBoardPopupProps> = ({ tasks, onClose, onTaskClick, onStatusChange }) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const tasksByStatus: Record<TaskStatusType, Task[]> = {
    'To-Do': tasks.filter(t => t.status === 'To-Do'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Complete': tasks.filter(t => t.status === 'Complete')
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatusType) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== status) {
      onStatusChange(draggedTask.id, status);
    }
    setDraggedTask(null);
  };

  const statusColors: Record<TaskStatusType, string> = {
    'To-Do': 'bg-red-500',
    'In Progress': 'bg-yellow-500',
    'Complete': 'bg-green-500'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 w-full max-w-5xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Task Board</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-3 gap-6 h-full">
            {(Object.entries(tasksByStatus) as [TaskStatusType, Task[]][]).map(([status, statusTasks]) => (
              <div
                key={status}
                className="flex flex-col bg-gray-100 p-4 rounded-lg"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${statusColors[status]}`}>
                    {status}
                  </span>
                  <span className='text-sm text-gray-500 font-medium'>({statusTasks.length})</span>
                </div>

                <div className="space-y-3 flex-1 min-h-[100px]">
                  {statusTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onClick={() => onTaskClick(task)}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-move"
                    >
                      <h3 className="font-semibold text-gray-800 mb-2">{task.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description || 'No description'}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span className='mr-auto font-medium'>{task.dueDate}</span>
                        <div className="flex -space-x-2">
                          {task.collaborators.split(',').map((c) => (
                            <div key={c} className="w-6 h-6 rounded-full bg-green-500 border-2 border-white" title={c}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {statusTasks.length === 0 && (
                    <div className="text-center text-gray-400 py-6 border-2 border-dashed border-gray-300 rounded-lg italic">Drop tasks here</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatusButtonProps {
  status: TaskStatusType;
  onClick: (newStatus: TaskStatusType) => void;
}

const StatusButton: React.FC<StatusButtonProps> = ({ status, onClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const statusStyles: Record<TaskStatusType, string> = {
    'To-Do': 'bg-red-500 text-white',
    'In Progress': 'bg-yellow-500 text-white',
    'Complete': 'bg-green-500 text-white',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]} hover:opacity-80 transition`}
      >
        {status}
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[100px]">
          {(Object.keys(statusStyles) as TaskStatusType[]).map((option) => (
            <button
              key={option}
              onClick={() => { onClick(option); setShowMenu(false); }}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface TaskStatusBoardProps {
  initialTasks?: Task[];
  onCreateTask?: (taskData: {
    taskName: string;
    description: string;
    assignedUserIDs: string[];
    status: 'To Do' | 'In Progress' | 'Done';
    dueDate?: string;
  }) => Promise<any>;
}

const TaskStatusBoard: React.FC<TaskStatusBoardProps> = ({ initialTasks = [], onCreateTask }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showBoard, setShowBoard] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({ name: '', description: '', collaborators: '', status: 'To-Do', dueDate: '' });

  const [showCollaboratorsDropdown, setShowCollaboratorsDropdown] = useState(false);
  const [collaboratorSearch, setCollaboratorSearch] = useState('');
  const collaboratorsRef = useRef<HTMLDivElement>(null);

  const projectMembers = ['member1', 'member2', 'member3', 'member4', 'member5'];
  const filteredMembers = projectMembers.filter(
    (m) =>
      m.toLowerCase().includes(collaboratorSearch.toLowerCase()) &&
      !(newTask.collaborators.split(',') || []).includes(m)
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (collaboratorsRef.current && !collaboratorsRef.current.contains(e.target as Node)) {
        setShowCollaboratorsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateForStorage = (dateString: string): string => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yy = String(date.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  };

  const handleAddTask = async () => {
    console.log('🎯 handleAddTask called with:', newTask);
    
    if (!newTask.name.trim()) {
      alert('Please enter a task name');
      return;
    }
    
    setIsCreating(true);
    
    try {
      const formattedDate = formatDateForStorage(newTask.dueDate);
      
      console.log('🎯 About to call onCreateTask, exists?', !!onCreateTask);
      
      // If onCreateTask callback is provided, use it (API call)
      if (onCreateTask) {
        console.log('🎯 Calling onCreateTask...');
        // Convert status format
        const apiStatus = newTask.status === 'To-Do' ? 'To Do' : 
                         newTask.status === 'In Progress' ? 'In Progress' : 'Done';
        
        await onCreateTask({
          taskName: newTask.name,
          description: newTask.description,
          assignedUserIDs: newTask.collaborators ? newTask.collaborators.split(',').map(id => id.trim()) : [],
          status: apiStatus,
          dueDate: newTask.dueDate || undefined
        });
      } else {
        // Fallback to local state only
        const task: Task = { id: Date.now(), ...newTask, dueDate: formattedDate };
        setTasks((prev) => [...prev, task]);
      }
      
      setShowForm(false);
      setNewTask({ name: '', description: '', collaborators: '', status: 'To-Do', dueDate: '' });
    } catch (error) {
      console.error('Error creating task:', error);
      // Error is already handled in parent component
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = (id: number, newStatus: TaskStatusType) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, status: newStatus } : task)));
  };

  const filteredTasks = tasks.filter((task) => task.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const order: Record<TaskStatusType, number> = { 'To-Do': 1, 'In Progress': 2, 'Complete': 3 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 relative">
      <h2 className="text-xl font-semibold text-gray-800 mb-1 flex items-center justify-between">
        <span>Task Status</span>
        <button
          onClick={(e) => { e.stopPropagation(); setShowForm(true); }}
          className="w-8 h-8 flex items-center justify-center bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
        >
          <Plus size={20} />
        </button>
      </h2>

      <div
        onClick={() => setShowBoard(true)}
        className="text-sm text-gray-500 hover:text-green-500 cursor-pointer mb-6 transition"
      >
        See Kanban Board
      </div>

      {showBoard && (
        <TaskBoardPopup
          tasks={tasks}
          onClose={() => setShowBoard(false)}
          onStatusChange={(taskId, newStatus) => handleStatusChange(taskId, newStatus)}
          onTaskClick={() => {}}
        />
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-center">Add New Task</h3>

            <input
              type="text"
              placeholder="Task name"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              className="w-full mb-3 p-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
            />

            <textarea
              placeholder="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full mb-3 p-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
            />

            {/* Collaborators multi-select */}
            <div className="relative mb-3" ref={collaboratorsRef}>
              <div
                className="w-full p-2 border border-gray-300 rounded-lg flex flex-wrap gap-1 items-center cursor-text focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500"
                onClick={() => setShowCollaboratorsDropdown(true)}
              >
                {(newTask.collaborators
                  ? newTask.collaborators.split(',')
                  : []
                ).map((c) => (
                  <span
                    key={c}
                    className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const current = newTask.collaborators
                          .split(',')
                          .filter((col) => col !== c);
                        setNewTask({ ...newTask, collaborators: current.join(',') });
                      }}
                      className="text-green-600 hover:text-green-800 ml-1 text-xs font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={collaboratorSearch}
                  onChange={(e) => {
                    setCollaboratorSearch(e.target.value);
                    setShowCollaboratorsDropdown(true);
                  }}
                  className="flex-1 border-none outline-none text-sm p-1"
                  placeholder="Select collaborators..."
                />
              </div>

              {showCollaboratorsDropdown && filteredMembers.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-auto">
                  {filteredMembers.map((member) => (
                    <div
                      key={member}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        const current = newTask.collaborators
                          ? newTask.collaborators.split(',')
                          : [];
                        setNewTask({ ...newTask, collaborators: [...current, member].join(',') });
                        setCollaboratorSearch('');
                      }}
                    >
                      {member}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="w-full mb-3 p-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        />
      </div>

      <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-4 mb-3 pb-2 border-b border-gray-200 text-sm font-medium text-gray-600">
        <div>Task</div>
        <div className="text-center pr-4">Status</div>
        <div className="text-right">Due Date</div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {sortedTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">{searchQuery ? 'No tasks found matching your search.' : 'No tasks yet. Click + to add a task.'}</div>
        ) : (
          sortedTasks.map((task) => (
            <div key={task.id} className="grid grid-cols-[1.5fr_1fr_1fr] gap-4 items-center py-2 px-1 hover:bg-green-50 rounded-lg cursor-pointer transition">
              <div className="text-sm text-gray-800 truncate font-medium">{task.name}</div>
              <div className="flex justify-center">
                <StatusButton status={task.status} onClick={(newStatus) => handleStatusChange(task.id, newStatus)} />
              </div>
              <div className="text-sm text-gray-600 text-right">{task.dueDate}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskStatusBoard;