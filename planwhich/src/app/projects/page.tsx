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

// API endpoints
const API_URL = process.env.NEXT_PUBLIC_API_URL; // getCognitoTokens Lambda
const CREATE_USER_URL = "https://bi98ye86yf.execute-api.us-east-1.amazonaws.com/begin/users";
const CREATE_PROJECT_URL = "https://bi98ye86yf.execute-api.us-east-1.amazonaws.com/begin/projects";

export interface Project {
  id: string;
  name: string;
  description: string;
  image: string;
  isHidden?: boolean;
}

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showHiddenProjects, setShowHiddenProjects] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Setting up your account...');

  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;
    console.log('🚀 Projects page mounted');
    handleAuthCallbacks();
  }, []);

  // Fetch user's projects after authentication
  const fetchProjects = async () => {
    try {
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        console.log('⚠️ No auth token, skipping project fetch');
        return;
      }

      console.log('📦 Fetching user projects...');
      const response = await fetch(CREATE_PROJECT_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const fetchedProjects = await response.json();
      console.log('✅ Projects fetched:', fetchedProjects);
      setProjects(fetchedProjects);
      
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
    }
  };

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
      setLoadingMessage('Connecting Google Calendar...');
      await handleGoogleCalendarCallback(code);
      return;
    }

    if (code && !state?.startsWith('google_calendar_')) {
      console.log('🔐 Handling Cognito callback...');
      setLoadingMessage('Authenticating...');
      await handleCognitoCallback(code);
      return;
    }

    console.log('✅ Regular page load - ready to use');
    setIsLoading(false);
    
    // Fetch projects on regular page load
    await fetchProjects();
  }

  async function handleCognitoCallback(code: string) {
    try {
      console.log('🔄 Exchanging Cognito code...');

      if (!API_URL) {
        console.error('❌ API_URL is not defined');
        alert('Server is not configured. Please contact support.');
        window.location.href = '/';
        return;
      }

      // Step 1: Get Cognito tokens
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get authentication tokens');
      }

      const data = await response.json();
      console.log('✅ Cognito tokens received');

      // Step 2: Store tokens
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('idToken', data.idToken);
      localStorage.setItem('email', data.email);
      if (data.name) localStorage.setItem('name', data.name);

      // Step 3: Create/Update user in DynamoDB
      console.log('👤 Creating user in DynamoDB...');
      setLoadingMessage('Creating your account...');

      try {
        const userResponse = await fetch(CREATE_USER_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.idToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: data.email || '',
            name: data.name || ''
          })
        });

        if (!userResponse.ok) {
          const userError = await userResponse.json().catch(() => ({}));
          console.error('⚠️ Failed to create user:', userError);
          // Don't throw - continue to Google Calendar even if user creation fails
          alert('Warning: Account setup incomplete. Some features may not work properly.');
        } else {
          const userData = await userResponse.json();
          console.log('✅ User created/updated in DynamoDB:', userData);
        }
      } catch (userError) {
        console.error('⚠️ Error creating user:', userError);
        // Don't block the flow if user creation fails
        alert('Warning: Could not complete account setup. Please try logging out and back in.');
      }

      // Step 4: Redirect to Google Calendar OAuth
      console.log('📅 Redirecting to Google Calendar OAuth...');
      setLoadingMessage('Connecting to Google Calendar...');
      
      window.history.replaceState({}, '', '/projects');
      
      // Small delay to ensure state is saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const url = getGoogleCalendarAuthUrl();
      window.location.assign(url);
      return;

    } catch (error) {
      console.error('❌ Cognito error:', error);
      alert(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
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

      const googleUrl = process.env.NEXT_PUBLIC_GOOGLE_URL;

      if (!googleUrl) {
        console.error('❌ GOOGLE_URL is not defined');
        alert('Server configuration error. Please contact support.');
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to connect Google Calendar');
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Google Calendar connected!');
        window.history.replaceState({}, '', '/projects');
        
        // Done with authentication flow
        setLoadingMessage('Setup complete!');
        setIsLoading(false);
        
        // Fetch user's projects
        await fetchProjects();
      } else {
        throw new Error(data.error || 'Failed to connect Google Calendar');
      }
    } catch (error) {
      console.error('❌ Google Calendar error:', error);
      alert(`Failed to connect Google Calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
      window.history.replaceState({}, '', '/projects');
      setIsLoading(false);
    }
  }

  const handleCreateProject = async (newProjectData: Omit<Project, "id">) => {
    console.log('🚀 Creating project:', newProjectData);
    
    try {
      const idToken = localStorage.getItem('idToken');
      
      if (!idToken) {
        alert('Please log in again');
        return;
      }

      const response = await fetch(CREATE_PROJECT_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectName: newProjectData.name,
          description: newProjectData.description,
          image: newProjectData.image
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }

      const createdProject = await response.json();
      console.log('✅ Project created:', createdProject);
      
      // Add to local state
      const newProject: Project = {
        id: createdProject.projectId,
        name: createdProject.projectName,
        description: createdProject.description,
        image: createdProject.image,
        isHidden: false
      };
      
      setProjects(prev => [...prev, newProject]);
      setShowModal(false);
      
    } catch (error) {
      console.error('❌ Error creating project:', error);
      alert(`Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleProjectVisibility = (projectId: string) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? { ...project, isHidden: !project.isHidden }
          : project
      )
    );
  };

  const handleProjectClick = (projectId: string) => {
    console.log('handleProjectClick called with', projectId);
    const project = projects.find(p => p.id === projectId);
    if (project) {
      localStorage.setItem('currentProjectName', project.name);
    }
    router.push(`/dashboard?projectId=${projectId}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

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
          <p className="mt-6 text-xl text-gray-700 font-medium">{loadingMessage}</p>
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