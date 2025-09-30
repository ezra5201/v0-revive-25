"use client"

import { Search, Command, MapPin, Users, Calendar, TrendingUp } from "lucide-react"

export default function DesignPreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">ReVive Center Application</h1>
              <p className="text-slate-400">Global Search Integration - Design Preview</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Presentation Mode</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 py-12">
        {/* Key Feature Highlight */}
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

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Dashboard Layout */}
          <div className="group">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    Dashboard
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Main View</span>
                </div>
                <p className="text-sm text-slate-400">Analytics and overview with quick search access</p>
              </div>

              {/* Mock Header with Search */}
              <div className="bg-white p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded" />
                    <div className="hidden lg:flex gap-2">
                      {["CONTACT LOG", "CM", "OT", "OUTREACH"].map((item) => (
                        <div key={item} className="px-3 py-1.5 text-xs text-gray-600 rounded">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 max-w-md mx-8">
                    <div className="relative group/search">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search clients, locations, runs..."
                        className="w-full pl-10 pr-20 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              {/* Mock Dashboard Content */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "Total Clients", value: "1,234", color: "blue" },
                    { label: "Active Cases", value: "456", color: "green" },
                    { label: "This Month", value: "89", color: "orange" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                      <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 h-32">
                  <div className="text-sm text-gray-600 mb-2">Services Impact Chart</div>
                  <div className="flex items-end gap-2 h-20">
                    {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
                      <div key={i} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outreach Layout */}
          <div className="group">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-400" />
                    Outreach
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Field Operations</span>
                </div>
                <p className="text-sm text-slate-400">Location-aware search for street outreach</p>
              </div>

              {/* Mock Header with Search */}
              <div className="bg-white p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded" />
                    <div className="hidden lg:flex gap-2">
                      {["CONTACT LOG", "CM", "OT", "OUTREACH"].map((item, i) => (
                        <div
                          key={item}
                          className={`px-3 py-1.5 text-xs rounded ${i === 3 ? "bg-orange-500 text-white font-bold" : "text-gray-600"}`}
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
                        placeholder="Search outreach contacts, locations..."
                        className="w-full pl-10 pr-20 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

              {/* Mock Outreach Content */}
              <div className="p-6 bg-gray-50">
                <div className="flex gap-2 mb-4">
                  {["Runs", "Inventory", "Contacts", "Locations"].map((tab, i) => (
                    <div
                      key={tab}
                      className={`px-3 py-2 text-xs rounded ${i === 0 ? "bg-white border border-gray-300 font-medium" : "text-gray-600"}`}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { location: "Chicago & Albany", contacts: 12, status: "Active" },
                    { location: "Madison & Western", contacts: 8, status: "Completed" },
                    { location: "Lake & Pulaski", contacts: 15, status: "Active" },
                  ].map((run, i) => (
                    <div
                      key={i}
                      className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">{run.location}</div>
                        <div className="text-xs text-gray-500">{run.contacts} contacts</div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs ${run.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {run.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Run Log Layout */}
          <div className="group">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    Run Log
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">Mobile Optimized</span>
                </div>
                <p className="text-sm text-slate-400">Quick search during active field operations</p>
              </div>

              {/* Mock Mobile Header */}
              <div className="bg-white p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-24 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded" />
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-600">Today</div>
                    <div className="w-6 h-6 bg-gray-200 rounded-full" />
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Quick search..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                    readOnly
                  />
                </div>
              </div>

              {/* Mock Run Log Content */}
              <div className="p-6 bg-gray-50">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="text-xs text-blue-600 font-medium mb-1">Active Run</div>
                  <div className="text-sm font-bold text-blue-900">West Side Outreach</div>
                  <div className="text-xs text-blue-600 mt-1">8 contacts logged</div>
                </div>
                <div className="space-y-2">
                  {["John Doe", "Jane Smith", "Mike Johnson"].map((name, i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-900">{name}</div>
                      <div className="text-xs text-gray-500 mt-1">2:30 PM • Chicago & Albany</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Case Management Layout */}
          <div className="group">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all">
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-amber-400" />
                    Case Management
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">CM/OT Views</span>
                </div>
                <p className="text-sm text-slate-400">Caseload-specific search and filtering</p>
              </div>

              {/* Mock Header with Search */}
              <div className="bg-white p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-32 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded" />
                    <div className="hidden lg:flex gap-2">
                      {["CONTACT LOG", "CM", "OT", "OUTREACH"].map((item, i) => (
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
                        placeholder="Search my caseload..."
                        className="w-full pl-10 pr-20 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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

              {/* Mock CM Content */}
              <div className="p-6 bg-gray-50">
                <div className="flex gap-2 mb-4">
                  {["Today's Check-ins", "CM Caseload"].map((tab, i) => (
                    <div
                      key={tab}
                      className={`px-3 py-2 text-xs rounded ${i === 1 ? "bg-white border-b-2 border-orange-500 font-medium" : "text-gray-600"}`}
                    >
                      {tab}
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-600 font-medium">Client</th>
                        <th className="px-3 py-2 text-left text-gray-600 font-medium">Last Contact</th>
                        <th className="px-3 py-2 text-left text-gray-600 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Sarah Williams", date: "2 days ago", status: "Active" },
                        { name: "Robert Brown", date: "1 week ago", status: "Follow-up" },
                        { name: "Maria Garcia", date: "3 days ago", status: "Active" },
                      ].map((client, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-900">{client.name}</td>
                          <td className="px-3 py-2 text-gray-600">{client.date}</td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-2 py-1 rounded text-xs ${client.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                            >
                              {client.status}
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

        {/* Search Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Command className="h-6 w-6" />,
                title: "Keyboard Shortcuts",
                description: "Press Cmd+K (Mac) or Ctrl+K (Windows) from anywhere to instantly open search",
                color: "blue",
              },
              {
                icon: <MapPin className="h-6 w-6" />,
                title: "Context-Aware Results",
                description:
                  "Search results adapt based on current page - prioritize outreach contacts when in Outreach view",
                color: "emerald",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Quick Actions",
                description: "Log contact, view history, or check-in directly from search results without navigation",
                color: "amber",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-${feature.color}-500/50 transition-all`}
              >
                <div
                  className={`w-12 h-12 bg-${feature.color}-500/10 border border-${feature.color}-500/20 rounded-lg flex items-center justify-center text-${feature.color}-400 mb-4`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search Results Preview */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Search Results Example</h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value="john"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-base"
                    readOnly
                  />
                </div>
              </div>
              <div className="p-2">
                <div className="text-xs text-gray-500 px-3 py-2 font-medium">CLIENTS (3)</div>
                {[
                  { name: "John Doe", info: "Last contact: 2 days ago • CM Active", type: "CM" },
                  { name: "John Smith", info: "Last contact: 1 week ago • OT Active", type: "OT" },
                  { name: "Johnny Williams", info: "Last contact: 3 days ago • Outreach", type: "Outreach" },
                ].map((result, i) => (
                  <div key={i} className="px-3 py-3 hover:bg-gray-50 rounded-lg cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          <span className="bg-yellow-200">{result.name.substring(0, 4)}</span>
                          {result.name.substring(4)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{result.info}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            result.type === "CM"
                              ? "bg-amber-100 text-amber-700"
                              : result.type === "OT"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {result.type}
                        </span>
                        <button className="px-3 py-1 bg-blue-500 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-xs text-gray-500 px-3 py-2 font-medium mt-2">LOCATIONS (1)</div>
                <div className="px-3 py-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        <span className="bg-yellow-200">John</span>son & Madison
                      </div>
                      <div className="text-xs text-gray-500 mt-1">15 contacts • Last visit: Yesterday</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Summary */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
            <div className="h-2 w-2 bg-emerald-500 rounded-full" />
            <span className="text-emerald-400 font-medium">Efficiency Improvement</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Expected Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-8">
            {[
              { value: "85%", label: "Faster Client Lookup", description: "From 30 seconds to 5 seconds" },
              { value: "60%", label: "Reduced Navigation", description: "Direct access from any page" },
              { value: "100%", label: "Mobile Friendly", description: "Optimized for field work" },
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
