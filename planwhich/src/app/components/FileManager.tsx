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
  tags?: string[];
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
  initialFiles?: FileItem[];
  projectId?: string;
  onCreateFile?: (fileData: {
    fileName: string;
    fileType: string;
    fileSize: number;
    fileContent: string;
    tags?: string[];
    fileURL?: string;
  }) => Promise<any>;
}

export default function FileManager({ initialFiles = [], projectId, onCreateFile }: FileManagerProps = {}) {
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [rootFiles, setRootFiles] = useState<FileItem[]>(initialFiles);
  const [draggedFile, setDraggedFile] = useState<{ file: FileItem; fromFolderId: number | null } | null>(null);

  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // File upload + tag states
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [genericTags, setGenericTags] = useState(['Important', 'Personal', 'Work', 'Urgent', 'Archive']);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
        setShowNewFolderInput(false);
        setShowTagSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync internal files state with initialFiles prop
  useEffect(() => {
    setRootFiles(initialFiles);
  }, [JSON.stringify(initialFiles)]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadingFiles(files);
    setSelectedTags([]);
    setGenericTags(['Important', 'Personal', 'Work', 'Urgent', 'Archive']);
    setShowTagSelector(true);
    console.log('📁 New file upload started, tags reset to defaults');
  };

  const generateTags = async () => {
    if (uploadingFiles.length === 0) {
      console.log('❌ No files to generate tags for');
      return;
    }
    
    console.log('🏷️ Starting tag generation...');
    setIsGeneratingTags(true);
    
    try {
      const file = uploadingFiles[0];
      console.log('📄 Processing file:', file.name, 'Type:', file.type);
      
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const base64Content = fileContent.split(',')[1];
      console.log('✅ File read as base64, length:', base64Content.length);
      
      const requestBody = {
        fileContent: base64Content,
        projectId: projectId || 'default'
      };
      
      console.log('📤 Sending request to Lambda with projectId:', requestBody.projectId);
      
      const response = await fetch('https://pyssvvjvrajmf525fjaadeotj40wfoti.lambda-url.us-east-1.on.aws/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Lambda error response:', errorText);
        throw new Error('Failed to generate tags');
      }
      
      const data = await response.json();
      console.log('✅ Lambda response:', data);
      
      const aiTags = Array.isArray(data.tags) ? data.tags : [];
      console.log('🏷️ Generated tags:', aiTags);
      
      if (aiTags.length > 0) {
        const updated = [...new Set([...genericTags, ...aiTags])];
        console.log('📋 Updated tag list:', updated);
        setGenericTags(updated);
        setSelectedTags(aiTags);
        console.log('✅ Auto-selected generated tags:', aiTags);
      } else {
        console.log('⚠️ No tags generated');
      }
    } catch (error) {
      console.error('💥 Error generating tags:', error);
      alert('Failed to generate tags. Check console for details.');
    } finally {
      setIsGeneratingTags(false);
      console.log('🏁 Tag generation complete');
    }
  };

  const confirmFileUpload = async () => {
    try {
      if (onCreateFile) {
        // Use API to create files
        for (const file of uploadingFiles) {
          // Read file content as base64
          const fileContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          await onCreateFile({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileContent: fileContent,
            tags: selectedTags,
          });
        }
      } else {
        // Fallback to local state only
        const newFiles: FileItem[] = uploadingFiles.map((file, index) => ({
          id: Date.now() + index,
          name: file.name,
          size: formatFileSize(file.size),
          sharedBy: 'You',
          date: new Date().toLocaleDateString('en-GB'),
          type: file.type.startsWith('image/') ? 'image' : 'document',
          tags: selectedTags,
        }));
        setRootFiles((prev) => [...prev, ...newFiles]);
      }
      
      setShowTagSelector(false);
      setUploadingFiles([]);
      setSelectedTags([]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
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
    if (fileToDelete?.id) {
      try {
        const idToken = localStorage.getItem('idToken');
        
        console.log('🗑️ Deleting file from API:', fileToDelete.id);
        
        const response = await fetch(`${FILES_API_URL}?fileID=${fileToDelete.id}`, {
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[600px] w-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100" ref={menuRef}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">My Files</h2>
          <div className="flex items-center gap-3">
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

        {/* Tag selector for new uploads */}
        {showTagSelector && (
          <div className="relative flex gap-2 mt-3">
            <div className="flex-1 relative">
              <button
                type="button"
                className="w-full text-left px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 flex flex-wrap gap-1 items-center"
              >
                {selectedTags.length === 0 ? (
                  <span className="text-gray-400 text-sm">Select tags...</span>
                ) : (
                  selectedTags.map((tag) => (
                    <span key={tag} className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs">
                      {tag}
                    </span>
                  ))
                )}
              </button>

              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-auto">
                {genericTags.map((tag) => (
                  <div key={tag}>
                    <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag)}
                        onChange={() => {
                          if (selectedTags.includes(tag)) {
                            setSelectedTags(selectedTags.filter((t) => t !== tag));
                          } else {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700">{tag}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={generateTags} disabled={isGeneratingTags} className="px-2 py-1.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50">
              {isGeneratingTags ? 'Generating...' : 'Generate Tags'}
            </button>
            <button onClick={confirmFileUpload} className="px-3 py-2 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors">
              Upload
            </button>
            <button onClick={() => { setShowTagSelector(false); setUploadingFiles([]); setSelectedTags([]); }} className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-md hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Scrollable file list */}
      <div className="px-6 pb-6 overflow-y-auto">
        <div className="grid grid-cols-3 gap-4 pb-3 py-4 border-b border-gray-100 mb-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
            Name <span className="text-gray-400">↑</span>
          </div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Shared by</div>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Creation Date</div>
        </div>

        <div className="space-y-1">
          {/* Folders */}
          {filteredFolders.map((folder) => (
            <div key={folder.id}>
              <div
                className="grid grid-cols-3 gap-4 items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer group"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(folder.id)}
              >
                <div className="flex items-center gap-3 min-w-0" onClick={() => toggleFolder(folder.id)}>
                  <div className="w-5 h-5 bg-yellow-400 rounded flex items-center justify-center flex-shrink-0">📁</div>
                  <span className="text-sm text-gray-900 font-medium break-all overflow-wrap-anywhere">{folder.name}</span>
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

              {/* Files inside folder */}
              {folder.isOpen && folder.files.length > 0 && (
                <div className="space-y-1 mt-1">
                  {folder.files.map((file) => (
                    <div
                      key={file.id}
                      draggable
                      onDragStart={() => handleDragStart(file, folder.id)}
                      className="grid grid-cols-3 gap-4 items-start p-3 hover:bg-gray-50 rounded-lg cursor-move group"
                    >
                      <div className="flex flex-col gap-1 pl-8 min-w-0 overflow-hidden">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                          <span className="text-sm text-gray-900 break-all overflow-wrap-anywhere">{file.name}</span>
                        </div>
                        {file.tags && file.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {file.tags.map((tag) => (
                              <span key={tag} className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
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

          {/* Root files */}
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              draggable
              onDragStart={() => handleDragStart(file)}
              className="grid grid-cols-3 gap-4 items-start p-3 hover:bg-gray-50 rounded-lg cursor-move group"
            >
              <div className="flex flex-col gap-1 min-w-0 overflow-hidden">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                  <span className="text-sm text-gray-900 break-all overflow-wrap-anywhere">{file.name}</span>
                </div>
                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {file.tags.map((tag) => (
                      <span key={tag} className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
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

          {filteredFolders.length === 0 && filteredFiles.length === 0 && (
            <p className="text-gray-500 text-sm text-center mt-4">No files found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
