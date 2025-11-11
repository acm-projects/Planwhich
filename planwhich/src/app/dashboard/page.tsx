'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import TaskStatusBoard from '../components/TaskStatusBoard';
import CalendarTasks from '../components/CalendarTasks';
import MemberList from '../components/MemberList';
import FileManager from '../components/FileManager';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <Navbar />

      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Placeholder Name</h1>

        {/* 3-column layout */}
        <div className="grid grid-cols-[2fr_1fr_2fr] gap-6 mb-6">
          {/* Left Section */}
          <TaskStatusBoard />

          {/* Middle Section */}
          <div className="flex flex-col gap-6">
            <CalendarTasks />
            <MemberList />
          </div>

          {/* Right Section */}
          <FileManager />
        </div>
      </div>
    </div>
  );
}
