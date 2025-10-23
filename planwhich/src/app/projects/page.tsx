'use client';
import { useState } from 'react';
import NewProjectModal from "../components/NewProjectModal";
import ProjectGrid from "../components/ProjectGrid";
import Navbar from '../components/Navbar';
import ToggleSwitch from '../components/ToggleSwitch';
const COGNITO_DOMAIN = "https://us-east-1mupktbr1j.auth.us-east-1.amazoncognito.com";
const CLIENT_ID = "462l892q21b3emij4ob4rjr5ji";

export interface Project {
  id: number;
  name: string;
  description: string;
  image: string;
  isHidden?: boolean;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showHiddenProjects, setShowHiddenProjects] = useState(false);

  const handleCreateProject = (newProjectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      id: Date.now(),
      ...newProjectData,
      isHidden: false
    };
    setProjects(prev => [...prev, newProject]);
    setShowModal(false);
  };

  const toggleProjectVisibility = (projectId: number) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === projectId
          ? { ...project, isHidden: !project.isHidden }
          : project
      )
    );
  };

    const handleLogout = () => {
    // Clear any stored tokens
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to Cognito logout endpoint
    const logoutUrl = `${COGNITO_DOMAIN}/logout?` +
      `client_id=${CLIENT_ID}&` +
      `logout_uri=${encodeURIComponent(window.location.origin)}`;
    
    window.location.href = logoutUrl;
  };

  // Filter projects based on showHiddenProjects toggle
  const visibleProjects = showHiddenProjects
    ? projects
    : projects.filter(project => !project.isHidden);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
            
            <div className="flex items-center gap-4">
              {/* See Hidden Projects Toggle */}
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