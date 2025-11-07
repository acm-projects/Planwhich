'use client';

import React, { useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import dayjs from 'dayjs';

const CalendarTasks: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  const today = dayjs();
  const startOfWeek = today.startOf('week');
  const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 relative w-[400px] h-[296px] overflow-hidden">
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

      {/* Tasks Placeholder */}
      <div className="flex-1 border-t border-gray-100 pt-4 overflow-auto">
        <h3 className="text-md font-semibold mb-2">Tasks</h3>
        <p className="text-gray-400 text-sm">
          {selectedDate
            ? `No tasks for ${selectedDate}.`
            : 'Select a date to view tasks.'}
        </p>
      </div>
    </div>
  );
};

export default CalendarTasks;
