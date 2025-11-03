'use client';

import { FileItem } from '@/types';
import { useState } from 'react';

interface FileExplorerProps {
  files: FileItem[];
  selectedFile: string | null;
  onFileSelect: (path: string) => void;
  onFileCreate: () => void;
  onFileDelete: (path: string) => void;
}

export default function FileExplorer({
  files,
  selectedFile,
  onFileSelect,
  onFileCreate,
  onFileDelete,
}: FileExplorerProps) {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  const getFileIcon = (name: string) => {
    if (name.endsWith('.html')) return '📄';
    if (name.endsWith('.css')) return '🎨';
    if (name.endsWith('.js')) return '⚡';
    if (name.endsWith('.json')) return '📋';
    return '📁';
  };

  return (
    <div className="w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-300">FILES</span>
        <button
          onClick={onFileCreate}
          className="text-gray-400 hover:text-white transition-colors"
          title="New File"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.path}
            className={`group relative flex items-center justify-between px-4 py-2 cursor-pointer transition-colors ${
              selectedFile === file.path
                ? 'bg-purple-600/20 text-purple-400'
                : 'text-gray-400 hover:bg-[#222] hover:text-white'
            }`}
            onClick={() => onFileSelect(file.path)}
            onMouseEnter={() => setHoveredFile(file.path)}
            onMouseLeave={() => setHoveredFile(null)}
          >
            <div className="flex items-center space-x-2 min-w-0">
              <span className="text-base flex-shrink-0">{getFileIcon(file.name)}</span>
              <span className="text-sm truncate">{file.name}</span>
            </div>

            {hoveredFile === file.path && files.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDelete(file.path);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                title="Delete file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-500">
        {files.length} {files.length === 1 ? 'file' : 'files'}
      </div>
    </div>
  );
}
