'use client';

import { useEffect, useRef } from 'react';

interface StreamingEditorProps {
  streamingText: string;
  isGenerating: boolean;
}

export default function StreamingEditor({ streamingText, isGenerating }: StreamingEditorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamingText]);

  return (
    <div className="flex-1 flex flex-col bg-[#1a1a1a]">
      {/* Header */}
      <div className="px-4 py-2 bg-[#0a0a0a] border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {isGenerating && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
              </>
            )}
          </div>
          <span className="text-sm text-gray-400 font-mono">
            {isGenerating ? 'Generating code...' : 'Generation complete'}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>{streamingText.length.toLocaleString()} characters</span>
          <span>•</span>
          <span>{Math.ceil(streamingText.length / 500)} tokens</span>
        </div>
      </div>

      {/* Streaming Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-[#0a0a0a]"
      >
        <pre className="whitespace-pre-wrap break-words text-gray-300 leading-relaxed">
          {streamingText || 'Waiting for AI response...'}
          {isGenerating && (
            <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse" />
          )}
        </pre>
      </div>

      {/* Footer with generation info */}
      {isGenerating && (
        <div className="px-4 py-2 border-t border-gray-800 bg-[#111]">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <svg className="w-4 h-4 animate-spin text-purple-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>AI is crafting your code...</span>
          </div>
        </div>
      )}
    </div>
  );
}
