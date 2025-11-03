'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [view, setView] = useState<'split' | 'code' | 'preview'>('split');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generateCode = async (userPrompt: string) => {
    if (!userPrompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setShowWelcome(false);

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
          setGeneratedCode(accumulatedCode);
        }
      }

      // Add assistant message to history
      setConversationHistory([...updatedHistory, { role: 'assistant', content: accumulatedCode }]);

    } catch (error) {
      console.error('Error generating code:', error);
      alert('Failed to generate code. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateCode(prompt);
  };

  // Update iframe with generated code
  useEffect(() => {
    if (iframeRef.current && generatedCode) {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(generatedCode);
        iframeDoc.close();
      }
    }
  }, [generatedCode]);

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('Code copied to clipboard!');
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
        </div>

        {!showWelcome && generatedCode && (
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
              onClick={downloadCode}
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
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">V</span>
                </div>
                <h2 className="text-5xl font-bold text-white">
                  What do you want to create today?
                </h2>
                <p className="text-xl text-gray-400">
                  Describe your website and watch as AI brings it to life
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., A landing page for a coffee shop with a hero section, menu, and contact form..."
                    className="w-full h-32 px-6 py-4 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                    disabled={isGenerating}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl font-semibold text-lg transition-all disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    'Generate Website'
                  )}
                </button>
              </form>

              <div className="grid grid-cols-3 gap-4 pt-8">
                <button
                  onClick={() => setPrompt('A personal portfolio website with a dark theme, showcasing projects and skills')}
                  className="p-4 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-xl text-left transition-colors"
                >
                  <div className="text-2xl mb-2">💼</div>
                  <div className="text-sm font-medium text-white">Portfolio</div>
                  <div className="text-xs text-gray-500 mt-1">Professional showcase</div>
                </button>
                <button
                  onClick={() => setPrompt('A modern landing page for a SaaS product with pricing tiers and features')}
                  className="p-4 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-xl text-left transition-colors"
                >
                  <div className="text-2xl mb-2">🚀</div>
                  <div className="text-sm font-medium text-white">Landing Page</div>
                  <div className="text-xs text-gray-500 mt-1">Convert visitors</div>
                </button>
                <button
                  onClick={() => setPrompt('A beautiful restaurant website with menu, gallery, and reservation form')}
                  className="p-4 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-xl text-left transition-colors"
                >
                  <div className="text-2xl mb-2">🍽️</div>
                  <div className="text-sm font-medium text-white">Restaurant</div>
                  <div className="text-xs text-gray-500 mt-1">Menu & reservations</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Code & Preview View */
          <div className="flex-1 flex flex-col">
            {/* Code & Preview Panels */}
            <div className="flex-1 flex overflow-hidden">
              {/* Code Panel */}
              {(view === 'split' || view === 'code') && (
                <div className={`${view === 'split' ? 'w-1/2' : 'w-full'} border-r border-gray-800 flex flex-col`}>
                  <div className="px-4 py-2 bg-[#111] border-b border-gray-800">
                    <span className="text-sm text-gray-400 font-mono">generated-website.html</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <MonacoEditor
                      height="100%"
                      defaultLanguage="html"
                      value={generatedCode || '// Code will appear here...'}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: false,
                      }}
                      onChange={(value) => setGeneratedCode(value || '')}
                    />
                  </div>
                </div>
              )}

              {/* Preview Panel */}
              {(view === 'split' || view === 'preview') && (
                <div className={`${view === 'split' ? 'w-1/2' : 'w-full'} flex flex-col bg-white`}>
                  <div className="px-4 py-2 bg-[#111] border-b border-gray-800">
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
                  placeholder="Refine your website... (e.g., 'Make the header sticky' or 'Add a contact form')"
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
                    'Generate'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
