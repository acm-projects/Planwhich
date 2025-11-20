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
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;
    console.log('🚀 Projects page mounted');
    
    // Debug: Log user attributes from localStorage
    console.log('User attributes:', {
      userId: localStorage.getItem('userId'),
      email: localStorage.getItem('email'),
      name: localStorage.getItem('name'),
      profilePicture: localStorage.getItem('profilePicture'),
      idToken: localStorage.getItem('idToken') ? 'Present' : 'Missing'
    });
    console.log('🖼️ Profile picture in localStorage:', localStorage.getItem('profilePicture'));
    
    handleAuthCallbacks();
  }, []);

  // Fetch user's profile picture from database if not in localStorage
  const fetchUserProfilePicture = async () => {
    const currentProfilePicture = localStorage.getItem('profilePicture');
    if (currentProfilePicture) {
      return; // Already have it
    }

    try {
      const idToken = localStorage.getItem('idToken');
      const userId = localStorage.getItem('userId');
      
      if (!idToken || !userId) {
        return;
      }

      console.log('🔍 Fetching user profile picture from database...');
      
      // Use the postUser API to update the user and get back the stored data
      const response = await fetch(CREATE_USER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: localStorage.getItem('email') || '',
          name: localStorage.getItem('name') || ''
        })
      });

      if (response.ok) {
        // Now try to get the user data by checking if the Lambda stored a profile picture
        // We'll need to decode the ID token to get the profile picture
        const idToken = localStorage.getItem('idToken');
        if (idToken) {
          try {
            const tokenParts = idToken.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log('🔍 ID token payload:', payload);
              console.log('🖼️ Picture in token:', payload.picture);
              if (payload.picture) {
                localStorage.setItem('profilePicture', payload.picture);
                setProfilePicture(payload.picture);
                console.log('✅ Profile picture extracted from ID token:', payload.picture);
              } else {
                console.log('❌ No picture field in ID token');
              }
            }
          } catch (error) {
            console.error('❌ Error decoding ID token:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fetching profile picture:', error);
    }
  };



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
    
    // Initialize profile picture from localStorage
    const storedPicture = localStorage.getItem('profilePicture');
    if (storedPicture) {
      setProfilePicture(storedPicture);
    } else {
      // Try to extract profile picture from existing ID token
      const idToken = localStorage.getItem('idToken');
      if (idToken) {
        try {
          const parts = idToken.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('🔍 ID token payload:', payload);
            if (payload.picture) {
              localStorage.setItem('profilePicture', payload.picture);
              setProfilePicture(payload.picture);
              console.log('✅ Profile picture extracted from existing ID token:', payload.picture);
            } else {
              console.log('❌ No picture in ID token - Cognito not configured properly or user created before attribute mapping');
            }
          }
        } catch (error) {
          console.error('❌ Error extracting from ID token:', error);
        }
      }
      // Try to get profile picture from database
      await fetchUserProfilePicture();
    }
    
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
      console.log('✅ Cognito tokens received:', data);
      console.log('🖼️ Profile picture from Cognito:', data.profilePicture);
      console.log('🖼️ Full response data:', JSON.stringify(data, null, 2));

      // Step 2: Store tokens
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('idToken', data.idToken);
      localStorage.setItem('email', data.email);
      if (data.name) localStorage.setItem('name', data.name);
      if (data.profilePicture) {
        localStorage.setItem('profilePicture', data.profilePicture);
        console.log('✅ Profile picture saved to localStorage:', data.profilePicture);
      } else {
        console.log('❌ No profile picture in response');
      }

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
            name: data.name || '',
            profilePicture: data.profilePicture || ''
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

      // Step 4: Check if user already has Google Calendar connected
      const hasGoogleTokens = data.hasGoogleTokens || false; // Assume Lambda returns this
      
      if (hasGoogleTokens) {
        console.log('✅ User already has Google Calendar connected, skipping OAuth');
        window.history.replaceState({}, '', '/projects');
        setIsLoading(false);
        await fetchProjects();
        return;
      }
      
      // Redirect to Google Calendar OAuth
      console.log('📅 Redirecting to Google Calendar OAuth...');
      setLoadingMessage('Connecting to Google Calendar...');
      
      window.history.replaceState({}, '', '/projects');
      
      // Longer delay to ensure localStorage is saved
      console.log('⏳ Waiting before redirect to ensure localStorage is saved...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('🖼️ Profile picture in localStorage before redirect:', localStorage.getItem('profilePicture'));
      
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

  const storedProfilePicture = localStorage.getItem('profilePicture');
  const userName = localStorage.getItem('name') || 'User';
  const userInitials = userName.charAt(0).toUpperCase();
  const currentProfilePicture = profilePicture || storedProfilePicture;

  return (
    <>
      <Navbar 
        profileImage={currentProfilePicture || undefined}
        userInitials={userInitials}
      />
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