"use client"

import { Search, Command, Layers, CheckCircle2 } from "lucide-react"

export default function DesignPreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">ReVive Center Application</h1>
              <p className="text-slate-400">Unified Contact Management + Global Search - Design Preview</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Presentation Mode</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 py-12">
        <div className="mb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
              <Layers className="h-5 w-5 text-purple-400" />
              <span className="text-purple-300 font-medium">Unified Architecture</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">One Page, All Contexts</h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Consolidate Contact Log, CM, and OT into a single powerful interface with context switching
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-red-400 text-xl font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Current: 3 Separate Pages</h3>
                  <p className="text-sm text-slate-400">Duplicated code and navigation</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Contact Log", path: "/contact-log", color: "blue" },
                  { name: "CM Page", path: "/cm", color: "amber" },
                  { name: "OT Page", path: "/ot", color: "purple" },
                ].map((page) => (
                  <div key={page.path} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{page.name}</span>
                      <span className={`text-xs px-2 py-1 bg-${page.color}-500/20 text-${page.color}-400 rounded`}>
                        {page.path}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>• Separate navigation</div>
                      <div>• Duplicate components</div>
                      <div>• Context switching requires page reload</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="text-sm text-red-300 font-medium mb-2">Challenges:</div>
                <ul className="text-xs text-red-400 space-y-1">
                  <li>• 60% code duplication across pages</li>
                  <li>• Confusing navigation for users</li>
                  <li>• Difficult to maintain consistency</li>
                  <li>• Slower context switching</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-emerald-500/50 rounded-xl p-8 relative">
              <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                RECOMMENDED
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-400 text-xl font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Proposed: Unified Contacts Page</h3>
                  <p className="text-sm text-slate-400">Single codebase with context selector</p>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-emerald-500/30 rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-medium">Unified Contacts</span>
                  <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">/contacts</span>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-slate-400 mb-2">Context Selector:</div>
                  <div className="flex gap-2">
                    {["All Services", "CM Only", "OT Only"].map((context, i) => (
                      <button
                        key={context}
                        className={`px-3 py-2 text-xs rounded-lg transition-all ${
                          i === 0
                            ? "bg-emerald-500 text-white font-medium"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                      >
                        {context}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-400 mb-2">Dynamic Tabs:</div>
                <div className="flex gap-2">
                  {["Today's Check-ins", "Caseload", "Client Tabs..."].map((tab, i) => (
                    <div
                      key={tab}
                      className={`px-3 py-1.5 text-xs rounded ${
                        i === 0 ? "bg-slate-700 text-white border-b-2 border-emerald-500" : "text-slate-400"
                      }`}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="text-sm text-emerald-300 font-medium mb-2">Benefits:</div>
                <ul className="text-xs text-emerald-400 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    60% less code to maintain
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Instant context switching
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Consistent user experience
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Easier to add new features
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-2xl font-bold text-white mb-2">Unified Contacts Page - Full Mockup</h3>
              <p className="text-sm text-slate-400">
                Single page with global search, context selector, and dynamic content
              </p>
            </div>

            <div className="bg-white">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded" />
                    <div className="hidden lg:flex gap-2">
                      {["DASHBOARD", "CONTACTS", "OUTREACH", "REPORTS"].map((item, i) => (
                        <div
                          key={item}
                          className={`px-3 py-1.5 text-xs rounded ${i === 1 ? "bg-orange-500 text-white font-bold" : "text-gray-600"}`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 max-w-md mx-8">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search clients, locations, runs..."
                        className="w-full pl-10 pr-20 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-gray-200 rounded text-xs text-gray-600 font-mono">
                        <Command className="h-3 w-3" />
                        <span>K</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">View:</span>
                    <div className="flex gap-2">
                      {[
                        { label: "All Services", active: true },
                        { label: "CM Only", active: false },
                        { label: "OT Only", active: false },
                      ].map((context) => (
                        <button
                          key={context.label}
                          className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                            context.active
                              ? "bg-orange-500 text-white shadow-sm"
                              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {context.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Showing: <span className="font-medium text-gray-700">All client contacts</span>
                  </div>
                </div>
              </div>

              <div className="px-6 border-b border-gray-200">
                <div className="flex gap-6">
                  {["Today's Check-ins", "Caseload", "John Doe", "Jane Smith"].map((tab, i) => (
                    <button
                      key={tab}
                      className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                        i === 0
                          ? "border-orange-500 text-orange-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab}
                      {i > 1 && (
                        <button className="ml-2 text-gray-400 hover:text-gray-600">
                          <span className="text-xs">×</span>
                        </button>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-gray-50">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Client</th>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Service Type</th>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Provider</th>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Time</th>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          name: "John Doe",
                          service: "CM",
                          provider: "Andrea Leflore",
                          time: "9:30 AM",
                          status: "Checked In",
                        },
                        {
                          name: "Jane Smith",
                          service: "OT",
                          provider: "Sarah Johnson",
                          time: "10:15 AM",
                          status: "In Progress",
                        },
                        {
                          name: "Mike Wilson",
                          service: "CM + OT",
                          provider: "Multiple",
                          time: "11:00 AM",
                          status: "Checked In",
                        },
                        {
                          name: "Sarah Brown",
                          service: "Food",
                          provider: "Staff",
                          time: "11:30 AM",
                          status: "Completed",
                        },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                          <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                row.service.includes("CM")
                                  ? "bg-amber-100 text-amber-700"
                                  : row.service.includes("OT")
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {row.service}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{row.provider}</td>
                          <td className="px-4 py-3 text-gray-600">{row.time}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                row.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : row.status === "In Progress"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
            <Search className="h-5 w-5 text-blue-400" />
            <span className="text-blue-300 font-medium">Universal Search Experience</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Search Anywhere, Find Everything</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            A persistent global search bar provides instant access to clients, locations, runs, and inventory from any
            page in the application
          </p>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
            <div className="h-2 w-2 bg-emerald-500 rounded-full" />
            <span className="text-emerald-400 font-medium">Efficiency Improvement</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Expected Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto mt-8">
            {[
              { value: "85%", label: "Faster Client Lookup", description: "From 30 seconds to 5 seconds" },
              { value: "60%", label: "Less Code", description: "Consolidated architecture" },
              { value: "100%", label: "Context Switching", description: "No page reloads needed" },
              { value: "3→1", label: "Pages Simplified", description: "Unified experience" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-bold text-emerald-400 mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
                <div className="text-sm text-slate-400">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
