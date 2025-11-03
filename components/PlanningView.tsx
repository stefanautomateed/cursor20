'use client';

import { ProjectPlan, Task } from '@/types';

interface PlanningViewProps {
  plan: ProjectPlan | null;
  tasks: Task[];
  currentTask: Task | null;
  isPlanning: boolean;
}

export default function PlanningView({ plan, tasks, currentTask, isPlanning }: PlanningViewProps) {
  if (!plan && !isPlanning) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-8">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl w-full max-w-6xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  {isPlanning ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                {isPlanning && (
                  <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg animate-ping opacity-75" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {isPlanning ? 'AI is Planning Your Project...' : 'Executing Plan'}
                </h3>
                <p className="text-sm text-gray-400">
                  {isPlanning ? 'Designing architecture and structure' : `${tasks.filter(t => t.status === 'completed').length} of ${tasks.length} tasks completed`}
                </p>
              </div>
            </div>
            {!isPlanning && (
              <div className="text-sm text-gray-400">
                <span className="text-purple-400 font-mono">
                  {Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isPlanning ? (
            /* Planning Phase */
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span>Analyzing your requirements...</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-100" />
                <span>Designing website architecture...</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200" />
                <span>Planning pages and sections...</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-300" />
                <span>Creating execution strategy...</span>
              </div>
            </div>
          ) : plan ? (
            /* Plan Display & Task Execution */
            <div className="space-y-6">
              {/* Project Overview */}
              <div className="bg-[#111] border border-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">PROJECT OVERVIEW</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{plan.description}</p>
              </div>

              {/* Design Theme */}
              <div className="bg-[#111] border border-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-purple-400 mb-3">DESIGN THEME</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">Style:</span>
                    <span className="text-gray-300">{plan.designTheme.style}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">Colors:</span>
                    <div className="flex space-x-2">
                      {plan.designTheme.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded border border-gray-700"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">Typography:</span>
                    <span className="text-gray-300">{plan.designTheme.typography}</span>
                  </div>
                </div>
              </div>

              {/* Pages & Tasks */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-purple-400">PAGES & PROGRESS</h4>
                {plan.pages.map((page, pageIdx) => {
                  const pageTasks = tasks.filter(t => t.title.includes(page.name));
                  const completedTasks = pageTasks.filter(t => t.status === 'completed').length;
                  const totalTasks = pageTasks.length;

                  return (
                    <div key={pageIdx} className="bg-[#111] border border-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{pageIdx === 0 ? '🏠' : pageIdx === 1 ? '📄' : '📋'}</span>
                          <div>
                            <h5 className="font-semibold text-white">{page.name}</h5>
                            <p className="text-xs text-gray-500">{page.route}</p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {completedTasks}/{totalTasks} sections
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{page.description}</p>

                      {/* Sections */}
                      <div className="space-y-2">
                        {page.sections.map((section, secIdx) => {
                          const task = tasks.find(t =>
                            t.title.includes(page.name) && t.title.includes(section.name)
                          );
                          const status = task?.status || 'pending';

                          return (
                            <div
                              key={secIdx}
                              className={`flex items-center space-x-3 p-2 rounded text-sm ${
                                status === 'completed' ? 'bg-green-900/20 text-green-400' :
                                status === 'in_progress' ? 'bg-purple-900/20 text-purple-400' :
                                status === 'failed' ? 'bg-red-900/20 text-red-400' :
                                'bg-gray-900/20 text-gray-500'
                              }`}
                            >
                              {status === 'completed' && (
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                              {status === 'in_progress' && (
                                <svg className="w-4 h-4 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              )}
                              {status === 'pending' && (
                                <div className="w-4 h-4 border-2 border-gray-600 rounded-full flex-shrink-0" />
                              )}
                              {status === 'failed' && (
                                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                              )}
                              <span className="flex-1">{section.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current Task Detail */}
              {currentTask && (
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <svg className="w-5 h-5 text-purple-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-purple-300">Currently Generating</span>
                  </div>
                  <p className="text-white font-medium">{currentTask.title}</p>
                  <p className="text-sm text-gray-400 mt-1">{currentTask.description}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
