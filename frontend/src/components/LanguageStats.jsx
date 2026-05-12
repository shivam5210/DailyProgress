import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Code2, TrendingUp } from 'lucide-react';

const LanguageStats = () => {
  const languageData = [
    { name: 'JavaScript', percent: 85.9, lines: 8590, color: '#F7DF1E' },
    { name: 'CSS', percent: 13.5, lines: 1350, color: '#1572B6' },
    { name: 'HTML', percent: 0.6, lines: 60, color: '#E34C26' },
  ];

  const totalLines = languageData.reduce((sum, lang) => sum + lang.lines, 0);

  const pieData = languageData.map(lang => ({
    name: lang.name,
    value: parseFloat(lang.percent),
  }));

  const barData = languageData.map(lang => ({
    name: lang.name,
    lines: lang.lines,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 border border-purple-500/50 rounded-lg p-3 shadow-xl">
          <p className="text-gray-100 font-semibold">{data.name}</p>
          {data.value && <p className="text-purple-300 text-sm">{data.value.toFixed(1)}%</p>}
          {data.lines && (
            <p className="text-blue-300 text-sm">{data.lines.toLocaleString()} lines</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Language Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {languageData.map((lang) => (
          <div
            key={lang.name}
            className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-5 hover:border-purple-500/50 transition-all duration-300"
          >
            <div
              className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
              style={{ backgroundColor: lang.color }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{lang.name}</h3>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: lang.color }}
                />
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 text-sm font-medium">{lang.percent}%</span>
                    <span className="text-gray-400 text-xs">{lang.lines.toLocaleString()} lines</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: lang.color,
                        width: `${lang.percent}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-xs mt-3">
                {((lang.lines / totalLines) * 100).toFixed(1)}% of total codebase
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6 hover:border-purple-500/50 transition-all duration-300">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-400" />
            Language Distribution
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={languageData[index].color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <p className="text-gray-400 text-sm mb-3">Legend</p>
            <div className="space-y-2">
              {languageData.map((lang) => (
                <div key={lang.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: lang.color }}
                  />
                  <span className="text-gray-300 text-sm">{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6 hover:border-purple-500/50 transition-all duration-300">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Lines of Code by Language
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: '#1F2937' }}
              />
              <Bar
                dataKey="lines"
                fill="#8884d8"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={languageData[index].color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Statistics Table */}
      <div className="rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Detailed Statistics</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Language</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Percentage</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Lines of Code</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Proportion</th>
              </tr>
            </thead>
            <tbody>
              {languageData.map((lang, index) => (
                <tr
                  key={lang.name}
                  className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: lang.color }}
                      />
                      <span className="text-gray-100 font-medium">{lang.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-center">
                    <div
                      className="inline-block px-3 py-1 rounded-full text-white font-semibold"
                      style={{
                        backgroundColor: lang.color,
                        opacity: 0.2,
                      }}
                    >
                      <span style={{ color: lang.color }}>{lang.percent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-300 font-mono">
                    {lang.lines.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-right">
                    <div className="flex justify-end">
                      <div className="w-32 bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            backgroundColor: lang.color,
                            width: `${lang.percent}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="border-t border-gray-700/50 bg-gray-800/20">
                <td className="px-4 py-4 text-sm font-bold text-white">Total</td>
                <td className="px-4 py-4 text-sm text-center text-gray-300 font-semibold">100%</td>
                <td className="px-4 py-4 text-sm text-right text-gray-100 font-mono font-bold">
                  {totalLines.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-sm text-right">
                  <span className="text-gray-300 text-xs">Complete</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-purple-600/10 border border-purple-500/30 p-4">
          <p className="text-purple-300 text-sm font-medium">Primary Language</p>
          <p className="text-2xl font-bold text-purple-200 mt-2">{languageData[0].name}</p>
          <p className="text-purple-400/70 text-xs mt-1">{languageData[0].percent}% of codebase</p>
        </div>

        <div className="rounded-lg bg-blue-600/10 border border-blue-500/30 p-4">
          <p className="text-blue-300 text-sm font-medium">Total Lines</p>
          <p className="text-2xl font-bold text-blue-200 mt-2">{(totalLines / 1000).toFixed(1)}K</p>
          <p className="text-blue-400/70 text-xs mt-1">{totalLines.toLocaleString()} lines total</p>
        </div>

        <div className="rounded-lg bg-green-600/10 border border-green-500/30 p-4">
          <p className="text-green-300 text-sm font-medium">Languages Used</p>
          <p className="text-2xl font-bold text-green-200 mt-2">{languageData.length}</p>
          <p className="text-green-400/70 text-xs mt-1">Diverse tech stack</p>
        </div>
      </div>
    </div>
  );
};

export default LanguageStats;
