'use client';

interface CreateProjectButtonProps {
  onClick: () => void;
}

export default function CreateProjectButton({ onClick }: CreateProjectButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-96 h-80 border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center hover:border-green-400 hover:bg-green-50 transition cursor-pointer"
    >
      <div className="text-4xl mb-2 text-gray-600">+</div>
      <p className="text-gray-600 font-medium">Create New Project</p>
    </button>
  );
}