'use client';
import React, { useState } from 'react';

interface FormData {
  name: string;
  description: string;
  collaborators: string[];
  image: string;
  imageFile: string | null;
}

interface ProjectFormProps {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function ProjectForm({
  formData,
  onInputChange,
  onImageUpload,
  onSubmit,
  onCancel
}: ProjectFormProps) {
  const [emailInput, setEmailInput] = useState('');
  const [collaborators, setCollaborators] = useState<string[]>(formData.collaborators || []);

  // --- Add collaborator on Enter ---
  const handleAddCollaborator = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && emailInput.trim()) {
      e.preventDefault();
      const email = emailInput.trim();

      if (!collaborators.includes(email)) {
        const updated = [...collaborators, email];
        setCollaborators(updated);
      }

      setEmailInput('');
    }
  };

  // --- Remove collaborator when X is clicked ---
  const handleRemoveCollaborator = (email: string) => {
    const updated = collaborators.filter(c => c !== email);
    setCollaborators(updated);
  };

  // --- Optionally sync collaborators with formData before submit ---
  const handleSubmit = () => {
    formData.collaborators = collaborators; // sync local state to formData before submit
    onSubmit();
  };

  return (
    <>
      <div className="space-y-4 mb-6">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder="Enter project name"
            className="w-full px-3 py-2 border border-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onInputChange}
            placeholder="Add a brief description..."
            className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            rows={3}
            required
          />
        </div>

        {/* Project Picture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Picture <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer inline-block text-left bg-white hover:bg-gray-50"
            >
              {formData.imageFile ? 'Change Picture' : 'Choose File'}
            </label>
          </div>
          {formData.imageFile && (
            <div className="mt-2 rounded-md overflow-hidden">
              <img src={formData.imageFile} alt="Preview" className="w-full h-32 object-cover" />
            </div>
          )}
        </div>

        {/* Collaborators */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign Collaborators
          </label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onKeyDown={handleAddCollaborator}
            placeholder="Add team member email and press Enter"
            className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          {/* List of collaborators */}
          {collaborators.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {collaborators.map((email, index) => (
                <span
                  key={index}
                  className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveCollaborator(email)}
                    className="ml-2 text-green-600 hover:text-red-500 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-green-400 text-white rounded-md hover:bg-green-500 transition font-medium"
        >
          Create
        </button>
      </div>
    </>
  );
}
