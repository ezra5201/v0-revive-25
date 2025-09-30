"use client"

import { Search, Bell, Settings, User } from "lucide-react"

export default function DesignPreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">ReVive Center - Design Preview</h1>
              <p className="text-slate-400">Unified Contact Management + Global Search</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Presentation Mode</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-8 py-12 space-y-16">
        {/* Header Comparison Section */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Complete Header Transformation</h2>
            <p className="text-xl text-slate-400">Consolidate navigation while adding powerful global search</p>
          </div>

          {/* Before Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">BEFORE</div>
              <h3 className="text-xl font-bold text-white">Current Navigation (6 Items)</h3>
            </div>
            <div className="bg-white rounded-xl overflow-hidden border-4 border-red-500/30">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-500 rounded" />
                      <span className="font-bold text-gray-900 text-sm">ReVive IMPACT</span>
                    </div>
                    <div className="flex gap-2">
                      {["CONTACT LOG", "CM", "OT", "OUTREACH", "DASHBOARD", "REPORTS"].map((item, i) => (
                        <div
                          key={item}
                          className={`px-3 py-1.5 text-xs rounded font-medium ${
                            i === 0 ? "bg-orange-500 text-white" : "text-gray-600 bg-gray-100"
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                      <div className="ml-2 flex items-center">
                        <Bell className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">Andrea Leflore</span>
                    <User className="h-4 w-4 text-gray-600" />
                    <Settings className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 text-center text-sm text-gray-500">
                ⚠️ Cluttered navigation • No quick search • Separate pages for similar functions
              </div>
            </div>
          </div>

          {/* After Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">AFTER</div>
              <h3 className="text-xl font-bold text-white">Proposed Navigation (4 Items + Global Search)</h3>
            </div>
            <div className="bg-white rounded-xl overflow-hidden border-4 border-emerald-500/50 shadow-2xl">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-orange-500 rounded" />
                      <span className="font-bold text-gray-900 text-sm">ReVive IMPACT</span>
                    </div>
                    <div className="flex gap-2">
                      {["CONTACTS", "OUTREACH", "DASHBOARD", "REPORTS"].map((item, i) => (
                        <div
                          key={item}
                          className={`px-3 py-1.5 text-xs rounded font-medium ${
                            i === 0 ? "bg-orange-500 text-white" : "text-gray-600 bg-gray-100"
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                      <div className="ml-2 flex items-center">
                        <Bell className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search clients, locations, runs..."
                        className="w-full pl-10 pr-16 py-2 bg-gray-50 border-2 border-blue-300 rounded-lg text-sm"
                        readOnly
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-200 rounded text-xs">
                        ⌘K
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">Andrea Leflore</span>
                    <User className="h-4 w-4 text-gray-600" />
                    <Settings className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 text-center text-sm font-medium text-gray-700">
                ✓ Cleaner navigation • ✓ Instant search anywhere • ✓ Unified contact management
              </div>
            </div>
          </div>

          {/* Key Changes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="text-emerald-400 font-bold mb-2">Navigation Simplified</div>
              <div className="text-2xl font-bold text-white mb-2">6 → 4 Items</div>
              <div className="text-sm text-slate-400">
                Contact Log, CM, and OT consolidated into single CONTACTS page
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="text-blue-400 font-bold mb-2">Global Search Added</div>
              <div className="text-2xl font-bold text-white mb-2">Cmd+K</div>
              <div className="text-sm text-slate-400">
                Persistent search bar provides instant access to any client or location
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="text-purple-400 font-bold mb-2">All Features Preserved</div>
              <div className="text-2xl font-bold text-white mb-2">100%</div>
              <div className="text-sm text-slate-400">
                Dashboard, Reports, Outreach, Alerts, User menu, and Settings unchanged
              </div>
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Expected Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { value: "85%", label: "Faster Lookup", description: "30s to 5s" },
              { value: "60%", label: "Less Code", description: "Consolidated" },
              { value: "100%", label: "No Reloads", description: "Instant switching" },
              { value: "3→1", label: "Pages Unified", description: "Single experience" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
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
