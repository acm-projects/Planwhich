'use client';

import React, { useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import dayjs from 'dayjs';

interface Task {
  taskID: string;
  taskName: string;
  dueDate?: string;
  status: string;
}

interface CalendarTasksProps {
  tasks?: Task[];
}

const CalendarTasks: React.FC<CalendarTasksProps> = ({ tasks = [] }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  const today = dayjs();
  const startOfWeek = today.startOf('week');
  const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 relative w-[400px] h-[288px] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FiCalendar className="text-gray-600" /> This Week
        </h2>
        <span className="text-sm text-gray-400">{today.format('MMMM YYYY')}</span>
      </div>

      {/* Week Calendar */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day) => (
          <button
            key={day.format('YYYY-MM-DD')}
            onClick={() => setSelectedDate(day.format('MM/DD/YY'))}
            className={`flex flex-col items-center justify-center w-10 h-12 rounded-xl text-sm transition-all duration-200 hover:bg-green-100 hover:text-green-700 ${
              selectedDate === day.format('MM/DD/YY')
                ? 'bg-green-500 text-white'
                : 'text-gray-700'
            }`}
          >
            <span className="text-xs text-gray-400">{day.format('dd')}</span>
            <span className="font-medium">{day.format('D')}</span>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="flex-1 border-t border-gray-100 pt-4 overflow-auto max-h-32">
        <h3 className="text-md font-semibold mb-2">Tasks</h3>
        {selectedDate ? (
          (() => {
            const tasksForDate = tasks.filter(task => {
              if (!task.dueDate || task.status === 'Done') return false;
              const taskDate = dayjs(task.dueDate).format('MM/DD/YY');
              return taskDate === selectedDate;
            });
            
            return tasksForDate.length > 0 ? (
              <div className="space-y-2">
                {tasksForDate.map(task => (
                  <div key={task.taskID} className="p-2 bg-gray-50 rounded text-sm">
                    <p className="font-medium text-gray-800">{task.taskName}</p>
                    <p className="text-xs text-gray-500">{task.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No tasks for {selectedDate}.</p>
            );
          })()
        ) : (
          <p className="text-gray-400 text-sm">Select a date to view tasks.</p>
        )}
      </div>
    </div>
  );
};

export default CalendarTasks;
