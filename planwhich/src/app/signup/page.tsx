"use client";

import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-orange-300 via-yellow-200 to-green-300 text-gray-800">
      <div className="bg-white rounded-xl shadow-xl border border-blue-400 p-10 w-96 text-center">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <Image src="/logo.png" alt="PlanWhich Logo" width={60} height={60} />
          <h1 className="text-2xl font-bold mt-2">PlanWhich</h1>
          <p className="text-gray-600 text-sm mt-1">
            Get started on your account
          </p>
        </div>

        {/* Sign Up Form */}
        <form className="flex flex-col gap-3 text-left">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Sign Up
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-2 my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="text-gray-500 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google Signup */}
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

        <p className="text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
