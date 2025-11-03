'use client';
import { useState } from 'react';
import NewProjectModal from "../components/NewProjectModal";
import ProjectGrid from "../components/ProjectGrid";
import Navbar from '../components/Navbar';

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

  const handleCreateProject = (newProjectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      id: Date.now(),
      ...newProjectData
    };
    setProjects(prev => [...prev, newProject]);
    setShowModal(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
          </div>
          <ProjectGrid projects={projects} onCreateClick={() => setShowModal(true)} />
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