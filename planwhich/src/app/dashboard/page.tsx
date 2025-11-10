'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import TaskStatusBoard from '../components/TaskStatusBoard';
import CalendarTasks from '../components/CalendarTasks';
import MemberList from '../components/MemberList';
import FileManager from '../components/FileManager';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Placeholder Name</h1>
        
        <div className="flex gap-6 h-[calc(100vh-180px)]">
          {/* Left Section - Task Status */}
          <div className="flex-1 h-full">
            <TaskStatusBoard />
          </div>

          {/* Middle Section - Calendar and Members */}
          <div className="flex-1 flex flex-col gap-6 h-full">
            <div className="flex-shrink-0">
              <CalendarTasks />
            </div>
            <div className="flex-1 min-h-0">
              <MemberList />
            </div>
          </div>

          {/* Right Section - My Files */}
          <div className="flex-1 h-full">
            <FileManager />
          </div>
        </div>
      </div>
    </div>
  );
}