'use client';
import { useState } from 'react';
import { RxCross1 } from "react-icons/rx";
import ProjectForm from './ProjectForm';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: { name: string; description: string; image: string }) => void;
}

export default function NewProjectModal({ isOpen, onClose, onCreateProject }: NewProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    collaborators: [],
    image: '📋',
    imageFile: null as string | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          imageFile: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (formData.name.trim() && formData.description.trim() && formData.imageFile) {
      onCreateProject({
        name: formData.name,
        description: formData.description,
        image: formData.imageFile
      });
      setFormData({
        name: '',
        description: '',
        collaborators: [],
        image: '📋',
        imageFile: null
      });
    } else {
      alert('Please fill in all required fields: Project Name, Description, and Project Picture');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <RxCross1 />
          </button>
        </div>
        <ProjectForm
          formData={formData}
          onInputChange={handleInputChange}
          onImageUpload={handleImageUpload}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}