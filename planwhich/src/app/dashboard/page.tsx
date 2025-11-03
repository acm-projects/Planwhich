'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import TaskStatusBoard from '../components/TaskStatusBoard';
import CalendarTasks from '../components/CalendarTasks';
import MemberList from '../components/MemberList';
import FileManager from '../components/FileManager';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 p-4 gap-4">
        {/* Left Column - Task Status */}

          <TaskStatusBoard />


        {/* Middle + Right Columns */}
        <div className="flex flex-col w-3/4 gap-4">
          <div className="flex gap-4">
            <div className="w-2/3">
              <CalendarTasks />
            </div>

            <div className="w-1/3">
              <MemberList />
            </div>
          </div>

          <div className="w-full">
            <FileManager />
          </div>
        </div>
      </div>
    </div>
  );
}
