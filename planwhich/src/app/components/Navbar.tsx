'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { GrAppsRounded } from "react-icons/gr";
import { RxCalendar } from "react-icons/rx";
import { IoChatbubblesOutline } from "react-icons/io5";
import { Bagel_Fat_One } from 'next/font/google';

const bagelFatOne = Bagel_Fat_One({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
});

interface NavbarProps {
    profileImage?: string;
    userInitials?: string;
    onSignOut?: () => void;
}

const Navbar = ({ profileImage, userInitials = 'U', onSignOut }: NavbarProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = () => {
        setIsDropdownOpen(false);
        if (onSignOut) {
            onSignOut();
        }
    };

    return(
        <nav className="bg-white p-4 border-b border-gray-200">
            <div className="flex justify-between p-4 text-black">
                {/*Left section: Planwhich logo and name*/}
                <div className="flex items-center space-x-2">
                    <div className="relative w-8 h-8">
                        <Image
                          src="/logo.png"
                          alt="PlanWhich logo"
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                    </div>
                    <span className={`text-xl font-semibold text-gray-800 ${bagelFatOne.className}`}>PlanWhich</span>
                </div>
                {/*Right section: Icons buttons and user profile*/}
                <div className="flex items-center space-x-8">
                    {/*Project icon*/}
                    <Link href="/projects">
                        <div className="text-gray-600 hover:text-gray-900">
                             <GrAppsRounded className="text-2xl"/>
                        </div>
                    </Link>
                    {/*Calendar icon*/}
                    <Link href="/calendar">
                        <div className="text-gray-600 hover:text-gray-900">
                             <RxCalendar className="text-2xl"/>
                        </div>
                    </Link>
                    {/*Chat icon*/}
                    <Link href="/chat">
                        <div className="text-gray-600 hover:text-gray-900">
                             <IoChatbubblesOutline className="text-2xl"/>
                        </div>
                    </Link>
                    {/*User Profile with Dropdown*/}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full bg-green-500 hover:ring-2 hover:ring-green-400 transition-all"
                        >
                            {profileImage ? (
                                <img 
                                    src={profileImage} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <span className="font-medium text-white">{userInitials}</span>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <Link href="/profile">
                                    <div 
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Profile
                                    </div>
                                </Link>
                                <Link href="/">
                                    <div 
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Signout
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
export default Navbar;