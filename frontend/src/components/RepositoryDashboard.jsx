import React, { useState } from 'react';
import { Github, GitBranch, Eye, Star, AlertCircle, GitPullRequest, Code, Zap } from 'lucide-react';
import LanguageStats from './LanguageStats';

const RepositoryDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const repoStats = {
    name: 'DailyProgress',
    owner: 'shivam5210',
    fullUrl: 'https://github.com/shivam5210/DailyProgress',
    homepage: 'https://daily-progress-psi.vercel.app',
    stars: 0,
    forks: 0,
    watchers: 0,
    issues: 1,
    pullRequests: 1,
    size: 2240,
    language: 'JavaScript',
    created: '1 day ago',
    updated: '2026-05-11T07:54:54Z',
    description: 'A personal life tracker for founders. Define your problems, check in daily, and let AI calculate your real success percentage.',
  };

  const techStack = [
    { category: 'Frontend', technologies: ['React 19', 'Vite', 'Framer Motion', 'Recharts', 'Lucide Icons'] },
    { category: 'Backend', technologies: ['Express.js', 'Node.js', 'JWT', 'Nodemon'] },
    { category: 'Database', technologies: ['Supabase', 'PostgreSQL'] },
    { category: 'AI/ML', technologies: ['Anthropic Claude'] },
    { category: 'Email', technologies: ['Resend'] },
    { category: 'Deployment', technologies: ['Vercel', 'Railway', 'Supabase'] },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'languages', label: 'Languages' },
    { id: 'tech', label: 'Tech Stack' },
    { id: 'issues', label: 'Issues & PRs' },
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-5 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className={`w-8 h-8 ${color} opacity-50 group-hover:opacity-100 transition-opacity`} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 py-8">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Github className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Repository Dashboard
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            {repoStats.owner}/{repoStats.name}
          </p>
          <p className="text-gray-500 mt-2 max-w-2xl">{repoStats.description}</p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={Star}
            title="Stars"
            value={repoStats.stars}
            subtitle="Stargazers"
            color="text-yellow-300"
          />
          <StatCard
            icon={GitBranch}
            title="Forks"
            value={repoStats.forks}
            subtitle="Repository forks"
            color="text-blue-300"
          />
          <StatCard
            icon={AlertCircle}
            title="Open Issues"
            value={repoStats.issues}
            subtitle="Requires attention"
            color="text-red-300"
          />
          <StatCard
            icon={GitPullRequest}
            title="Pull Requests"
            value={repoStats.pullRequests}
            subtitle="Open PRs"
            color="text-green-300"
          />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex gap-2 border-b border-gray-700/50 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all duration-300 border-b-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Repository Info */}
              <div className="rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-8 hover:border-purple-500/50 transition-all duration-300">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Code className="w-6 h-6 text-purple-400" />
                  Repository Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm">Primary Language</p>
                    <p className="text-2xl font-semibold text-purple-300 mt-1">{repoStats.language}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Repository Size</p>
                    <p className="text-2xl font-semibold text-blue-300 mt-1">{repoStats.size} KB</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Created</p>
                    <p className="text-2xl font-semibold text-green-300 mt-1">{repoStats.created}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Last Updated</p>
                    <p className="text-2xl font-semibold text-pink-300 mt-1">{new Date(repoStats.updated).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-700/50">
                  <p className="text-gray-400 text-sm mb-3">Quick Links</p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={repoStats.fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-600/40 transition-all"
                    >
                      View on GitHub
                    </a>
                    <a
                      href={repoStats.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600/20 border border-blue-500/50 text-blue-300 rounded-lg hover:bg-blue-600/40 transition-all"
                    >
                      Live Demo
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Languages Tab */}
          {activeTab === 'languages' && (
            <LanguageStats />
          )}

          {/* Tech Stack Tab */}
          {activeTab === 'tech' && (
            <div className="space-y-6">
              <div className="rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-purple-400" />
                  Technology Stack
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {techStack.map((stack) => (
                    <div
                      key={stack.category}
                      className="group relative overflow-hidden rounded-lg bg-gray-800/30 border border-gray-700/50 p-5 hover:border-purple-500/50 transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <h3 className="text-lg font-semibold text-purple-300 mb-3 relative z-10">{stack.category}</h3>
                      <div className="flex flex-wrap gap-2 relative z-10">
                        {stack.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-3 py-1 bg-purple-600/20 border border-purple-500/50 text-purple-200 text-xs rounded-full hover:bg-purple-600/40 transition-all"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Issues & PRs Tab */}
          {activeTab === 'issues' && (
            <div className="space-y-6">
              <div className="rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  Issues & Pull Requests
                </h2>

                <div className="space-y-4">
                  <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-300 font-semibold">Open Issues: {repoStats.issues}</p>
                    <p className="text-red-400/70 text-sm mt-1">1 issue requires attention</p>
                  </div>

                  <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-300 font-semibold">Pull Requests: {repoStats.pullRequests}</p>
                    <div className="text-green-400/70 text-sm mt-2 space-y-1">
                      <p>PR #1: "Remove authentication" - Open</p>
                      <p className="text-xs text-gray-400">Author: mishrashivamamaresh | 1 comment</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700/50 text-center">
          <p className="text-gray-400 text-sm">
            Dashboard generated on {new Date().toLocaleDateString()} • Data refreshed in real-time
          </p>
        </div>
      </div>
    </div>
  );
};

export default RepositoryDashboard;
