'use client';

import { useState, useRef, useEffect } from 'react';
import FileExplorer from '@/components/FileExplorer';
import CodeEditor from '@/components/CodeEditor';
import GenerationProgress from '@/components/GenerationProgress';
import { FileItem, Message } from '@/types';
import { findFileByPath, updateFileContent, addFile, deleteFile, buildPreviewHTML, downloadProject } from '@/lib/fileUtils';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [view, setView] = useState<'split' | 'code' | 'preview'>('split');
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const selectedFile = selectedFilePath ? findFileByPath(files, selectedFilePath) : null;

  // Helper function to try parsing and updating files incrementally
  const tryParseAndUpdateFiles = (text: string, operation: string) => {
    try {
      // Extract JSON from markdown code blocks if present
      let jsonStr = text.trim();
      if (jsonStr.includes('```json')) {
        const match = jsonStr.match(/```json\s*\n([\s\S]*?)\n```/);
        if (match) {
          jsonStr = match[1];
        }
      } else if (jsonStr.includes('```')) {
        const match = jsonStr.match(/```\s*\n([\s\S]*?)\n```/);
        if (match) {
          jsonStr = match[1];
        }
      }

      const parsed = JSON.parse(jsonStr);

      if (parsed.files && Array.isArray(parsed.files)) {
        const newFiles = parsed.files as Array<{ name: string; content: string }>;

        if (operation === 'create') {
          // Replace all files
          const fileItems: FileItem[] = newFiles.map(f => ({
            name: f.name,
            path: f.name,
            type: 'file',
            content: f.content,
          }));
          setFiles(fileItems);
          if (!selectedFilePath && fileItems.length > 0) {
            setSelectedFilePath(fileItems[0].path);
          }
        } else {
          // Update existing files or add new ones
          setFiles(currentFiles => {
            let updatedFiles = [...currentFiles];
            newFiles.forEach(newFile => {
              const existingFile = findFileByPath(updatedFiles, newFile.name);
              if (existingFile) {
                updatedFiles = updateFileContent(updatedFiles, newFile.name, newFile.content);
              } else {
                updatedFiles = addFile(updatedFiles, {
                  name: newFile.name,
                  path: newFile.name,
                  type: 'file',
                  content: newFile.content,
                });
              }
            });
            return updatedFiles;
          });
        }
      }
    } catch (e) {
      // Silently fail - JSON might not be complete yet
    }
  };

  const generateCode = async (userPrompt: string) => {
    if (!userPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setStreamingText('');
    const isFirstGeneration = files.length === 0;
    if (isFirstGeneration) {
      setShowWelcome(false);
    }

    // Determine operation mode
    const operation = isFirstGeneration ? 'create' : 'refine';

    // Add user message to history
    const newUserMessage: Message = { role: 'user', content: userPrompt };
    const updatedHistory = [...conversationHistory, newUserMessage];
    setConversationHistory(updatedHistory);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          conversationHistory: conversationHistory,
          currentFiles: files,
          operation,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate code');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedCode = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          accumulatedCode += chunk;

          // Update streaming text in real-time
          setStreamingText(accumulatedCode);

          // Try to parse and update files incrementally
          tryParseAndUpdateFiles(accumulatedCode, operation);
        }
      }

      // Parse the JSON response
      try {
        // Extract JSON from markdown code blocks if present
        let jsonStr = accumulatedCode.trim();
        if (jsonStr.includes('```json')) {
          const match = jsonStr.match(/```json\s*\n([\s\S]*?)\n```/);
          if (match) {
            jsonStr = match[1];
          }
        } else if (jsonStr.includes('```')) {
          const match = jsonStr.match(/```\s*\n([\s\S]*?)\n```/);
          if (match) {
            jsonStr = match[1];
          }
        }

        const parsed = JSON.parse(jsonStr);

        if (parsed.files && Array.isArray(parsed.files)) {
          const newFiles = parsed.files as Array<{ name: string; content: string }>;

          if (operation === 'create') {
            // Replace all files
            const fileItems: FileItem[] = newFiles.map(f => ({
              name: f.name,
              path: f.name,
              type: 'file',
              content: f.content,
            }));
            setFiles(fileItems);
            setSelectedFilePath(fileItems[0]?.path || null);
          } else {
            // Update existing files or add new ones
            let updatedFiles = [...files];
            newFiles.forEach(newFile => {
              const existingFile = findFileByPath(updatedFiles, newFile.name);
              if (existingFile) {
                updatedFiles = updateFileContent(updatedFiles, newFile.name, newFile.content);
              } else {
                updatedFiles = addFile(updatedFiles, {
                  name: newFile.name,
                  path: newFile.name,
                  type: 'file',
                  content: newFile.content,
                });
              }
            });
            setFiles(updatedFiles);
          }
        } else {
          // Fallback: treat as single HTML file
          const htmlFile: FileItem = {
            name: 'index.html',
            path: 'index.html',
            type: 'file',
            content: accumulatedCode,
          };
          setFiles([htmlFile]);
          setSelectedFilePath('index.html');
        }
      } catch (parseError) {
        console.error('Failed to parse JSON, treating as HTML:', parseError);
        // Fallback: treat as single HTML file
        const htmlFile: FileItem = {
          name: 'index.html',
          path: 'index.html',
          type: 'file',
          content: accumulatedCode,
        };
        setFiles([htmlFile]);
        setSelectedFilePath('index.html');
      }

      // Add assistant message to history
      setConversationHistory([...updatedHistory, { role: 'assistant', content: accumulatedCode }]);

    } catch (error) {
      console.error('Error generating code:', error);
      alert('Failed to generate code. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
      setPrompt('');

      // Clear streaming text after a delay to show completion
      setTimeout(() => {
        setStreamingText('');
      }, 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateCode(prompt);
  };

  const handleFileChange = (content: string) => {
    if (selectedFilePath) {
      setFiles(updateFileContent(files, selectedFilePath, content));
    }
  };

  const handleFileCreate = () => {
    setShowNewFileDialog(true);
  };

  const handleNewFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const newFile: FileItem = {
      name: newFileName,
      path: newFileName,
      type: 'file',
      content: '',
    };

    setFiles(addFile(files, newFile));
    setSelectedFilePath(newFileName);
    setNewFileName('');
    setShowNewFileDialog(false);
  };

  const handleFileDelete = (path: string) => {
    if (confirm(`Delete ${path}?`)) {
      setFiles(deleteFile(files, path));
      if (selectedFilePath === path) {
        setSelectedFilePath(files.filter(f => f.path !== path)[0]?.path || null);
      }
    }
  };

  // Update iframe with generated code
  useEffect(() => {
    if (iframeRef.current && files.length > 0) {
      const html = buildPreviewHTML(files);
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc && html) {
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
      }
    }
  }, [files]);

  const handleDownload = () => {
    downloadProject(files, 'vibe-project');
  };

  const copyCode = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      alert('Code copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#111]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <h1 className="text-xl font-bold text-white">Vibe Coder</h1>
          {!showWelcome && (
            <span className="text-sm text-gray-500 ml-4">
              Multi-file project • AI-powered
            </span>
          )}
        </div>

        {!showWelcome && files.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex bg-[#1a1a1a] rounded-lg p-1">
              <button
                onClick={() => setView('split')}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  view === 'split' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setView('code')}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  view === 'code' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setView('preview')}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  view === 'preview' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Preview
              </button>
            </div>

            <button
              onClick={copyCode}
              className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] text-white rounded-lg transition-colors text-sm"
            >
              Copy Code
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Download
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {showWelcome ? (
          /* Welcome Screen */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-2xl w-full space-y-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-4xl">V</span>
                </div>
                <h2 className="text-5xl font-bold text-white">
                  What do you want to create today?
                </h2>
                <p className="text-xl text-gray-400">
                  Describe your website and watch as AI crafts it with impeccable design
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., A stunning landing page for a tech startup with a hero section, features grid, and CTA..."
                    className="w-full h-32 px-6 py-4 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                    disabled={isGenerating}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl font-semibold text-lg transition-all disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating your website...
                    </span>
                  ) : (
                    'Generate Website ✨'
                  )}
                </button>
              </form>

              <div className="grid grid-cols-3 gap-4 pt-8">
                <button
                  onClick={() => setPrompt('A breathtaking personal portfolio with glassmorphism, dark theme, animated hero section, projects showcase with hover effects, skills grid, and contact form')}
                  className="p-4 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-xl text-left transition-colors group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">💼</div>
                  <div className="text-sm font-medium text-white">Portfolio</div>
                  <div className="text-xs text-gray-500 mt-1">Stunning showcase</div>
                </button>
                <button
                  onClick={() => setPrompt('A modern SaaS landing page with gradient hero, feature cards with icons, pricing table with hover effects, testimonials slider, and newsletter signup')}
                  className="p-4 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-xl text-left transition-colors group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🚀</div>
                  <div className="text-sm font-medium text-white">SaaS Page</div>
                  <div className="text-xs text-gray-500 mt-1">Convert visitors</div>
                </button>
                <button
                  onClick={() => setPrompt('A beautiful restaurant website with full-screen hero image, elegant menu with categories, photo gallery with lightbox, reservation form, and Google Maps integration')}
                  className="p-4 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-xl text-left transition-colors group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🍽️</div>
                  <div className="text-sm font-medium text-white">Restaurant</div>
                  <div className="text-xs text-gray-500 mt-1">Elegant dining</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Code & Preview View */
          <div className="flex-1 flex flex-col">
            {/* Workspace */}
            <div className="flex-1 flex overflow-hidden">
              {/* File Explorer */}
              {(view === 'split' || view === 'code') && (
                <FileExplorer
                  files={files}
                  selectedFile={selectedFilePath}
                  onFileSelect={setSelectedFilePath}
                  onFileCreate={handleFileCreate}
                  onFileDelete={handleFileDelete}
                />
              )}

              {/* Code Editor */}
              {(view === 'split' || view === 'code') && (
                <CodeEditor file={selectedFile} onChange={handleFileChange} />
              )}

              {/* Preview Panel */}
              {(view === 'split' || view === 'preview') && (
                <div className={`${view === 'split' ? 'w-1/2' : 'w-full'} flex flex-col bg-white border-l border-gray-800`}>
                  <div className="px-4 py-2 bg-[#0a0a0a] border-b border-gray-800">
                    <span className="text-sm text-gray-400 font-mono">Preview</span>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <iframe
                      ref={iframeRef}
                      className="w-full h-full border-none"
                      title="Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="border-t border-gray-800 bg-[#111] p-4">
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Refine your website... (e.g., 'Make the header sticky' or 'Add smooth scroll animations')"
                  className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  disabled={isGenerating}
                />
                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    'Refine ✨'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewFileDialog(false)}>
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Create New File</h3>
            <form onSubmit={handleNewFileSubmit} className="space-y-4">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g., utils.js, extra.css"
                className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                autoFocus
              />
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewFileDialog(false);
                    setNewFileName('');
                  }}
                  className="flex-1 px-4 py-2 bg-[#222] hover:bg-[#2a2a2a] text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFileName.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generation Progress Overlay */}
      <GenerationProgress
        streamingText={streamingText}
        isGenerating={isGenerating}
      />
    </div>
  );
}
