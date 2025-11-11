'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Folder, Upload, Plus, Trash2, Search } from 'lucide-react';

const FILES_API_URL = 'https://bi98ye86yf.execute-api.us-east-1.amazonaws.com/begin/files';

interface FileItem {
  id: number;
  name: string;
  size: string;
  sharedBy: string;
  date: string;
  type: 'document' | 'image';
  fileID?: string; // API identifier
}

interface FolderItem {
  id: number;
  name: string;
  isOpen: boolean;
  files: FileItem[];
  sharedBy: string;
  date: string;
}

interface FileManagerProps {
  projectId: string;
}

export default function FileManager({ projectId }: FileManagerProps) {
  const [folders, setFolders] = useState<FolderItem[]>([
  ]);

  const [rootFiles, setRootFiles] = useState<FileItem[]>([
  ]);

  const [draggedFile, setDraggedFile] = useState<{ file: FileItem; fromFolderId: number | null } | null>(null);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const idToken = localStorage.getItem('idToken');
      const userId = localStorage.getItem('userId');

      if (!idToken) {
        alert('Please log in again');
        setIsUploading(false);
        return;
      }

      if (!userId) {
        alert('User ID not found');
        setIsUploading(false);
        return;
      }

      // Upload each file to the API
      for (const file of files) {
        console.log('📁 Uploading file:', file.name, 'Size:', file.size);

        // Read file as base64
        const base64File = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/png;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const fileID = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Request body matching your Lambda's requirements
        const requestBody = {
          fileID: fileID,
          fileName: file.name,
          fileContent: base64File,
          contentType: file.type || 'application/octet-stream',
          uploaderID: userId,
          projectID: projectId
        };

        console.log('📤 Sending file to API:', {
          fileID,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          projectID: projectId
        });

        const response = await fetch(FILES_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ File upload failed:', errorData);
          throw new Error(errorData.error || 'Failed to upload file');
        }

        const data = await response.json();
        console.log('✅ File uploaded successfully:', data);

        // Add to local state
        const newFile: FileItem = {
          id: Date.now(),
          name: file.name,
          size: formatFileSize(file.size),
          sharedBy: 'You',
          date: new Date().toLocaleDateString('en-GB'),
          type: file.type.startsWith('image/') ? 'image' : 'document',
          fileID: fileID
        };

        setRootFiles((prev) => [...prev, newFile]);
      }

      console.log('✅ All files uploaded successfully');
    } catch (error) {
      console.error('💥 Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
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

  const deleteFile = async (fileId: number, folderId: number | null = null) => {
    // Find the file to get its fileID
    let fileToDelete: FileItem | undefined;
    
    if (folderId) {
      const folder = folders.find(f => f.id === folderId);
      fileToDelete = folder?.files.find(f => f.id === fileId);
    } else {
      fileToDelete = rootFiles.find(f => f.id === fileId);
    }

    // If file has API fileID, delete from backend
    if (fileToDelete?.fileID) {
      try {
        const idToken = localStorage.getItem('idToken');
        
        console.log('🗑️ Deleting file from API:', fileToDelete.fileID);
        
        const response = await fetch(`${FILES_API_URL}?fileID=${fileToDelete.fileID}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete file from server');
        }

        console.log('✅ File deleted from API');
      } catch (error) {
        console.error('❌ Error deleting file:', error);
        alert('Failed to delete file from server');
        return;
      }
    }

    // Remove from local state
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

<<<<<<< HEAD
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col">
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
                disabled={isUploading}
                className="w-8 h-8 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center disabled:bg-gray-400"
              >
                <Plus className="w-4 h-4" />
              </button>

              {showAddMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  <label className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {isUploading ? 'Uploading...' : 'Upload Files'}
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        handleFileUpload(e);
                        setShowAddMenu(false);
                      }}
                      className="hidden"
                      disabled={isUploading}
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

        {/* Upload Status */}
        {isUploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">Uploading file(s) to server...</p>
          </div>
        )}
      </div>

      {/* File List */}
      <div className="p-6 overflow-auto flex-1">
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
=======
 return (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[600px]">
    {/* Sticky Header */}
   <div className="px-6 pt-6 pb-4 border-b border-gray-100" ref={menuRef}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">My Files</h2>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Add Menu */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>

            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <label className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors text-sm">
                  <Upload className="w-4 h-4 text-gray-600" />
                  Upload Files
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
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors text-left text-sm"
                >
                  <Folder className="w-4 h-4 text-gray-600" />
                  New Folder
                </button>
              </div>
            )}
          </div>
>>>>>>> a7f15a18531d221423d4bc87f917068098ad5b03
        </div>
      </div>

      {/* New Folder Input */}
      {showNewFolderInput && (
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && createFolder()}
            placeholder="Folder name"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
          <button
            onClick={createFolder}
            className="px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
          >
            Create
          </button>
          <button
            onClick={() => {
              setShowNewFolderInput(false);
              setNewFolderName('');
            }}
            className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
<<<<<<< HEAD
  );
=======

    {/* Scrollable File List */}
    <div className="px-6 pb-6 overflow-y-auto">
      <div className="grid grid-cols-3 gap-4 pb-3 py-4 border-b border-gray-100 mb-2">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
          Name <span className="text-gray-400">↑</span>
        </div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shared by</div>
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Creation Date</div>
      </div>

      {/* Folder & File Items */}
      <div className="space-y-1">
        {filteredFolders.map((folder) => (
          <div key={folder.id}>
            <div
              className="grid grid-cols-3 gap-4 items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer group"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(folder.id)}
            >
              <div className="flex items-center gap-3" onClick={() => toggleFolder(folder.id)}>
                <div className="w-5 h-5 bg-yellow-400 rounded flex items-center justify-center">📁</div>
                <span className="text-sm text-gray-900 font-medium truncate">{folder.name}</span>
              </div>
              <span className="text-sm text-gray-600">{folder.sharedBy}</span>
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
                      <span className="text-sm text-gray-900 truncate">{file.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{file.sharedBy}</span>
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
            <span className="text-sm text-gray-600">{file.sharedBy}</span>
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

        {/* Empty State */}
        {filteredFolders.length === 0 && filteredFiles.length === 0 && (
          <p className="text-gray-500 text-sm text-center mt-4">No files found.</p>
        )}
      </div>
    </div>
  </div>
);
>>>>>>> a7f15a18531d221423d4bc87f917068098ad5b03
}