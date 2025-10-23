"use client";
import React, { useState } from "react";
import Navbar from "../components/Navbar";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState("Planwhich");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const users = [
    {
      name: "Kaitlyn",
      status: "Online Now",
      color: "text-green-500",
      desc: "Yes",
    },
    {
      name: "Aaron",
      status: "Away",
      color: "text-yellow-500",
      desc: "Meeting at 7:00",
    },
    { name: "Aarya", status: "Busy", color: "text-red-500", desc: "Backend" },
  ];

  const groups = [
    { name: "Planwhich", desc: "Build Night" },
    { name: "ACM", desc: "Meeting at 7:00" },
  ];

  function sendMessage() {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "You", text: input }]);
    setInput("");
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar on top */}
      <div className="shadow-md z-10">
        <Navbar />
      </div>

      {/* Main content below navbar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-white shadow-md p-4 flex flex-col overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">Chat</h2>

          {/* User list */}
          <div className="space-y-2 mb-6">
            {users.map((user) => (
              <div
                key={user.name}
                onClick={() => setSelectedChat(user.name)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                  selectedChat === user.name ? "bg-gray-100" : ""
                }`}
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-xl">
                  👤
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.desc}</p>
                </div>
                <span className={`text-xs font-semibold ${user.color}`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>

          {/* Group list */}
          <h3 className="text-lg font-semibold mb-2">Groups</h3>
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.name}
                onClick={() => setSelectedChat(group.name)}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                  selectedChat === group.name ? "bg-gray-100" : ""
                }`}
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 text-xl">
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

        {/* Chat area */}
        <div className="flex-1 p-8 flex flex-col overflow-hidden">
          <h2 className="text-xl font-semibold mb-2">To: {selectedChat}</h2>

          {/* Messages */}
          <div className="flex-1 border rounded-lg p-4 bg-white overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <p className="text-gray-400 italic">Write Message here</p>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className="flex justify-end">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-2xl max-w-xs">
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Input area */}
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write Message here"
              className="w-full border rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 h-32"
            />
            <div className="flex justify-center mt-3">
              <button
                onClick={sendMessage}
                className="bg-[#324A6D] text-white px-8 py-2 rounded-md hover:bg-[#2B3F5C]"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
