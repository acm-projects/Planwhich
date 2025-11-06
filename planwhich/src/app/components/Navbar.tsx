"use client";
import Image from "next/image";
import Link from "next/link";
import { GrAppsRounded } from "react-icons/gr";
import { RxCalendar } from "react-icons/rx";
import { IoChatbubblesOutline } from "react-icons/io5";
import { Bagel_Fat_One } from "next/font/google";

const bagelFatOne = Bagel_Fat_One({
  weight: "400", // Bagel Fat One only has a 400 weight
  subsets: ["latin"],
  display: "swap",
});

const Navbar = () => {
  return (
    <nav className="bg-white p-4">
      <div className="flex justify-between p-4 text-black">
        {/*Left section: Planwhich logo and name*/}
        <div className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.png"
              alt="PlanWhich logo"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
          <span
            className={`text-xl font-semibold text-gray-800 ${bagelFatOne.className}`}
          >
            PlanWhich
          </span>
        </div>
        {/*Right section: Icons buttons and user profile*/}
        <div className="flex items-center space-x-8">
          {/*Project icon*/}
          <Link href="/projects">
            <div className="text-gray-600 hover:text-gray-900">
              <GrAppsRounded className="text-2xl" />
            </div>
          </Link>
          {/*Calendar icon*/}
          <Link href="/calendar">
            <div className="text-gray-600 hover:text-gray-900">
              <RxCalendar className="text-2xl" />
            </div>
          </Link>
          {/*Chat icon*/}
          <Link href="/chat">
            <div className="text-gray-600 hover:text-gray-900">
              <IoChatbubblesOutline className="text-2xl" />
            </div>
          </Link>
          {/*User Profile*/}
          <Link href="/profile">
            <div className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden bg-gray-100 rounded-full dark:bg-pink-600">
              <span className="font-medium text-gray-600 dark:text-gray-300">
                K
              </span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
