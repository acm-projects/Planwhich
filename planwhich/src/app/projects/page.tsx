"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import NewProjectModal from "../components/NewProjectModal";
import ProjectGrid from "../components/ProjectGrid";
import Navbar from "../components/Navbar";
import ToggleSwitch from "../components/ToggleSwitch";
import { getGoogleCalendarAuthUrl } from '../utils/googleCalendar';

const COGNITO_DOMAIN = "https://us-east-1mupktbr1j.auth.us-east-1.amazoncognito.com";
const CLIENT_ID = "462l892q21b3emij4ob4rjr5ji";

// Only these env vars are used
const API_URL = process.env.NEXT_PUBLIC_API_URL; // getCognitoTokens Lambda

export interface Project {
  id: number;
  name: string;
  description: string;
  image: string;
  isHidden?: boolean;
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showHiddenProjects, setShowHiddenProjects] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;
    console.log('🚀 Projects page mounted');
    handleAuthCallbacks();
  }, []);

  async function handleAuthCallbacks() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    console.log('🔍 URL params:', { hasCode: !!code, hasState: !!state, state });

    if (code && state?.startsWith('google_calendar_')) {
      const expected = sessionStorage.getItem('google_oauth_state');
      if (!expected || expected !== state) {
        console.error('❌ Google OAuth state mismatch');
        alert('Security check failed. Please try connecting Google again.');
        window.history.replaceState({}, '', '/projects');
        setIsLoading(false);
        return;
      }
      console.log('📅 Handling Google Calendar callback...');
      await handleGoogleCalendarCallback(code);
      return;
    }

    if (code && !state?.startsWith('google_calendar_')) {
      console.log('🔐 Handling Cognito callback...');
      await handleCognitoCallback(code);
      return;
    }

    console.log('✅ Regular page load');
    setIsLoading(false);
  }

  async function handleCognitoCallback(code: string) {
    try {
      console.log('🔄 Exchanging Cognito code...');

      if (!API_URL) {
        console.error('❌ API_URL is not defined');
        alert('Server is not configured. Please try again later.');
        window.location.href = '/';
        return;
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Failed to get Cognito tokens');
      }

      const data = await response.json();
      console.log('✅ Cognito tokens received');

      localStorage.setItem('userId', data.userId);
      localStorage.setItem('idToken', data.idToken);
      localStorage.setItem('email', data.email);
      if (data.name) localStorage.setItem('name', data.name);

      console.log('📅 Redirecting to Google Calendar OAuth...');
      window.history.replaceState({}, '', '/projects');
      const url = getGoogleCalendarAuthUrl();
      setTimeout(() => window.location.assign(url), 0);
      return;

    } catch (error) {
      console.error('❌ Cognito error:', error);
      alert('Authentication failed. Please try again.');
      window.location.href = '/';
    }
  }

  async function handleGoogleCalendarCallback(code: string) {
    try {
      const userId = localStorage.getItem('userId');
      const idToken = localStorage.getItem('idToken');

      if (!userId || !idToken) {
        console.error('❌ Missing tokens');
        alert('Session expired. Please log in again.');
        window.location.href = '/';
        return;
      }

      console.log('🔄 Exchanging Google code...');

      // read the env here to avoid ReferenceError
      const googleUrl = process.env.NEXT_PUBLIC_GOOGLE_URL;

      if (!googleUrl) {
        console.error('❌ GOOGLE_URL is not defined');
        alert('Server is not configured. Please try again later.');
        window.history.replaceState({}, '', '/projects');
        setIsLoading(false);
        return;
      }

      const response = await fetch(googleUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ code, userId })
      });

      if (!response.ok) {
        throw new Error('Failed to connect Google Calendar');
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Google Calendar connected!');
        window.history.replaceState({}, '', '/projects');
        setIsLoading(false);
      } else {
        throw new Error(data.error || 'Failed to connect');
      }
    } catch (error) {
      console.error('❌ Google Calendar error:', error);
      alert('Failed to connect Google Calendar.');
      window.history.replaceState({}, '', '/projects');
      setIsLoading(false);
    }
  }

  const handleCreateProject = (newProjectData: Omit<Project, "id">) => {
    const newProject: Project = {
      id: Date.now(),
      ...newProjectData,
      isHidden: false,
    };
    setProjects((prev) => [...prev, newProject]);
    setShowModal(false);
  };

  const toggleProjectVisibility = (projectId: number) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, isHidden: !project.isHidden }
          : project
      )
    );
  };

  const handleProjectClick = (projectId: number) => {
    console.log('handleProjectClick called with', projectId);
    router.push(`/dashboard?projectId=${projectId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to Cognito logout endpoint
    const logoutUrl =
      `${COGNITO_DOMAIN}/logout?` +
      `client_id=${CLIENT_ID}&` +
      `logout_uri=${encodeURIComponent(window.location.origin)}`;

    window.location.href = logoutUrl;
  };

  const visibleProjects = showHiddenProjects
    ? projects
    : projects.filter((project) => !project.isHidden);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700 font-medium">Setting up your account...</p>
          <p className="mt-2 text-sm text-gray-500">This will only take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>

            <div className="flex items-center gap-4">
              <ToggleSwitch
                label="See Hidden Projects"
                checked={showHiddenProjects}
                onChange={setShowHiddenProjects}
                size="md"
              />

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>

          <ProjectGrid
            projects={visibleProjects}
            onCreateClick={() => setShowModal(true)}
            onToggleVisibility={toggleProjectVisibility}
            onProjectClick={handleProjectClick}
          />
        </div>
        <NewProjectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onCreateProject={handleCreateProject}
        />
      </div>
    </>
  );
}