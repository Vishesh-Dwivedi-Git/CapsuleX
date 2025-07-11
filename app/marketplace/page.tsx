"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Filter, Clock, Eye, Lock, ShoppingCart } from "lucide-react"

// Mock data for capsules
const mockCapsules = [
  {
    id: 1,
    name: "Time Capsule 2030",
    description: "A collection of memories from 2024 to be opened in 2030",
    hint: "The year everything changed",
    unlockTime: "2030-01-01T00:00:00",
    price: "0.5 ETH",
    creator: "0x1234...5678",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 2,
    name: "Secret Recipe",
    description: "Grandmother's secret recipe locked until family reunion",
    hint: "The key ingredient is love",
    unlockTime: "2025-12-25T12:00:00",
    price: "0.2 ETH",
    creator: "0x8765...4321",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 3,
    name: "Digital Diary",
    description: "Personal thoughts and experiences from a transformative year",
    hint: "When the world stood still",
    unlockTime: "2026-03-15T18:00:00",
    price: "0.8 ETH",
    creator: "0x9876...1234",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 4,
    name: "Investment Wisdom",
    description: "Cryptocurrency predictions and investment strategies",
    hint: "The future of money",
    unlockTime: "2025-06-01T09:00:00",
    price: "1.2 ETH",
    creator: "0x5432...8765",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 5,
    name: "Love Letters",
    description: "Romantic letters to be revealed on our anniversary",
    hint: "Where it all began",
    unlockTime: "2025-02-14T20:00:00",
    price: "0.3 ETH",
    creator: "0x2468...1357",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 6,
    name: "Startup Secrets",
    description: "Business strategies and lessons learned from building a unicorn",
    hint: "The path to billions",
    unlockTime: "2027-01-01T00:00:00",
    price: "2.5 ETH",
    creator: "0x1357...2468",
    image: "/placeholder.svg?height=300&width=300",
  },
]

export default function MarketplacePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const handleBuyCapsule = (capsuleId: number) => {
    // Simulate purchase and redirect to my capsules
    console.log("Buying capsule:", capsuleId)
    setTimeout(() => {
      router.push("/my-capsules")
    }, 1000)
  }

  const filteredCapsules = mockCapsules.filter(
    (capsule) =>
      capsule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capsule.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
              <Link href="/marketplace" className="text-blue-300 font-semibold">
                Marketplace
              </Link>
              <Link href="/create" className="text-white hover:text-blue-300 transition-colors">
                Create
              </Link>
              <Link href="/my-capsules" className="text-white hover:text-blue-300 transition-colors">
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
          <h1 className="text-4xl font-bold text-white mb-4">Capsule Marketplace</h1>
          <p className="text-xl text-gray-300">Discover and purchase encrypted NFT capsules from creators worldwide</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search capsules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="unlock-soon">Unlocking Soon</option>
            </select>
            <button className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">1,247</div>
            <div className="text-gray-400 text-sm">Total Capsules</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">89</div>
            <div className="text-gray-400 text-sm">Active Creators</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">456.7</div>
            <div className="text-gray-400 text-sm">ETH Volume</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-white mb-1">23</div>
            <div className="text-gray-400 text-sm">Unlocked Today</div>
          </div>
        </div>

        {/* Capsules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCapsules.map((capsule) => (
            <div
              key={capsule.id}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all transform hover:scale-105"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center">
                <Lock className="w-16 h-16 text-white/50" />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{capsule.name}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{capsule.description}</p>

                <div className="flex items-center text-blue-300 text-sm mb-4">
                  <Eye className="w-4 h-4 mr-2" />
                  <span className="italic">"{capsule.hint}"</span>
                </div>

                <div className="flex items-center text-gray-400 text-sm mb-4">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Unlocks: {new Date(capsule.unlockTime).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{capsule.price}</div>
                    <div className="text-gray-400 text-xs">by {capsule.creator}</div>
                  </div>
                  <button
                    onClick={() => handleBuyCapsule(capsule.id)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 transition-all flex items-center"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors">
            Load More Capsules
          </button>
        </div>
      </div>
    </div>
  )
}
