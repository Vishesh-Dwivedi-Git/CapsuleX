"use client"

import { useState } from "react"
import Link from "next/link"
import { Clock, Lock, Unlock, Eye, Download, Share2, Trash2 } from "lucide-react"

// Mock data for user's capsules
const mockOwnedCapsules = [
  {
    id: 1,
    name: "My Secret Recipe",
    description: "Family recipe to be shared with my children",
    hint: "The secret ingredient is patience",
    unlockTime: "2025-12-25T12:00:00",
    status: "locked",
    type: "created",
    file: "recipe.pdf",
  },
  {
    id: 2,
    name: "Investment Wisdom",
    description: "Cryptocurrency predictions and investment strategies",
    hint: "The future of money",
    unlockTime: "2024-06-01T09:00:00",
    status: "unlocked",
    type: "purchased",
    file: "crypto-predictions.txt",
  },
  {
    id: 3,
    name: "Love Letters",
    description: "Romantic letters to be revealed on our anniversary",
    hint: "Where it all began",
    unlockTime: "2025-02-14T20:00:00",
    status: "locked",
    type: "purchased",
    file: "letters.zip",
  },
  {
    id: 4,
    name: "Time Capsule 2030",
    description: "A collection of memories from 2024",
    hint: "The year everything changed",
    unlockTime: "2030-01-01T00:00:00",
    status: "locked",
    type: "created",
    file: "memories.zip",
  },
]

export default function MyCapsules() {
  const [activeTab, setActiveTab] = useState<"all" | "created" | "purchased">("all")
  const [selectedCapsule, setSelectedCapsule] = useState<number | null>(null)

  const filteredCapsules = mockOwnedCapsules.filter((capsule) => {
    if (activeTab === "all") return true
    return capsule.type === activeTab
  })

  const handleUnlock = (capsuleId: number) => {
    console.log("Unlocking capsule:", capsuleId)
    // Here you would implement the unlock logic
  }

  const handleDownload = (capsuleId: number, fileName: string) => {
    console.log("Downloading file:", fileName)
    // Here you would implement the download logic
  }

  const isUnlockable = (unlockTime: string) => {
    return new Date(unlockTime) <= new Date()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-900 to-green-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold text-white">CapsuleX</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-white hover:text-blue-300 transition-colors">
                Home
              </Link>
              <Link href="/marketplace" className="text-white hover:text-blue-300 transition-colors">
                Marketplace
              </Link>
              <Link href="/create" className="text-white hover:text-blue-300 transition-colors">
                Create
              </Link>
              <Link href="/my-capsules" className="text-blue-300 font-semibold">
                My Capsules
              </Link>
            </div>
            <div className="flex space-x-4">
              <button className="px-4 py-2 text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                Connect Wallet
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">My Capsules</h1>
          <p className="text-xl text-gray-300">Manage your created and purchased capsules</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">{mockOwnedCapsules.length}</div>
            <div className="text-gray-400 text-sm">Total Capsules</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {mockOwnedCapsules.filter((c) => c.type === "created").length}
            </div>
            <div className="text-gray-400 text-sm">Created</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {mockOwnedCapsules.filter((c) => c.type === "purchased").length}
            </div>
            <div className="text-gray-400 text-sm">Purchased</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {mockOwnedCapsules.filter((c) => c.status === "unlocked").length}
            </div>
            <div className="text-gray-400 text-sm">Unlocked</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "all" ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            All Capsules
          </button>
          <button
            onClick={() => setActiveTab("created")}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "created" ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            Created
          </button>
          <button
            onClick={() => setActiveTab("purchased")}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "purchased" ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white hover:bg-white/10"
            }`}
          >
            Purchased
          </button>
        </div>

        {/* Capsules List */}
        <div className="space-y-6">
          {filteredCapsules.map((capsule) => (
            <div
              key={capsule.id}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-white mr-3">{capsule.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        capsule.status === "unlocked"
                          ? "bg-green-500/20 text-green-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }`}
                    >
                      {capsule.status === "unlocked" ? "Unlocked" : "Locked"}
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        capsule.type === "created" ? "bg-blue-500/20 text-blue-300" : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {capsule.type === "created" ? "Created" : "Purchased"}
                    </span>
                  </div>

                  <p className="text-gray-300 mb-3">{capsule.description}</p>

                  <div className="flex items-center text-blue-300 text-sm mb-2">
                    <Eye className="w-4 h-4 mr-2" />
                    <span className="italic">"{capsule.hint}"</span>
                  </div>

                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {capsule.status === "unlocked"
                        ? "Unlocked"
                        : `Unlocks: ${new Date(capsule.unlockTime).toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0 lg:ml-6">
                  {capsule.status === "unlocked" ? (
                    <>
                      <button
                        onClick={() => handleDownload(capsule.id, capsule.file)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      <button className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </button>
                    </>
                  ) : isUnlockable(capsule.unlockTime) ? (
                    <button
                      onClick={() => handleUnlock(capsule.id)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-all flex items-center justify-center"
                    >
                      <Unlock className="w-4 h-4 mr-2" />
                      Unlock Now
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg cursor-not-allowed flex items-center justify-center"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Locked
                    </button>
                  )}

                  {capsule.type === "created" && (
                    <button className="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors flex items-center justify-center">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCapsules.length === 0 && (
          <div className="text-center py-12">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No capsules found</h3>
            <p className="text-gray-400 mb-6">
              {activeTab === "created"
                ? "You haven't created any capsules yet."
                : activeTab === "purchased"
                  ? "You haven't purchased any capsules yet."
                  : "You don't have any capsules yet."}
            </p>
            <Link
              href={activeTab === "created" ? "/create" : "/marketplace"}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 transition-all"
            >
              {activeTab === "created" ? "Create Your First Capsule" : "Browse Marketplace"}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
