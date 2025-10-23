"use client";

import { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { Calendar as SmallCal } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./react-calendar-dark.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Poppins, Nunito } from "next/font/google";
import Navbar from "../components/Navbar";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"] });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600"] });
const localizer = momentLocalizer(moment);

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CalendarPage() {
  const [value, onChange] = useState<Value>(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
  });

  const openAddForm = () => {
    setFormData({ title: "", start: "", end: "" });
    setEditingEvent(null);
    setShowForm(true);
  };

  const openEditForm = (event: any) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      start: moment(event.start).format("YYYY-MM-DDTHH:mm"),
      end: moment(event.end).format("YYYY-MM-DDTHH:mm"),
    });
    setShowForm(true);
  };

  const handleSaveEvent = () => {
    if (!formData.title || !formData.start || !formData.end) return;

    if (editingEvent) {
      // Update existing event
      setEvents(
        events.map((ev) =>
          ev === editingEvent
            ? {
                ...ev,
                title: formData.title,
                start: new Date(formData.start),
                end: new Date(formData.end),
              }
            : ev
        )
      );
    } else {
      // Add new event
      setEvents([
        ...events,
        {
          title: formData.title,
          start: new Date(formData.start),
          end: new Date(formData.end),
        },
      ]);
    }

    setFormData({ title: "", start: "", end: "" });
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
      className={`${poppins.className} flex flex-col h-screen bg-gray-100 text-gray-800`}
    >
      {/* Navbar */}
      <Navbar />

      {/* Page layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-72 p-6 border-r border-gray-300 bg-gray-800 text-gray-100 shadow-md flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4 text-green-400">
            My Calendar
          </h2>

          <div className={`${poppins.className} w-full`}>
            <SmallCal
              onChange={onChange}
              value={value}
              className="rounded-lg shadow-md bg-gray-700 text-black p-2"
            />
          </div>

          <p className="mt-6 text-sm text-green-400">
            Selected Date:{" "}
            <span className="font-medium text-green-400">
              {value instanceof Date ? value.toDateString() : "Range"}
            </span>
          </p>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 relative bg-gray-50 text-gray-800">
          <div className="flex items-center justify-center mb-6 relative">
            <h1 className="text-2xl font-semibold text-gray-800">
              Schedule Overview
            </h1>
            <button
              onClick={openAddForm}
              className="absolute right-0 bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition"
            >
              + Add Event
            </button>
          </div>

          {/* Calendar */}
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "75vh" }}
              onSelectEvent={openEditForm}
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

          {/* Floating Add/Edit Event Form */}
          {showForm && (
            <div className="fixed bottom-6 right-6 z-50">
              <div className="bg-white p-6 rounded-xl shadow-lg w-96 border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">
                  {editingEvent ? "Edit Event" : "Add New Event"}
                </h2>

                <input
                  type="text"
                  placeholder="Event Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 mb-3"
                />

                <label className="text-sm text-gray-600">Start Time</label>
                <input
                  type="datetime-local"
                  value={formData.start}
                  onChange={(e) =>
                    setFormData({ ...formData, start: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 mb-3"
                />

                <label className="text-sm text-gray-600">End Time</label>
                <input
                  type="datetime-local"
                  value={formData.end}
                  onChange={(e) =>
                    setFormData({ ...formData, end: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md p-2 mb-5"
                />

                <div className="flex justify-between">
                  {editingEvent && (
                    <button
                      onClick={handleDeleteEvent}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingEvent(null);
                      }}
                      className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEvent}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
