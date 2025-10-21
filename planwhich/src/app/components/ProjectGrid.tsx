import ProjectCard from './ProjectCard';
import CreateProjectButton from './CreateProjectButton';
import { Project } from '../projects/page';

interface ProjectGridProps {
  projects: Project[];
  onCreateClick: () => void;
  onToggleVisibility?: (projectId: number) => void;
}

export default function ProjectGrid({ 
  projects, 
  onCreateClick,
  onToggleVisibility
}: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Create New Project Card */}
      <CreateProjectButton onClick={onCreateClick} />
      
      {/* Existing Project Cards */}
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project}
          onToggleVisibility={onToggleVisibility}
        />
      ))}
    </div>
  );
}