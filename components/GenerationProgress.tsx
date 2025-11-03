'use client';

import { useEffect, useRef } from 'react';

interface GenerationProgressProps {
  streamingText: string;
  isGenerating: boolean;
}

export default function GenerationProgress({ streamingText, isGenerating }: GenerationProgressProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamingText]);

  if (!isGenerating && !streamingText) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-8">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                {isGenerating ? (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              {isGenerating && (
                <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg animate-ping opacity-75" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {isGenerating ? 'Generating Your Website...' : 'Generation Complete'}
              </h3>
              <p className="text-sm text-gray-400">
                {isGenerating ? 'AI is crafting your code' : 'Ready to preview'}
              </p>
            </div>
          </div>
          {isGenerating && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Live</span>
            </div>
          )}
        </div>

        {/* Streaming Content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 font-mono text-sm bg-[#0a0a0a]"
        >
          <pre className="whitespace-pre-wrap break-words text-gray-300 leading-relaxed">
            {streamingText || 'Starting generation...'}
            {isGenerating && (
              <span className="inline-block w-2 h-4 bg-purple-500 ml-1 animate-pulse" />
            )}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 bg-[#111]">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-400">
              <span>
                {streamingText.length.toLocaleString()} characters
              </span>
              <span>•</span>
              <span>
                {Math.ceil(streamingText.length / 500)} tokens (approx)
              </span>
            </div>
            {!isGenerating && (
              <div className="text-green-400 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Complete</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
