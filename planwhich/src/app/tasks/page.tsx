"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

const ReactSelect = dynamic(() => import("react-select"), { ssr: false });

const meetingParagraph = `During this morning’s product sync, Aaron began by reviewing last week’s progress on the mobile app. She mentioned that we still need to finalize the UI mockups before handing things off to development. Rishi added that user-data syncing has improved after the recent fix, but he still needs to prepare a short performance summary for the leadership team. Aarya brought up issues with customer onboarding and suggested updating the tutorial screens. She agreed to create a list of improvements to the onboarding flow. Kaitlyn said he would follow up with marketing to see whether they planned to highlight the new feature in this month’s newsletter. Toward the end, Aaron reminded everyone that someone must schedule a call with the design contractor to discuss icon replacements. The meeting wrapped up with Jonathan offering to send a brief summary of action items.`;

const extractedTasks = [
  { id: 1, text: "Finalize UI mockups", assignedTo: [] },
  { id: 2, text: "Prepare performance summary", assignedTo: [] },
  { id: 3, text: "List improvements to onboarding", assignedTo: [] },
  {
    id: 4,
    text: "Follow up with marketing about newsletter",
    assignedTo: [],
  },
  { id: 5, text: "Schedule call with design contractor", assignedTo: [] },
  { id: 6, text: "Send meeting summary", assignedTo: [] },
];

const presetPeople = ["Kaitlyn", "Rishi", "Aaron", "Aarya"];

export default function TasksSidebarPage() {
  const [tasks, setTasks] = useState(extractedTasks);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const people = Array.from(
    new Set([...presetPeople, ...tasks.flatMap((t) => t.assignedTo || [])])
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

        <p className="bg-[#FAF4E6] p-4 border border-[#D3C2A5] rounded-2xl shadow-sm leading-relaxed">
          {meetingParagraph}
        </p>
      </main>

      {/* Scrollable Right Sidebar */}
      <aside className="w-96 bg-[#F2E7D5] border-l border-[#D3C2A5] p-4 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-semibold">Tasks</h2>

        {(selectedPerson ? grouped[selectedPerson] ?? [] : tasks).map(
          (task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl shadow bg-[#FAF4E6] border border-[#D3C2A5] flex flex-col gap-3"
            >
              <h3 className="font-semibold text-lg">{task.text}</h3>

              <div className="text-sm text-[#6b5e4b]">
                Assigned to:{" "}
                <strong>{task.assignedTo?.join(", ") || "Unassigned"}</strong>
              </div>

              <label className="text-xs text-[#6b5e4b]">Assign people:</label>
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
        )}
        <button
          onClick={() => console.log("Saved", tasks)}
          className="w-full p-2 bg-[#D3C2A5] rounded-xl text-[#2E2A24] font-semibold hover:bg-[#cbb899]"
        >
          Save
        </button>
      </aside>
    </div>
  );
}
