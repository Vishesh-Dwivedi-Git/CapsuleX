"use client";

import { useState, useEffect, SetStateAction } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Lock, Unlock, Eye, Download, Share2 } from "lucide-react";
import { Suspense } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

// Mock data
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
];

// Define the main component
function MyCapsulesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "all";

  const [activeTab, setActiveTab] = useState(tabParam);

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: SetStateAction<string>) => {
    setActiveTab(tab);
    const newUrl = `/my-capsules?tab=${tab}`;
    router.push(newUrl);
  };

  const filteredCapsules = mockOwnedCapsules.filter((capsule) => {
    if (activeTab === "all") return true;
    return capsule.type === activeTab;
  });

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <header className="sticky top-0 bg-black border-b-4 border-[#D4A300] z-20">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#D4A300] text-black flex items-center justify-center border-4 border-white">
              <Lock size={24} aria-hidden="true" />
            </div>
            <span className="text-3xl font-extrabold tracking-tighter uppercase">CapsuleX</span>
          </div>
          <div className="hidden md:flex space-x-6">
            {["Home", "Marketplace", "Create", "My Capsules"].map((name, i) => (
              <Link
                key={i}
                href={name === "Home" ? "/" : `/${name.toLowerCase().replace(" ", "-")}`}
                className={`text-white font-bold border-b-4 transition-all cursor-pointer ${
                  name === "My Capsules" ? "text-[#D4A300] border-[#D4A300]" : "border-transparent hover:text-blue-500 hover:border-[#D4A300]"
                }`}
              >
                {name}
              </Link>
            ))}
          </div>
          <button className="px-6 py-3 bg-[#D4A300] text-black font-bold border-4 border-white uppercase hover:ring-4 hover:ring-blue-600-angular transition-all">
            <ConnectButton showBalance={false} />
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-4">My Capsules</h1>
          <p className="text-xl text-gray-300">Manage your created and purchased capsules</p>
        </div>

        <div className="flex space-x-1 mb-8 bg-white/5 border border-white rounded-lg p-1">
          {["all", "created", "purchased"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 px-4 py-2 font-semibold uppercase transition-all cursor-pointer border-2 ${
                activeTab === tab
                  ? "bg-[#D4A300] text-black border-white"
                  : "text-white border-transparent hover:text-[#D4A300] hover:border-[#D4A300]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCapsules.map((capsule) => (
            <div
              key={capsule.id}
              className="bg-black border-4 border-[#D4A300] p-6 hover:bg-gray-900 transition-all"
            >
              <div className="aspect-square bg-black border-4 border-white flex items-center justify-center mb-4">
                <Lock className="w-10 h-10 text-[#D4A300]" />
              </div>
              <h3 className="text-xl font-bold uppercase mb-2">{capsule.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{capsule.description}</p>
              <div className="text-sm text-blue-400 mb-2 italic flex items-center">
                <Eye className="w-4 h-4 mr-2" /> {capsule.hint}
              </div>
              <div className="text-sm text-gray-400 flex items-center mb-4">
                <Clock className="w-4 h-4 mr-2" />
                {capsule.status === "unlocked"
                  ? "Unlocked"
                  : `Unlocks: ${new Date(capsule.unlockTime).toLocaleString()}`}
              </div>
              <div className="flex items-center justify-between">
                {capsule.status === "unlocked" ? (
                  <>
                    <button className="px-5 py-2 bg-[#D4A300] text-black font-bold border-2 border-white hover:bg-[#C19500] transition-all flex items-center justify-center">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </button>
                    <button className="px-5 py-2 bg-white text-black font-bold border-2 border-white hover:bg-gray-100 transition-all flex items-center justify-center">
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </button>
                  </>
                ) : new Date(capsule.unlockTime) <= new Date() ? (
                  <button className="px-5 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold border-2 border-white hover:from-blue-700 hover:to-green-700 transition-all flex items-center justify-center">
                    <Unlock className="w-4 h-4 mr-2" /> Unlock Now
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-5 py-2 bg-gray-600 text-gray-300 font-bold border-2 border-white cursor-not-allowed flex items-center justify-center"
                  >
                    <Lock className="w-4 h-4 mr-2" /> Locked
                  </button>
                )}
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
              className="inline-flex items-center px-6 py-3 bg-[#D4A300] text-black font-bold border-2 border-white hover:bg-[#C19500] transition-all"
            >
              {activeTab === "created"
                ? "Create Your First Capsule"
                : "Browse Marketplace"}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

// Wrap the component with Suspense
export default function MyCapsulesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-16 h-16 text-[#D4A300] mx-auto mb-4 animate-pulse" />
            <p className="text-xl text-gray-300">Loading your capsules...</p>
          </div>
        </div>
      }
    >
      <MyCapsulesContent />
    </Suspense>
  );
}