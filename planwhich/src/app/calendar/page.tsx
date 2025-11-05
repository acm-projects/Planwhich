"use client";

import { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { Calendar as SmallCal } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./react-calendar-dark.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"] });
const localizer = momentLocalizer(moment);

// hardcoded API endpoint
const MEETINGS_API = "https://bi98ye86yf.execute-api.us-east-1.amazonaws.com/dev/meetings";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

type UiEvent = {
  title: string;
  start: Date;
  end: Date;
  meetingID?: string;
  googleEventId?: string;
};

export default function CalendarPage() {
  const [value, onChange] = useState<Value>(new Date());
  const [events, setEvents] = useState<UiEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UiEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    start: "",
    end: "",
  });

  const getUserId = () => {
    try {
      return localStorage.getItem("userId") || "";
    } catch {
      return "";
    }
  };

  const openAddForm = () => {
    setFormData({ title: "", start: "", end: "" });
    setEditingEvent(null);
    setShowForm(true);
  };

  const openEditForm = (event: UiEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      start: moment(event.start).format("YYYY-MM-DDTHH:mm"),
      end: moment(event.end).format("YYYY-MM-DDTHH:mm"),
    });
    setShowForm(true);
  };

  async function createMeetingOnServer(title: string, startISO: string, endISO: string) {
    const payload = {
      meetingTitle: title,
      startTime: startISO,
      endTime: endISO,
      projectID: "",
      assignedUsers: [],
      userId: getUserId(), // temporary fallback until authorizer is wired
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

    const startDate = new Date(formData.start);
    const endDate = new Date(formData.end);
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const optimistic: UiEvent = {
      title: formData.title,
      start: startDate,
      end: endDate,
    };

    if (editingEvent) {
      setEvents((prev) => prev.map((ev) => (ev === editingEvent ? optimistic : ev)));
    } else {
      setEvents((prev) => [...prev, optimistic]);
    }

    setSaving(true);
    try {
      const { status, json } = await createMeetingOnServer(formData.title, startISO, endISO);

      setEvents((prev) =>
        prev.map((ev) =>
          ev === optimistic
            ? { ...ev, meetingID: json?.meetingID, googleEventId: json?.googleEventId }
            : ev
        )
      );

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
      setFormData({ title: "", start: "", end: "" });
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
    <div className={`${poppins.className} flex h-screen bg-gray-100 text-gray-800`}>
      <aside className="w-72 p-6 border-r border-gray-300 bg-gray-800 text-gray-100 shadow-md flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-green-400">My Calendar</h2>
        <SmallCal onChange={onChange} value={value} className="rounded-lg shadow-md bg-gray-700 text-black" />
        <p className="mt-6 text-sm text-green-400">
          Selected Date: <span className="font-medium text-green-400">{value instanceof Date ? value.toDateString() : "Range"}</span>
        </p>
      </aside>

      <main className="flex-1 p-8 relative bg-gray-50 text-gray-800">
        <div className="flex items-center justify-center mb-6 relative">
          <h1 className="text-2xl font-semibold text-gray-800">Schedule Overview</h1>
          <button
            onClick={openAddForm}
            className="absolute right-0 bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition"
          >
            + Add Event
          </button>
        </div>

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

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4">
                {editingEvent ? "Edit Event" : "Add New Event"}
              </h2>

              <input
                type="text"
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 mb-3"
              />

              <label className="text-sm text-gray-600">Start Time</label>
              <input
                type="datetime-local"
                value={formData.start}
                onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 mb-3"
              />

              <label className="text-sm text-gray-600">End Time</label>
              <input
                type="datetime-local"
                value={formData.end}
                onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 mb-5"
              />

              <div className="flex justify-between">
                {editingEvent && (
                  <button onClick={handleDeleteEvent} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
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
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
