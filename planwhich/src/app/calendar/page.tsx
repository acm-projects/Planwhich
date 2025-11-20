//** Tasks to complete (pseuodocode): - create lambda function to return all projects associated with user
// - call lambda function to get list of projects and show them on dropdown
// - in pre-existing lambda, include another parameter: project name. Get all the users associated
// with that project, give it to openAI and prompt it to only include users whose names show up in 
// that project on the tasks generated 
// - REACH: Make the events and tasks persist through log ins and page refreshes by saving them to the backend database
// - Meeting notes test summary: 
// During this morning's product sync,  aaron.gheevar began by reviewing last week's progress 
// on the mobile app. He mentioned that we still need to finalize the UI mockups before handing things off to development by 
// next week. Rishi added that user-data syncing has improved after the recent fix, but he still needs to prepare a short 
// performance summary for the leadership team before presenting this week. aaryaniraula007 brought up issues with customer 
// onboarding and suggested updating the tutorial screens. She agreed to create a list of improvements to the onboarding flow. 
// Kaitlyn said she would follow up with marketing to see whether they planned to highlight the new feature in this month's 
// newsletter. Toward the end, Aaron reminded everyone that someone must schedule a call with the design contractor to discuss 
// icon replacements before this week's meeting. The meeting wrapped up with Jonathan offering to send a brief summary of action items.
// */
"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { Poppins } from "next/font/google";
import Navbar from "../components/Navbar";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"] });
const localizer = momentLocalizer(moment);

// API endpoints
const MEETINGS_API = "https://bi98ye86yf.execute-api.us-east-1.amazonaws.com/dev/meetings";
const TASKS_API = "https://bi98ye86yf.execute-api.us-east-1.amazonaws.com/begin/ExtractMeetingNotesTasks";
const PROJECTS_API = "https://bi98ye86yf.execute-api.us-east-1.amazonaws.com/begin/projects";
const TASKS_BACKEND_API = "https://bi98ye86yf.execute-api.us-east-1.amazonaws.com/begin/tasks";

type UiEvent = {
  title: string;
  start: Date;
  end: Date;
  meetingID?: string;
  googleEventId?: string;
  projectId?: string;
  meetingNote?: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  image: string;
};

type ProjectMember = {
  UserID: string;
  username: string;
  email: string;
};

// Function to fetch tasks from Lambda (OpenAI processing)
async function fetchTasksFromLambda(meetingNotes: string, memberNames: string[]) {
  try {
    const response = await fetch(TASKS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        textInput: meetingNotes,
        projectMembers: memberNames
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.tags;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return null;
  }
}

// Parse OpenAI response into task objects
function parseTasksFromAI(aiResponse: string) {
  const lines = aiResponse.split('\n').filter(line => line.trim());
  
  return lines.map((line, index) => {
    const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
    
    if (!cleanLine || 
        cleanLine.toLowerCase().includes('task description') ||
        cleanLine.toLowerCase() === 'duedate' ||
        cleanLine.length < 3) {
      return null;
    }
    
    // Match: "Name: Task by Date"
    const matchWithDue = cleanLine.match(/^([^:]+):\s*(.+?)\s+by\s+(.+)$/i);
    
    if (matchWithDue) {
      const name = matchWithDue[1].trim();
      const taskText = matchWithDue[2].trim();
      const dueDate = matchWithDue[3].trim();
      
      if (name.toLowerCase() === 'task' || 
          name.toLowerCase() === 'personname' ||
          taskText.toLowerCase().includes('task description') ||
          dueDate.toLowerCase() === 'duedate') {
        return null;
      }
      
      return {
        text: taskText,
        assignedTo: name,
        dueDate: dueDate
      };
    }
    
    // Match: "Name: Task"
    const matchNoDue = cleanLine.match(/^([^:]+):\s*(.+)$/);
    
    if (matchNoDue) {
      const name = matchNoDue[1].trim();
      const taskText = matchNoDue[2].trim();
      
      if (name.toLowerCase() === 'task' || 
          name.toLowerCase() === 'personname' ||
          taskText.toLowerCase().includes('task description')) {
        return null;
      }
      
      return {
        text: taskText,
        assignedTo: name,
        dueDate: null
      };
    }
    
    // Match: "Task by Date"
    const matchTaskWithDue = cleanLine.match(/^(.+?)\s+by\s+(.+)$/i);
    
    if (matchTaskWithDue) {
      const taskText = matchTaskWithDue[1].trim();
      const dueDate = matchTaskWithDue[2].trim();
      
      if (taskText.toLowerCase().includes('task description') ||
          dueDate.toLowerCase() === 'duedate') {
        return null;
      }
      
      return {
        text: taskText,
        assignedTo: null,
        dueDate: dueDate
      };
    }
    
    return {
      text: cleanLine,
      assignedTo: null,
      dueDate: null
    };
  }).filter(task => task !== null);
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<UiEvent[]>([]);
  const [tasks, setTasks] = useState<
    { id: number; date: string; text: string; status: string; projectId?: string }[]
  >([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UiEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [taskGenerationError, setTaskGenerationError] = useState<string>("");
  
  // Project-related state
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
    projectId: "",
    meetingNote: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user's projects when component mounts
  useEffect(() => {
    fetchUserProjects();
  }, []);

  // Fetch project members when a project is selected
  useEffect(() => {
    if (selectedProject) {
      fetchProjectMembers(selectedProject);
    } else {
      setProjectMembers([]);
    }
  }, [selectedProject]);

  const fetchUserProjects = async () => {
    try {
      setLoadingProjects(true);
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        console.error('❌ No auth token');
        return;
      }

      console.log('📋 Fetching user projects...');
      
      const response = await fetch(PROJECTS_API, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      console.log('✅ Projects fetched:', data);
      setProjects(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchProjectMembers = async (projectId: string) => {
    try {
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        console.error('❌ No auth token');
        return;
      }

      console.log('👥 Fetching members for project:', projectId);
      
      const response = await fetch(
        `${PROJECTS_API}/${projectId}/members`,
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch project members');
      }

      const data = await response.json();
      console.log('✅ Project members fetched:', data);
      setProjectMembers(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('❌ Error fetching project members:', error);
      setProjectMembers([]);
    }
  };

  // NEW: Function to save task to backend
  const saveTaskToBackend = async (taskData: {
    taskName: string;
    description: string;
    assignedUserIDs: string[];
    projectID: string;
    status: 'To Do' | 'In Progress' | 'Done';
    dueDate?: string;
  }) => {
    try {
      const idToken = localStorage.getItem('idToken');
      const userId = localStorage.getItem('userId');
      
      if (!idToken || !userId) {
        throw new Error('Authentication required');
      }

      const taskID = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const dateCreated = new Date().toISOString();

      const requestBody = {
        taskID: taskID,
        projectID: taskData.projectID,
        taskName: taskData.taskName,
        description: taskData.description,
        assignedUserIDs: taskData.assignedUserIDs.length > 0 ? taskData.assignedUserIDs : [userId],
        status: taskData.status,
        dateCreated: dateCreated,
        dueDate: taskData.dueDate,
      };

      console.log('💾 Saving task to backend:', requestBody);

      const response = await fetch(TASKS_BACKEND_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save task');
      }

      const data = await response.json();
      console.log('✅ Task saved to backend:', data);
      return true;
      
    } catch (error) {
      console.error('❌ Error saving task to backend:', error);
      return false;
    }
  };

  // Filter tasks for the selected day
  const tasksForDay = tasks.filter(
    (t) => t.date === moment(selectedDate).format("YYYY-MM-DD")
  );

  // Add new task
  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const dateKey = moment(selectedDate).format("YYYY-MM-DD");
    const newEntry = {
      id: Date.now(),
      date: dateKey,
      text: newTask,
      status: "todo",
    };
    setTasks([...tasks, newEntry]);
    setNewTask("");
  };

  // Delete task
  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // Change status
  const handleChangeStatus = (id: number, newStatus: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  // Filter logic
  const filteredTasks =
    filter === "all"
      ? tasksForDay
      : tasksForDay.filter((t) => t.status === filter);

  // Get user ID
  const getUserId = () => {
    try {
      return localStorage.getItem("userId") || "";
    } catch {
      return "";
    }
  };

  const openAddForm = () => {
    setFormData({
      title: "",
      start: "",
      end: "",
      projectId: "",
      meetingNote: "",
    });
    setSelectedProject("");
    setEditingEvent(null);
    setShowForm(true);
    setTaskGenerationError("");
  };

  const openEditForm = (event: UiEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      start: moment(event.start).format("YYYY-MM-DDTHH:mm"),
      end: moment(event.end).format("YYYY-MM-DDTHH:mm"),
      projectId: event.projectId || "",
      meetingNote: event.meetingNote || "",
    });
    setSelectedProject(event.projectId || "");
    setShowForm(true);
    setTaskGenerationError("");
  };

  async function createMeetingOnServer(title: string, startISO: string, endISO: string) {
    const payload = {
      meetingTitle: title,
      startTime: startISO,
      endTime: endISO,
      projectID: "",
      assignedUsers: [],
      userId: getUserId(),
    };

    const res = await fetch(MEETINGS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok && res.status !== 207) {
      throw new Error(json?.error || "Create meeting failed");
    }
    return { status: res.status, json };
  }

  const handleSaveEvent = async () => {
    if (!formData.title || !formData.start || !formData.end || saving) return;

    if (!selectedProject) {
      alert("Please select a project");
      return;
    }

    const startDate = new Date(formData.start);
    const endDate = new Date(formData.end);
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const optimistic: UiEvent = {
      title: formData.title,
      start: startDate,
      end: endDate,
      projectId: selectedProject,
      meetingNote: formData.meetingNote,
    };

    // Optimistically update UI
    if (editingEvent) {
      setEvents((prev) => prev.map((ev) => (ev === editingEvent ? optimistic : ev)));
    } else {
      setEvents((prev) => [...prev, optimistic]);
    }

    setSaving(true);
    setTaskGenerationError("");
    
    try {
      // Save meeting to server
      // Save meeting to server
      const { status, json } = await createMeetingOnServer(formData.title, startISO, endISO);

      setEvents((prev) =>
        prev.map((ev) =>
          ev === optimistic
            ? { ...ev, meetingID: json?.meetingID, googleEventId: json?.googleEventId }
            : ev
        )
      );

      // Generate tasks from meeting notes if provided
      if (formData.meetingNote && formData.meetingNote.trim()) {
        setGeneratingTasks(true);
        
        // Get member usernames for OpenAI validation
        const memberNames = projectMembers.map(m => m.username).filter(Boolean);
        console.log('👥 Project members for validation:', memberNames);
        
        const tasksFromAPI = await fetchTasksFromLambda(formData.meetingNote, memberNames);
        
        if (tasksFromAPI) {
          const parsedTasks = parseTasksFromAI(tasksFromAPI);
          const dateKey = moment(startDate).format("YYYY-MM-DD");
          
          // Track successful and failed saves
          let successCount = 0;
          let failCount = 0;
          
          // Add generated tasks to the task list AND save to backend
          const newTasks = [];
          
          for (const task of parsedTasks) {
            // Find the assigned user's ID if a name was mentioned
            let assignedUserIDs: string[] = [];
            if (task.assignedTo) {
              const matchedMember = projectMembers.find(
                m => m.username?.toLowerCase() === task.assignedTo?.toLowerCase()
              );
              if (matchedMember) {
                assignedUserIDs = [matchedMember.UserID];
              }
            }
            
            // Create local task for sidebar
            const localTask = {
              id: Date.now() + newTasks.length,
              date: dateKey,
              text: task.assignedTo 
                ? `${task.assignedTo}: ${task.text}${task.dueDate ? ` (Due: ${task.dueDate})` : ''}`
                : `${task.text}${task.dueDate ? ` (Due: ${task.dueDate})` : ''}`,
              status: "todo",
              projectId: selectedProject,
            };
            
            newTasks.push(localTask);
            
            // Save to backend
            const backendSuccess = await saveTaskToBackend({
              taskName: task.text,
              description: `Generated from meeting: ${formData.title}`,
              assignedUserIDs: assignedUserIDs,
              projectID: selectedProject,
              status: 'To Do',
              dueDate: task.dueDate || undefined,
            });
            
            if (backendSuccess) {
              successCount++;
            } else {
              failCount++;
            }
          }
          
          // Add all tasks to local state
          setTasks((prev) => [...prev, ...newTasks]);
          
          // Show notification based on results
          if (failCount > 0) {
            setTaskGenerationError(
              `Generated ${parsedTasks.length} tasks. ${successCount} saved to dashboard, ${failCount} failed to save.`
            );
          } else {
            console.log(`✅ Generated and saved ${successCount} tasks for project ${selectedProject}`);
          }
        }
        setGeneratingTasks(false);
      }

      if (status === 207) {
        console.warn("Saved locally, Google sync failed:", json?.googleError);
        alert("Meeting saved. Google Calendar sync failed. You can retry later.");
      }
    } catch (e: any) {
      console.error(e);
      alert(`Save failed: ${e.message || e}`);
      if (!editingEvent) {
        setEvents((prev) => prev.filter((ev) => ev !== optimistic));
      }
    } finally {
      setSaving(false);
      setGeneratingTasks(false);
      setFormData({ title: "", start: "", end: "", projectId: "", meetingNote: "" });
      setSelectedProject("");
      setEditingEvent(null);
      setShowForm(false);
    }
  };

  const handleDeleteEvent = () => {
    if (!editingEvent) return;
    setEvents((prev) => prev.filter((ev) => ev !== editingEvent));
    setEditingEvent(null);
    setShowForm(false);
  };

  return (
    <div
      className={`${poppins.className} flex flex-col h-screen bg-slate-50 text-slate-800`}
    >
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 p-6 bg-slate-900 text-slate-100 flex flex-col rounded-tr-3xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">
            Tasks for {moment(selectedDate).format("MMM D, YYYY")}
          </h2>

          {/* Task Input */}
          <div className="flex gap-2 mb-5">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="New task..."
              className="flex-1 px-3 py-2 rounded-md bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
            />
            <button
              onClick={handleAddTask}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-md px-3 py-2 font-medium transition"
            >
              +
            </button>
          </div>

          {/* Filter Dropdown */}
          <div className="mb-6">
            <label className="block text-xs text-slate-400 mb-1 uppercase tracking-wide">
              Filter tasks
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 text-sm rounded-md bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All</option>
              <option value="todo">To-Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {generatingTasks && (
            <div className="mb-4 p-3 bg-emerald-900/50 rounded-lg text-center text-sm">
              Generating tasks from meeting notes...
            </div>
          )}

          {taskGenerationError && (
            <div className="mb-4 p-3 bg-yellow-900/50 rounded-lg text-center text-sm border border-yellow-600">
              ⚠️ {taskGenerationError}
            </div>
          )}

          {/* Task Lists */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {["todo", "in-progress", "completed"].map((section) => (
              <div key={section}>
                <h3 className="text-emerald-400 font-semibold mb-2 capitalize">
                  {section.replace("-", " ")}
                </h3>
                <ul className="space-y-2">
                  {filteredTasks
                    .filter((t) => t.status === section)
                    .map((task) => (
                      <li
                        key={task.id}
                        className="bg-slate-800 p-3 rounded-lg flex justify-between items-center hover:bg-slate-700 transition"
                      >
                        <span className="text-sm">{task.text}</span>
                        <div className="flex gap-2 items-center">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleChangeStatus(task.id, e.target.value)
                            }
                            className="bg-slate-700 text-xs rounded-md px-2 py-1 border border-slate-600"
                          >
                            <option value="todo">To-Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-400 hover:text-red-500 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  {filteredTasks.filter((t) => t.status === section).length === 0 && (
                    <p className="text-slate-500 text-xs ml-2">
                      No tasks in this section.
                    </p>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Calendar */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Schedule Overview</h1>
            <button
              onClick={openAddForm}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 shadow transition"
            >
              + Add Event
            </button>
          </div>

          {/* Event Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-96 shadow-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4">
                  {editingEvent ? "Edit Event" : "Add Event"}
                </h2>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Event Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="border px-3 py-2 rounded-md"
                  />
                  <input
                    type="datetime-local"
                    value={formData.start}
                    onChange={(e) =>
                      setFormData({ ...formData, start: e.target.value })
                    }
                    className="border px-3 py-2 rounded-md"
                  />
                  <input
                    type="datetime-local"
                    value={formData.end}
                    onChange={(e) =>
                      setFormData({ ...formData, end: e.target.value })
                    }
                    className="border px-3 py-2 rounded-md"
                  />

                  {/* Project Selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Select Project *
                    </label>
                    {loadingProjects ? (
                      <div className="text-sm text-slate-500 p-2">Loading projects...</div>
                    ) : (
                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 bg-gray-50"
                      >
                        <option value="">Choose a project...</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {selectedProject && projectMembers.length > 0 && (
                      <div className="mt-2 text-xs text-slate-600">
                        <strong>Project members:</strong>{" "}
                        {projectMembers.map(m => m.username).join(", ")}
                      </div>
                    )}
                  </div>

                  {/* Meeting Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Meeting Notes
                    </label>
                    <p className="text-xs text-slate-500 mb-2">
                      Tasks will be automatically generated, validated against project members, and saved to the dashboard.
                    </p>
                    <textarea
                      value={formData.meetingNote}
                      onChange={(e) =>
                        setFormData({ ...formData, meetingNote: e.target.value })
                      }
                      placeholder="Enter meeting details... (e.g., 'Sarah: Finalize UI mockups by Friday')"
                      className="w-full border rounded-md px-3 py-2 text-sm h-32 resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  {editingEvent && (
                    <button
                      onClick={handleDeleteEvent}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setTaskGenerationError("");
                    }}
                    className="bg-gray-300 px-3 py-1 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    disabled={saving || generatingTasks || !selectedProject}
                    className="bg-emerald-500 text-white px-3 py-1 rounded-md hover:bg-emerald-600 disabled:bg-emerald-300"
                  >
                    {saving || generatingTasks ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}
          

          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "75vh" }}
              selectable
              onSelectEvent={(event: any) => openEditForm(event as UiEvent)}
              onSelectSlot={(slotInfo: any) => {
                setSelectedDate(moment(slotInfo.start).toDate());
              }}
              dayPropGetter={(date: Date) => {
                const isSelected = moment(date).isSame(selectedDate, "day");
                return {
                  style: {
                    border: isSelected ? "2px solid #10b981" : "1px solid #e5e7eb",
                    backgroundColor: isSelected ? "#ecfdf5" : "white",
                    transition: "all 0.2s ease",
                  },
                };
              }}
              eventPropGetter={() => ({
                style: {
                  backgroundColor: "#3b82f6",
                  borderRadius: "6px",
                  color: "white",
                  border: "none",
                  padding: "2px 6px",
                },
              })}
            />
          </div>
        </main>
      </div>
    </div>
  );
}