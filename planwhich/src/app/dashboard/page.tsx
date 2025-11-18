'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import TaskStatusBoard from '../components/TaskStatusBoard';
import CalendarTasks from '../components/CalendarTasks';
import MemberList from '../components/MemberList';
import FileManager from '../components/FileManager';

const TASKS_API_URL = 'https://bi98ye86yf.execute-api.us-east-1.amazonaws.com/begin/tasks';
const TASKS_STATUS_API_URL = 'https://bi98ye86yf.execute-api.us-east-1.amazonaws.com/begin/tasks/status';
const FILES_API_URL = 'https://bi98ye86yf.execute-api.us-east-1.amazonaws.com/begin/files';

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
  const [files, setFiles] = useState<any[]>([]);
  const [projectName, setProjectName] = useState<string>('Project');

  useEffect(() => {
    const name = localStorage.getItem('currentProjectName');
    if (name) setProjectName(name);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Dashboard mounted');
    console.log('🔍 projectId from URL:', projectId);
    console.log('🔍 Full URL:', window.location.href);
    console.log('🔍 All search params:', Object.fromEntries(searchParams.entries()));
  }, [projectId, searchParams]);

  // Fetch tasks and files when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchProjectTasks();
      fetchProjectFiles();
    }
  }, [projectId]);

  const fetchProjectTasks = async () => {
    if (!projectId) return;
    
    try {
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        console.error('❌ No auth token');
        return;
      }

      console.log('📋 Fetching tasks for project:', projectId);
      
      const response = await fetch(`${TASKS_API_URL}?projectId=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();

      // If Lambda Proxy is working, data should already be the array
      // If you're getting {statusCode, body, headers}, then you need:
      const tasks = typeof data === 'string' ? JSON.parse(data) : data;

      console.log('✅ Tasks fetched:', tasks);
      setTasks(Array.isArray(tasks) ? tasks : [])
      
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
    }
  };

  const fetchProjectFiles = async () => {
    if (!projectId) return;
    
    try {
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        console.error('❌ No auth token');
        return;
      }

      console.log('📁 Fetching files for project:', projectId);
      
      const response = await fetch(`${FILES_API_URL}?projectId=${projectId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      const files = typeof data === 'string' ? JSON.parse(data) : data;

      console.log('✅ Files fetched:', files);
      setFiles(Array.isArray(files) ? files : []);
      
    } catch (error) {
      console.error('❌ Error fetching files:', error);
    }
  };

  console.log('🎨 DashboardPage rendered, projectId:', projectId, 'tasks:', tasks.length);

  const convertToStatusBoardTasks = (apiTasks: Task[]): TaskStatusBoardTask[] => {
    if (!Array.isArray(apiTasks)) return [];
    return apiTasks.map((task, index) => ({
      id: index + 1,
      taskID: task.taskID,
      name: task.taskName,
      description: task.description,
      collaborators: task.assignedUserIDs.join(', '),
      status: task.status === 'To Do' ? 'To-Do' : 
              task.status === 'In Progress' ? 'In Progress' : 'Complete',
      dueDate: task.dueDate || 'No date'
    }));
  };

  const createFile = async (fileData: {
    fileName: string;
    fileType: string;
    fileSize: number;
    fileContent: string;
    tags?: string[];
  }) => {
    try {
      const idToken = localStorage.getItem('idToken');
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('name');
      
      if (!idToken || !userId) {
        alert('Please log in again');
        return;
      }

      // Remove data URL prefix from base64 content
      const base64Content = fileData.fileContent.split(',')[1];

      const requestBody = {
        fileName: fileData.fileName,
        contentType: fileData.fileType,
        fileContent: base64Content,
        uploaderID: userId,
        uploaderName: userName || userId,
        projectID: projectId,
        tags: fileData.tags || [],
      };

      console.log('📤 Uploading file:', fileData.fileName);
      console.log('🏷️ Tags being sent:', fileData.tags);
      console.log('🔑 Auth token present:', !!idToken);
      console.log('👤 User ID:', userId);

      const response = await fetch(FILES_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ File upload failed:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to upload file');
      }

      const data = await response.json();
      console.log('✅ File uploaded:', data);
      
      // Refresh files list
      await fetchProjectFiles();
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw error;
    }
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
        assignedUserIDs: finalAssignedUserIDs,
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

  const updateTaskStatus = async (taskID: string, newStatus: 'To Do' | 'In Progress' | 'Done') => {
    try {
      const idToken = localStorage.getItem('idToken');
      if (!idToken) return;

      const response = await fetch(TASKS_STATUS_API_URL, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskID, status: newStatus }),
      });

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.taskID === taskID ? { ...task, status: newStatus } : task
        ));
      }
    } catch (error) {
      // Silent fail
    }
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
    <div className="min-h-screen bg-gray-50 pb-6">
      <Navbar />
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{projectName}</h1>

        {/* Main layout grid */}
        <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-8 h-[calc(100vh-180px)]">
          {/* Left Section - Task Status */}
          <div className="flex flex-col min-h-[400px]">
            <TaskStatusBoard 
              initialTasks={convertToStatusBoardTasks(tasks)}
              onCreateTask={createTask}
              onUpdateTaskStatus={updateTaskStatus}
            />
          </div>

          {/* Middle Section - Calendar and Members */}
          <div className="flex flex-col gap-6 min-h-[400px]">
            <div className="flex-shrink-0">
              <CalendarTasks tasks={tasks} />
            </div>
            <div className="flex-1 min-h-0">
              <MemberList projectId={projectId || undefined} />
            </div>
          </div>

          {/* Right Section - My Files */}
          <div className="flex flex-col min-h-[400px] overflow-hidden">
            <FileManager 
              key={files.length}
              projectId={projectId || undefined}
              initialFiles={files.map((file, index) => {
                const fileTags = file.tags || file.Tags || file.fileTags || [];
                console.log('📄 File:', file.fileName, 'Tags:', fileTags, 'Full object:', file);
                return {
                  id: index + 1,
                  name: file.fileName,
                  size: file.fileSize || 'Unknown',
                  sharedBy: file.uploadedBy || file.uploaderName || 'Unknown',
                  date: file.dateUploaded ? new Date(file.dateUploaded).toLocaleDateString('en-US') : 'Unknown',
                  type: file.fileType?.startsWith('image/') ? 'image' : 'document',
                  tags: fileTags,
                };
              })}
              onCreateFile={createFile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}