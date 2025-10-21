'use client';
import { useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { Project } from '../projects/page';
import ToggleSwitch from './ToggleSwitch';

interface ProjectCardProps {
  project: Project;
  onToggleVisibility?: (projectId: number) => void;
}

export default function ProjectCard({ project, onToggleVisibility }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="w-96 h-80 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col">
      {/* Header with Title and Three-Dot Menu */}
      <div className="h-20 p-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1">{project.name}</h3>
        
        {/* Three Dots Menu Button */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Project menu"
          >
            <BsThreeDotsVertical className="text-gray-600 text-xl" />
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <>
              {/* Backdrop to close menu when clicking outside */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              
              {/* Menu Content */}
              <div 
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 py-2 border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-2">
                  <ToggleSwitch
                    label="Hide Project"
                    checked={project.isHidden || false}
                    onChange={() => {
                      onToggleVisibility?.(project.id);
                    }}
                    size="sm"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Project Image/Content Area */}
      <div className="bg-gradient-to-br from-blue-100 to-purple-100 flex-1 flex items-center justify-center text-6xl overflow-hidden">
        {typeof project.image === 'string' && project.image.startsWith('data:') ? (
          <img src={project.image} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          project.image
        )}
      </div>
    </div>
  );
}