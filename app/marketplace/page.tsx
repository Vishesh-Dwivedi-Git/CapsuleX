"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Filter, Clock, Eye, Lock, ShoppingCart } from "lucide-react";

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
];

export default function MarketplacePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const handleBuyCapsule = (capsuleId: number) => {
    console.log("Buying capsule:", capsuleId);
    setTimeout(() => {
      router.push("/my-capsules");
    }, 1000);
  };

  const filteredCapsules = mockCapsules.filter(
    (capsule) =>
      capsule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capsule.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white font-mono">
       <header className="sticky top-0 bg-black border-b-4 border-yellow-500 z-20">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500 text-black flex items-center justify-center border-4 border-white">
              <Lock size={24} aria-hidden="true" />
            </div>
            <span className="text-3xl font-extrabold tracking-tighter uppercase">CapsuleX</span>
          </div>
          <div className="hidden md:flex space-x-6">
            {["Home", "Marketplace", "Create", "My Capsules"].map((name, i) => (
              <Link
                key={i}
                href={name === "Home" ? "/" : `/${name.toLowerCase().replace(" ", "-")}`}
                className="text-white font-bold border-b-4 border-transparent hover:text-blue-500 hover:border-yellow-500 transition-all"
              >
                {name}
              </Link>
            ))}
          </div>
          <button className="px-6 py-3 bg-yellow-500 text-black font-bold border-4 border-white uppercase hover:ring-4 hover:ring-blue-600 transition-all">
            Connect Wallet
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold uppercase tracking-tighter border-4 border-white inline-block p-4">NFT Capsule Marketplace</h1>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto font-medium">
            Explore and acquire unique encrypted NFT capsules from creators worldwide
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search capsules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black border-4 border-yellow-500 text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-black border-4 border-yellow-500 text-white"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="unlock-soon">Unlocking Soon</option>
            </select>
            <button className="px-4 py-3 bg-black border-4 border-yellow-500 text-white flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {["Total Capsules", "Active Creators", "ETH Volume", "Unlocked Today"].map((label, i) => (
            <div key={i} className="bg-black border-4 border-yellow-500 text-center p-6">
              <div className="text-2xl font-bold text-white">{["1,247", "89", "456.7", "23"][i]}</div>
              <div className="text-sm text-gray-400 mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCapsules.map((capsule) => (
            <div
              key={capsule.id}
              className="bg-black border-4 border-yellow-500 p-6 hover:bg-gray-900 hover:text-white transition-all"
            >
              <div className="aspect-square bg-black border-4 border-white flex items-center justify-center mb-4">
                <Lock className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold uppercase mb-2">{capsule.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{capsule.description}</p>
              <div className="text-sm text-blue-400 mb-2 italic flex items-center">
                <Eye className="w-4 h-4 mr-2" /> {capsule.hint}
              </div>
              <div className="text-sm text-gray-400 flex items-center mb-4">
                <Clock className="w-4 h-4 mr-2" /> Unlocks: {new Date(capsule.unlockTime).toLocaleDateString()}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{capsule.price}</div>
                  <div className="text-xs text-gray-500">by {capsule.creator}</div>
                </div>
                <button
                  onClick={() => handleBuyCapsule(capsule.id)}
                  className="px-4 py-2 bg-yellow-500 text-black border-4 border-white font-bold uppercase hover:bg-blue-500 hover:text-white"
                >
                  <ShoppingCart className="w-4 h-4 mr-2 inline-block" /> Buy
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-6 py-3 bg-black border-4 border-yellow-500 text-white uppercase hover:bg-yellow-500 hover:text-black">
            Load More Capsules
          </button>
        </div>
      </main>
    </div>
  );
}
