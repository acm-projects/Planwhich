"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
// CSS for react-big-calendar is loaded globally in `src/app/globals.css`.
// avoid importing it here to prevent duplicate PostCSS processing issues.
import { Poppins } from "next/font/google";
import Navbar from "../components/Navbar";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"] });
const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<
    { id: number; date: string; text: string; status: string }[]
  >([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
    teamMembers: [] as string[],
    meetingNote: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const teamOptions = [
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Ethan",
    "Sarah",
    "Jake",
    "Maria",
  ];

  // 🔹 Close dropdown when clicking outside
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

  // 🔹 Filter tasks for the selected day
  const tasksForDay = tasks.filter(
    (t) => t.date === moment(selectedDate).format("YYYY-MM-DD")
  );

  // 🔹 Add new task
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

  // 🔹 Delete task
  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // 🔹 Change status
  const handleChangeStatus = (id: number, newStatus: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  // 🔹 Filter logic
  const filteredTasks =
    filter === "all"
      ? tasksForDay
      : tasksForDay.filter((t) => t.status === filter);

  // 🔹 Event form logic
  const openAddForm = () => {
    setFormData({
      title: "",
      start: "",
      end: "",
      teamMembers: [],
      meetingNote: "",
    });
    setEditingEvent(null);
    setShowForm(true);
  };

  const openEditForm = (event: any) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      start: moment(event.start).format("YYYY-MM-DDTHH:mm"),
      end: moment(event.end).format("YYYY-MM-DDTHH:mm"),
      teamMembers: event.teamMembers || [],
      meetingNote: event.meetingNote || "",
    });
    setShowForm(true);
  };

  const handleSaveEvent = () => {
    if (!formData.title || !formData.start || !formData.end) return;

    const eventData = {
      title: formData.title,
      start: new Date(formData.start),
      end: new Date(formData.end),
      teamMembers: formData.teamMembers,
      meetingNote: formData.meetingNote,
    };

    if (editingEvent) {
      setEvents(
        events.map((ev) => (ev === editingEvent ? { ...ev, ...eventData } : ev))
      );
    } else {
      setEvents([...events, eventData]);
    }

    setFormData({
      title: "",
      start: "",
      end: "",
      teamMembers: [],
      meetingNote: "",
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleDeleteEvent = () => {
    if (!editingEvent) return;
    setEvents(events.filter((ev) => ev !== editingEvent));
    setEditingEvent(null);
    setShowForm(false);
  };

  return (
    <div
      className={`${poppins.className} flex flex-col h-screen bg-slate-50 text-slate-800`}
    >
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* ✅ Sidebar */}
        <aside className="w-80 p-6 bg-slate-900 text-slate-100 flex flex-col rounded-tr-3xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">
            Tasks for {moment(selectedDate).format("MMM D, YYYY")}
          </h2>

          {/* 🔹 Task Input */}
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

          {/* 🔹 Filter Dropdown */}
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

          {/* 🔹 Task Lists */}
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
                  {filteredTasks.filter((t) => t.status === section).length ===
                    0 && (
                    <p className="text-slate-500 text-xs ml-2">
                      No tasks in this section.
                    </p>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* ✅ Main Calendar */}
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

          {/* 🔹 Event Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
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

                  {/* 🔹 Searchable Multi-select for Team Members */}
                  <div ref={dropdownRef} className="relative">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Add Team Members
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full border rounded-md px-3 py-2 text-left bg-gray-50 hover:bg-gray-100 flex flex-wrap gap-1 items-center"
                    >
                      {formData.teamMembers.length > 0 ? (
                        formData.teamMembers.map((member) => (
                          <span
                            key={member}
                            className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md"
                          >
                            {member}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 text-sm">
                          Select team members...
                        </span>
                      )}
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b p-2">
                          <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-2 py-1 border rounded-md text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>

                        {teamOptions
                          .filter((member) =>
                            member
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          )
                          .map((member) => (
                            <label
                              key={member}
                              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={formData.teamMembers.includes(member)}
                                onChange={(e) => {
                                  const selected = e.target.checked
                                    ? [...formData.teamMembers, member]
                                    : formData.teamMembers.filter(
                                        (m) => m !== member
                                      );
                                  setFormData({
                                    ...formData,
                                    teamMembers: selected,
                                  });
                                }}
                                className="accent-emerald-500"
                              />
                              {member}
                            </label>
                          ))}

                        {teamOptions.filter((m) =>
                          m.toLowerCase().includes(searchTerm.toLowerCase())
                        ).length === 0 && (
                          <div className="px-3 py-2 text-slate-500 text-sm">
                            No matches found.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 🔹 Meeting Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Meeting Notes
                    </label>
                    <textarea
                      value={formData.meetingNote}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meetingNote: e.target.value,
                        })
                      }
                      placeholder="Enter meeting details..."
                      className="w-full border rounded-md px-3 py-2 text-sm h-24 resize-none"
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
                    onClick={() => setShowForm(false)}
                    className="bg-gray-300 px-3 py-1 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="bg-emerald-500 text-white px-3 py-1 rounded-md hover:bg-emerald-600"
                  >
                    Save
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
              onSelectEvent={openEditForm}
              onSelectSlot={(slotInfo: any) => {
                setSelectedDate(moment(slotInfo.start).toDate());
              }}
              dayPropGetter={(date: Date) => {
                const isSelected = moment(date).isSame(selectedDate, "day");
                return {
                  style: {
                    border: isSelected
                      ? "2px solid #10b981"
                      : "1px solid #e5e7eb",
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
