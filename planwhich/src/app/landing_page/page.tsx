"use client";

import Image from "next/image";
import Link from "next/link";
import { Bagel_Fat_One } from "next/font/google";

const bagelFatOne = Bagel_Fat_One({
  weight: "400", // Bagel Fat One only has a 400 weight
  subsets: ["latin"],
  display: "swap",
});

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-200 via-green-100 to-blue-200 text-gray-800 font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-12 py-6 bg-white/70 backdrop-blur-md shadow-md">
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="PlanWhich Logo" width={50} height={50} />
          <span
            className={`text-2xl font-semibold text-gray-800 ${bagelFatOne.className}`}
          >
            PlanWhich
          </span>
        </div>

        <div className="flex gap-4">
          <Link href="/main">
            <button className="border border-white-500 text-white-600 rounded-md px-4 py-2 hover:bg-black-50 transition">
              Login
            </button>
          </Link>

          <Link href="/main">
            <button className="border border-white-500 text-white-600 rounded-md px-4 py-2 hover:bg-black-50 transition">
              Sign Up
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-14 mt-20">
        <h2 className="text-6xl font-extrabold text-gray-900 mb-4">
          Bring Clarity to Your Team
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mb-8">
          Managing a project often means juggling tools and tracking progress
          across platforms.
          <span className="font-semibold"> PlanWhich</span> centralizes
          everything — so your team can focus on what matters.
        </p>
        <div className="flex gap-4">
          <Link href="/main">
            <button className="bg-black text-white rounded-md px-6 py-3 text-lg hover:bg-neutral-800 transition">
              Get Started
            </button>
          </Link>
        </div>
        <Image
          src="/dashboard-preview.png"
          alt="Dashboard Preview"
          width={800}
          height={400}
          className="mt-12 rounded-xl shadow-2xl border border-gray-200"
        />
      </section>

      {/* Features Section */}
      <section id="features" className="px-12 py-24 bg-white">
        <h2 className="text-4xl font-bold text-center mb-16">
          Powerful Features
        </h2>

        {/* ✅ Added px-8 and max-w-6xl */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto px-8">
          {[
            {
              title: "Schedule Meetings",
              desc: "Plan smarter with shared calendars and reminders.",
            },
            {
              title: "Track Progress",
              desc: "Visualize goals and milestones in one place.",
            },
            {
              title: "Centralized Resources",
              desc: "Keep your documents, notes, and files organized.",
            },
            {
              title: "Communicate Better",
              desc: "Collaborate seamlessly with built-in messaging.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-gradient-to-b from-blue-50 to-white rounded-xl shadow-md border border-blue-200 p-8 text-center hover:shadow-xl transition"
            >
              <h3 className="text-2xl font-semibold text-blue-700 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-200 py-10 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} PlanWhich. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
