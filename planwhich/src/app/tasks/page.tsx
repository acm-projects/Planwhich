"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

const defaultMeetingNotes = `During this morning's product sync, Aaron began by reviewing last week's progress on the mobile app. He mentioned that we still need to finalize the UI mockups before handing things off to development by next week. Rishi added that user-data syncing has improved after the recent fix, but he still needs to prepare a short performance summary for the leadership team before presenting this week. Aarya brought up issues with customer onboarding and suggested updating the tutorial screens. She agreed to create a list of improvements to the onboarding flow. Kaitlyn said she would follow up with marketing to see whether they planned to highlight the new feature in this month's newsletter. Toward the end, Aaron reminded everyone that someone must schedule a call with the design contractor to discuss icon replacements before this week's meeting. The meeting wrapped up with Jonathan offering to send a brief summary of action items.`;

//fetch from Lambda
async function fetchTasksFromLambda(meetingNotes) {
  try {
    const response = await fetch(
      'https://bi98ye86yf.execute-api.us-east-1.amazonaws.com/begin/ExtractMeetingNotesTasks',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textInput: meetingNotes
        })
      }
    );

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
function parseTasksFromAI(aiResponse) {
  const lines = aiResponse.split('\n').filter(line => line.trim());
  
  return lines.map((line, index) => {
    const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
    
    //"Name: Task by Date"
    const matchWithDue = cleanLine.match(/^([^:]+):\s*(.+?)\s+by\s+(.+)$/i);
    
    if (matchWithDue) {
      return {
        id: index + 1,
        text: matchWithDue[2].trim(),
        assignedTo: [matchWithDue[1].trim()],
        dueDate: matchWithDue[3].trim()
      };
    }
    
    //Name: Task"
    const matchNoDue = cleanLine.match(/^([^:]+):\s*(.+)$/);
    
    if (matchNoDue) {
      return {
        id: index + 1,
        text: matchNoDue[2].trim(),
        assignedTo: [matchNoDue[1].trim()],
        dueDate: null
      };
    }
    
    // Match: "Task by Date"
    const matchTaskWithDue = cleanLine.match(/^(.+?)\s+by\s+(.+)$/i);
    
    if (matchTaskWithDue) {
      return {
        id: index + 1,
        text: matchTaskWithDue[1].trim(),
        assignedTo: [],
        dueDate: matchTaskWithDue[2].trim()
      };
    }
    
    // Just task text, no name or due date
    return {
      id: index + 1,
      text: cleanLine,
      assignedTo: [],
      dueDate: null
    };
  });
}

export default function TasksSidebarPage() {
  const [meetingNotes, setMeetingNotes] = useState(defaultMeetingNotes);
  const [tasks, setTasks] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Function to generate tasks (called when button is clicked)
  async function generateTasks() {
    if (!meetingNotes.trim()) {
      setError("Please enter meeting notes before generating tasks.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasGenerated(true);
    
    const tasksFromAPI = await fetchTasksFromLambda(meetingNotes);
    
    if (tasksFromAPI) {
      const parsedTasks = parseTasksFromAI(tasksFromAPI);
      setTasks(parsedTasks);
    } else {
      setError("Failed to load tasks. Please try again later.");
      setTasks([]);
    }
    
    setLoading(false);
  }

  // Get people dynamically from tasks only
  const people = Array.from(
    new Set(tasks.flatMap((t) => t.assignedTo || []))
  );

  function assignPerson(taskId, peopleSelected) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, assignedTo: peopleSelected } : task
      )
    );
  }

  const grouped = tasks.reduce((acc, task) => {
    if (!task.assignedTo || task.assignedTo.length === 0) {
      acc["Unassigned"] = acc["Unassigned"] || [];
      acc["Unassigned"].push(task);
    } else {
      task.assignedTo.forEach((person) => {
        acc[person] = acc[person] || [];
        acc[person].push(task);
      });
    }
    return acc;
  }, {});

  return (
    <div className="flex h-screen bg-[#FFF8EC] text-[#2E2A24]">
      {/* Main column */}
      <main className="flex-1 p-6 overflow-y-auto space-y-6">
        <h1 className="text-2xl font-bold">Meeting Notes</h1>

        <textarea
          value={meetingNotes}
          onChange={(e) => setMeetingNotes(e.target.value)}
          placeholder="Type or paste your meeting notes here..."
          className="w-full min-h-[400px] bg-[#FAF4E6] p-4 border border-[#D3C2A5] rounded-2xl shadow-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#D3C2A5]"
        />
      </main>

      {/* Scrollable Right Sidebar */}
      <aside className="w-96 bg-[#F2E7D5] border-l border-[#D3C2A5] p-4 space-y-4 overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <button
            onClick={generateTasks}
            disabled={loading}
            className="px-4 py-2 bg-[#D3C2A5] rounded-xl text-[#2E2A24] font-semibold hover:bg-[#cbb899] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? "Generating..." : hasGenerated ? "Regenerate" : "Generate Tasks"}
          </button>
        </div>

        {!hasGenerated ? (
          <div className="text-center py-8 text-[#6b5e4b]">
            Click "Generate Tasks" to extract tasks from the meeting notes.
          </div>
        ) : loading ? (
          <div className="text-center py-8 text-[#6b5e4b]">Loading tasks...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600 bg-red-50 p-4 rounded-2xl border border-red-200">
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-[#6b5e4b]">No tasks found.</div>
        ) : (
          (selectedPerson ? grouped[selectedPerson] ?? [] : tasks).map(
            (task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl shadow bg-[#FAF4E6] border border-[#D3C2A5] flex flex-col gap-3"
              >
                <h3 className="font-semibold text-lg">{task.text}</h3>

                <div className="flex flex-col gap-2 text-sm text-[#6b5e4b]">
                  <div>
                    <span className="font-medium">Assigned to:</span>{" "}
                    <strong>{task.assignedTo?.join(", ") || "Unassigned"}</strong>
                  </div>
                  
                  {task.dueDate && (
                    <div>
                      <span className="font-medium">Due:</span>{" "}
                      <strong>{task.dueDate}</strong>
                    </div>
                  )}
                </div>

                <label className="text-xs text-[#6b5e4b]">Reassign people:</label>
                <ReactSelect
                  isMulti
                  options={people.map((p) => ({ value: p, label: p }))}
                  value={task.assignedTo?.map((p) => ({ value: p, label: p }))}
                  onChange={(selected) =>
                    assignPerson(
                      task.id,
                      selected ? selected.map((opt) => opt.value) : []
                    )
                  }
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </div>
            )
          )
        )}
        
        {hasGenerated && !loading && !error && tasks.length > 0 && (
          <button
            onClick={() => console.log("Saved", tasks)}
            className="w-full p-2 bg-[#D3C2A5] rounded-xl text-[#2E2A24] font-semibold hover:bg-[#cbb899]"
          >
            Save
          </button>
        )}
      </aside>
    </div>
  );
}