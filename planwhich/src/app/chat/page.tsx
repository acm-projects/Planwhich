"use client";
import React, { useState } from "react";
import Navbar from "../components/Navbar";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState("Planwhich");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ from: string; text: string }[]>(
    []
  );

  const users = [
    {
      name: "Kaitlyn",
      status: "Online",
      color: "bg-green-500",
      desc: "Yes",
    },
    {
      name: "Aaron",
      status: "Away",
      color: "bg-yellow-500",
      desc: "Meeting at 7:00",
    },
    { name: "Aarya", status: "Busy", color: "bg-red-500", desc: "Backend" },
  ];

  const groups = [
    { name: "Planwhich", desc: "Build Night" },
    { name: "ACM", desc: "Meeting at 7:00" },
  ];

  function initials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  }

  function sendMessage() {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "You", text: input }]);
    setInput("");
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <div className="w-72 bg-white border-r shadow-sm p-4 flex flex-col overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>

          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.name}
                onClick={() => setSelectedChat(user.name)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
                ${
                  selectedChat === user.name
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-gray-700">
                    {initials(user.name)}
                  </div>
                  <span
                    className={`${user.color} w-3 h-3 rounded-full absolute bottom-0 right-0 border-2 border-white`}
                  />
                </div>

                <div className="flex-1">
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-5" />

          <h3 className="text-lg font-semibold mb-2">Groups</h3>

          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.name}
                onClick={() => setSelectedChat(group.name)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition
                ${
                  selectedChat === group.name
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-xl">
                  👥
                </div>
                <div>
                  <p className="font-medium">{group.name}</p>
                  <p className="text-sm text-gray-500">{group.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHAT RIGHT SIDE */}
        <div className="flex-1 flex flex-col p-6">
          <h2 className="text-xl font-semibold mb-4">Chat — {selectedChat}</h2>

          <div className="flex-1 border rounded-lg bg-white p-4 overflow-y-auto space-y-4 shadow-sm">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center mt-10">No messages yet</p>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="flex justify-end">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl rounded-br-none max-w-sm leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* INPUT BAR */}
          <div className="mt-4 flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 h-24 resize-none"
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-md h-12 self-end"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
