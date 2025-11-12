'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import TaskStatusBoard from '../components/TaskStatusBoard';
import CalendarTasks from '../components/CalendarTasks';
import MemberList from '../components/MemberList';
import FileManager from '../components/FileManager';

const TASKS_API_URL = 'https://bi98ye86yf.execute-api.us-east-1.amazonaws.com/begin/tasks';

export interface Task {
  taskID: string;
  taskName: string;
  description: string;
  assignedUserIDs: string[];
  projectID: string;
  status: 'To Do' | 'In Progress' | 'Done';
  dateCreated: string;
  dueDate?: string;
}

// Type for TaskStatusBoard component
interface TaskStatusBoardTask {
  id: number;
  name: string;
  description: string;
  collaborators: string;
  status: 'To-Do' | 'In Progress' | 'Complete';
  dueDate: string;
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const [tasks, setTasks] = useState<Task[]>([]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Dashboard mounted');
    console.log('🔍 projectId from URL:', projectId);
    console.log('🔍 Full URL:', window.location.href);
    console.log('🔍 All search params:', Object.fromEntries(searchParams.entries()));
  }, [projectId, searchParams]);

  console.log('🎨 DashboardPage rendered, projectId:', projectId, 'tasks:', tasks.length);

  // Convert API tasks to TaskStatusBoard format
  const convertToStatusBoardTasks = (apiTasks: Task[]): TaskStatusBoardTask[] => {
    return apiTasks.map((task, index) => ({
      id: index + 1,
      name: task.taskName,
      description: task.description,
      collaborators: task.assignedUserIDs.join(', '),
      status: task.status === 'To Do' ? 'To-Do' : 
              task.status === 'In Progress' ? 'In Progress' : 'Complete',
      dueDate: task.dueDate || 'No date'
    }));
  };

  const createTask = async (taskData: {
    taskName: string;
    description: string;
    assignedUserIDs: string[];
    status: 'To Do' | 'In Progress' | 'Done';
    dueDate?: string;
  }) => {
    console.log('🚀 createTask function called with:', taskData);
    
    try {
      const idToken = localStorage.getItem('idToken');
      const userId = localStorage.getItem('userId');
      
      if (!idToken) {
        console.error('❌ No auth token found');
        alert('Please log in again');
        return;
      }

      if (!userId) {
        console.error('❌ No userId found in localStorage');
        alert('Session error. Please log in again.');
        return;
      }

      console.log('✅ Auth token found');
      console.log('✅ Current userId:', userId);
      console.log('✅ Incoming assignedUserIDs:', taskData.assignedUserIDs);

      // Generate unique taskID and current timestamp
      const taskID = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const dateCreated = new Date().toISOString();

      // Determine which user IDs to use
      let finalAssignedUserIDs: string[];
      if (taskData.assignedUserIDs && taskData.assignedUserIDs.length > 0) {
        finalAssignedUserIDs = taskData.assignedUserIDs;
        console.log('✅ Using provided assignedUserIDs:', finalAssignedUserIDs);
      } else {
        finalAssignedUserIDs = [userId];
        console.log('✅ Using current userId as assignedUserIDs:', finalAssignedUserIDs);
      }

      const requestBody = {
        taskID: taskID,
        projectID: projectId,
        taskName: taskData.taskName,
        description: taskData.description,
        assignedUserIDs: finalAssignedUserIDs,
        status: taskData.status,
        dateCreated: dateCreated,
        dueDate: taskData.dueDate,
      };

      console.log('📤 Sending task creation request:', requestBody);

      const response = await fetch(TASKS_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Task creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create task');
      }

      const data = await response.json();
      console.log('✅ Task created successfully:', data);
      
      // Create the task object to add to local state
      const newTask: Task = {
        taskID: taskID,
        taskName: taskData.taskName,
        description: taskData.description,
        assignedUserIDs: taskData.assignedUserIDs.length > 0 ? taskData.assignedUserIDs : [userId || ''],
        projectID: projectId || '',
        status: taskData.status,
        dateCreated: dateCreated,
        dueDate: taskData.dueDate,
      };
      
      console.log('➕ Adding task to local state:', newTask);
      
      // Add the new task to local state
      setTasks(prev => [...prev, newTask]);
      
      return newTask;
    } catch (error) {
      console.error('💥 Error creating task:', error);
      alert('Failed to create task. Please try again.');
      throw error;
    }
  };

  // Local-only update for status changes (not persisted to backend yet)
  const updateTaskLocally = (taskID: string, updates: Partial<Task>) => {
    console.log('🔄 Updating task locally:', taskID, updates);
    setTasks(prev => prev.map(task => 
      task.taskID === taskID ? { ...task, ...updates } : task
    ));
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No project selected</p>
          <p className="text-sm text-gray-400">Current URL: {window.location.href}</p>
          <button 
            onClick={() => window.location.href = '/projects'} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Placeholder Name</h1>

        {/* Main layout grid for equal spacing */}
        <div className="grid grid-cols-3 gap-24 h-[calc(100vh-180px)]">
          {/* Left Section - Task Status */}
          <div className="flex flex-col min-h-[400px]">
            <TaskStatusBoard 
              initialTasks={convertToStatusBoardTasks(tasks)}
              onCreateTask={createTask}
            />
          </div>
          {/* Middle Section - Calendar and Members */}
          <div className="flex flex-col gap-6 min-h-[400px]">
            <div className="flex-shrink-0">
              <CalendarTasks />
            </div>
            <div className="flex-1 min-h-0">
              <MemberList />
            </div>
          </div>
          {/* Right Section - My Files */}
          <div className="flex flex-col min-h-[400px]">
            <FileManager projectId={projectId} />
          </div>
        </div>
      </div>
    </div>
  );
}