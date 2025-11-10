'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Folder, Upload, Plus, Trash2, Search } from 'lucide-react';

interface FileItem {
  id: number;
  name: string;
  size: string;
  sharedBy: string;
  date: string;
  type: 'document' | 'image';
}

interface FolderItem {
  id: number;
  name: string;
  isOpen: boolean;
  files: FileItem[];
  sharedBy: string;
  date: string;
}

export default function FileManager() {
  const [folders, setFolders] = useState<FolderItem[]>([
    { id: 1, name: 'Previous Flyers', isOpen: false, files: [], sharedBy: 'user', date: '16/02/2021' },
    { id: 2, name: 'Meeting Minutes', isOpen: false, files: [], sharedBy: 'user', date: '16/02/2021' },
  ]);

  const [rootFiles, setRootFiles] = useState<FileItem[]>([
    { id: 1, name: "This Year's Budget", size: '2.4 KB', sharedBy: 'user ', date: '16/01/2021', type: 'document' },
    { id: 2, name: 'Officer Photo', size: '156 KB', sharedBy: 'user', date: '16/02/2021', type: 'image' },
  ]);

  const [draggedFile, setDraggedFile] = useState<{ file: FileItem; fromFolderId: number | null } | null>(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
        setShowNewFolderInput(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: FileItem[] = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: formatFileSize(file.size),
      sharedBy: 'You',
      date: new Date().toLocaleDateString('en-GB'),
      type: file.type.startsWith('image/') ? 'image' : 'document',
    }));

    setRootFiles((prev) => [...prev, ...newFiles]);
  };

  const createFolder = () => {
    if (newFolderName.trim()) {
      setFolders((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: newFolderName,
          isOpen: false,
          files: [],
          sharedBy: 'You',
          date: new Date().toLocaleDateString('en-GB'),
        },
      ]);
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const toggleFolder = (folderId: number) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, isOpen: !f.isOpen } : f))
    );
  };

  const deleteFolder = (folderId: number) => {
    const folder = folders.find((f) => f.id === folderId);
    if (folder && folder.files.length > 0) {
      setRootFiles((prev) => [...prev, ...folder.files]);
    }
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
  };

  const deleteFile = (fileId: number, folderId: number | null = null) => {
    if (folderId) {
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId ? { ...f, files: f.files.filter((file) => file.id !== fileId) } : f
        )
      );
    } else {
      setRootFiles((prev) => prev.filter((f) => f.id !== fileId));
    }
  };

  const handleDragStart = (file: FileItem, fromFolderId: number | null = null) => {
    setDraggedFile({ file, fromFolderId });
  };

  const handleDrop = (toFolderId: number) => {
    if (!draggedFile) return;

    const { file, fromFolderId } = draggedFile;

    if (fromFolderId === toFolderId) {
      setDraggedFile(null);
      return;
    }

    if (fromFolderId === null) {
      setRootFiles((prev) => prev.filter((f) => f.id !== file.id));
    } else {
      setFolders((prev) =>
        prev.map((f) =>
          f.id === fromFolderId ? { ...f, files: f.files.filter((fl) => fl.id !== file.id) } : f
        )
      );
    }

    setFolders((prev) =>
      prev.map((f) => (f.id === toFolderId ? { ...f, files: [...f.files, file] } : f))
    );

    setDraggedFile(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getFileIcon = (type: 'document' | 'image') => {
    return (
      <div
        className={`w-5 h-5 rounded flex items-center justify-center text-white text-xs font-semibold ${
          type === 'image' ? 'bg-blue-500' : 'bg-red-500'
        }`}
      >
        📄
      </div>
    );
  };

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles = rootFiles.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100" ref={menuRef}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">My Files</h1>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Add Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="w-8 h-8 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>

                {showAddMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <label className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Upload Files</span>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => {
                          handleFileUpload(e);
                          setShowAddMenu(false);
                        }}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => {
                        setShowNewFolderInput(true);
                        setShowAddMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Folder className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">New Folder</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* New Folder Input */}
          {showNewFolderInput && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                placeholder="Folder name"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <button
                onClick={createFolder}
                className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }}
                className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* File List */}
        <div className="p-6 overflow-auto">
          <div className="grid grid-cols-3 gap-4 pb-3 border-b border-gray-100 mb-2">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
              Name <span className="text-gray-400">↑</span>
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shared by</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Creation Date</div>
          </div>

          <div className="space-y-1">
            {filteredFolders.map((folder) => (
              <div key={folder.id}>
                <div
                  className="grid grid-cols-3 gap-4 items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer group"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(folder.id)}
                >
                  <div className="flex items-center gap-3" onClick={() => toggleFolder(folder.id)}>
                    <div className="w-5 h-5 bg-yellow-400 rounded flex items-center justify-center">
                      📁
                    </div>
                    <span className="text-sm text-gray-900 font-medium">{folder.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-600">{folder.sharedBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{folder.date}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFolder(folder.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {folder.isOpen && folder.files.length > 0 && (
                  <div className="space-y-1 mt-1">
                    {folder.files.map((file) => (
                      <div
                        key={file.id}
                        draggable
                        onDragStart={() => handleDragStart(file, folder.id)}
                        className="grid grid-cols-3 gap-4 items-center p-3 hover:bg-gray-50 rounded-lg cursor-move group"
                      >
                        <div className="flex items-center gap-3 pl-8">
                          {getFileIcon(file.type)}
                          <span className="text-sm text-gray-900">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                          <span className="text-sm text-gray-600">{file.sharedBy}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{file.date}</span>
                          <button
                            onClick={() => deleteFile(file.id, folder.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {filteredFiles.map((file) => (
              <div
                key={file.id}
                draggable
                onDragStart={() => handleDragStart(file)}
                className="grid grid-cols-3 gap-4 items-center p-3 hover:bg-gray-50 rounded-lg cursor-move group"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.type)}
                  <span className="text-sm text-gray-900">{file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-600">{file.sharedBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{file.date}</span>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
