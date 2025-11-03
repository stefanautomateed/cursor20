'use client';

import dynamic from 'next/dynamic';
import { FileItem } from '@/types';
import { getFileExtension, getLanguageFromExtension } from '@/lib/fileUtils';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  file: FileItem | null;
  onChange: (content: string) => void;
}

export default function CodeEditor({ file, onChange }: CodeEditorProps) {
  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1a1a1a] text-gray-500">
        <div className="text-center space-y-2">
          <div className="text-4xl">📝</div>
          <div className="text-sm">Select a file to edit</div>
        </div>
      </div>
    );
  }

  const extension = getFileExtension(file.name);
  const language = getLanguageFromExtension(extension);

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a]">
      <div className="px-4 py-2 bg-[#0a0a0a] border-b border-gray-800 flex items-center">
        <span className="text-sm text-gray-400 font-mono">{file.name}</span>
      </div>
      <div className="flex-1">
        <MonacoEditor
          height="100%"
          language={language}
          value={file.content || ''}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly: false,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
            fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
            fontLigatures: true,
          }}
          onChange={(value) => onChange(value || '')}
        />
      </div>
    </div>
  );
}
