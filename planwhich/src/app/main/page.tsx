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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-orange-300 via-yellow-200 to-green-300 text-gray-800">
      {/* Center Card */}
      <div className="bg-white rounded-xl shadow-xl border border-blue-400 p-10 w-96 text-center">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-6">
          {/* Replace with your own logo in /public folder */}
          <Image src="/logo.png" alt="PlanWhich Logo" width={60} height={60} />
          <h1 className="text-2xl font-bold mt-2">PlanWhich</h1>
          <p className="text-gray-600 text-sm mt-1">
            Plan and coordinate your projects <br />
            with ease all on one platform
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-6">Login or Sign Up</h2>

        {/* Google Button */}
        <button className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-full py-2 hover:bg-gray-100 transition">
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google Icon"
            width={20}
            height={20}
          />
          <span className="font-medium text-gray-700">
            Continue with Google
          </span>
        </button>

        <p className="text-white text-sm mt-1">
          Plan and coordinate your projects <br />
          with ease all on one platformhhhhhhhhhhhhh
          <br />
          with ease all on one platform <br />
          with ease all on one platform
        </p>
      </div>
    </div>
  );
}
