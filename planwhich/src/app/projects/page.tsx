'use client';
import { useState } from 'react';
import NewProjectModal from "../components/NewProjectModal";
import ProjectGrid from "../components/ProjectGrid";
import Navbar from '../components/Navbar';
import ToggleSwitch from '../components/ToggleSwitch';

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
            
            {/* See Hidden Projects Toggle */}
            <ToggleSwitch
              label="See Hidden Projects"
              checked={showHiddenProjects}
              onChange={setShowHiddenProjects}
              size="md"
            />
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