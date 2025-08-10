"use client";

import Link from "next/link";
import { Lock, Clock, Shield, Users, ArrowRight, FileText, ShoppingCart, User } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Header */}
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
          <div className="px-6 py-3 bg-yellow-500 text-black font-bold border-4 border-white uppercase hover:ring-4 hover:ring-blue-600 transition-all">
            <ConnectButton showBalance={false} />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-extrabold uppercase tracking-tighter mb-8">
            <span className="border-4 border-white inline-block p-4">Time-Locked</span>
            <br />
            <span className="border-4 border-yellow-500 inline-block p-4 text-yellow-500">NFT Capsules</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Encrypt your secrets, messages, or files in secure NFT capsules that unlock at predetermined times. 
            Built on Citrea with NuCypher encryption for maximum security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/create"
              className="px-8 py-4 bg-yellow-500 text-black font-extrabold border-4 border-white text-xl uppercase hover:bg-yellow-600 hover:scale-105 transition-all flex items-center"
            >
              <Lock className="w-6 h-6 mr-3" />
              Create Capsule
            </Link>
            <Link
              href="/marketplace"
              className="px-8 py-4 bg-transparent text-white font-extrabold border-4 border-white text-xl uppercase hover:bg-white hover:text-black transition-all flex items-center"
            >
              <ShoppingCart className="w-6 h-6 mr-3" />
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-16 uppercase tracking-tighter border-4 border-white inline-block mx-auto p-4">
            Why CapsuleX?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-black border-4 border-yellow-500">
              <div className="w-16 h-16 bg-yellow-500 text-black flex items-center justify-center border-4 border-white mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase">Military-Grade Encryption</h3>
              <p className="text-gray-400 leading-relaxed">
                Your secrets are protected by NuCypher's threshold encryption, ensuring only you can access them when the time comes.
              </p>
            </div>
            <div className="text-center p-8 bg-black border-4 border-yellow-500">
              <div className="w-16 h-16 bg-yellow-500 text-black flex items-center justify-center border-4 border-white mx-auto mb-6">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase">Time-Locked Access</h3>
              <p className="text-gray-400 leading-relaxed">
                Set precise unlock times for your capsules. Perfect for time-sensitive information, inheritance planning, or surprise reveals.
              </p>
            </div>
            <div className="text-center p-8 bg-black border-4 border-yellow-500">
              <div className="w-16 h-16 bg-yellow-500 text-black flex items-center justify-center border-4 border-white mx-auto mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 uppercase">Decentralized & Trustless</h3>
              <p className="text-gray-400 leading-relaxed">
                Built on Citrea blockchain with no central authority. Your data, your control, your timeline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-16 uppercase tracking-tighter border-4 border-white inline-block mx-auto p-4">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500 text-black flex items-center justify-center border-4 border-white mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-4 uppercase">Create</h3>
              <p className="text-gray-400">
                Upload your file, set unlock time, and encrypt with NuCypher
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500 text-black flex items-center justify-center border-4 border-white mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-4 uppercase">Mint</h3>
              <p className="text-gray-400">
                Mint as NFT on Citrea blockchain with encrypted IPFS storage
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500 text-black flex items-center justify-center border-4 border-white mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-4 uppercase">Trade</h3>
              <p className="text-gray-400">
                Buy, sell, or transfer capsules on our marketplace
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-500 text-black flex items-center justify-center border-4 border-white mx-auto mb-6 text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-bold mb-4 uppercase">Unlock</h3>
              <p className="text-gray-400">
                Decrypt and download when the time comes using NuCypher
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-8 uppercase tracking-tighter border-4 border-white inline-block p-4">
            Ready to Start?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join the future of secure, time-locked digital assets. Create your first capsule today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/create"
              className="px-8 py-4 bg-yellow-500 text-black font-extrabold border-4 border-white text-xl uppercase hover:bg-yellow-600 hover:scale-105 transition-all flex items-center"
            >
              <FileText className="w-6 h-6 mr-3" />
              Create Your First Capsule
              <ArrowRight className="w-6 h-6 ml-3" />
            </Link>
            <Link
              href="/marketplace"
              className="px-8 py-4 bg-transparent text-white font-extrabold border-4 border-white text-xl uppercase hover:bg-white hover:text-black transition-all flex items-center"
            >
              <ShoppingCart className="w-6 h-6 mr-3" />
              Explore Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t-4 border-yellow-500">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-yellow-500 text-black flex items-center justify-center border-4 border-white">
              <Lock size={24} aria-hidden="true" />
            </div>
            <span className="text-2xl font-extrabold tracking-tighter uppercase">CapsuleX</span>
          </div>
          <p className="text-gray-400 mb-6">
            Secure, time-locked NFT capsules powered by NuCypher and Citrea blockchain
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
            <Link href="/marketplace" className="text-gray-400 hover:text-white transition-colors">Marketplace</Link>
            <Link href="/create" className="text-gray-400 hover:text-white transition-colors">Create</Link>
            <Link href="/my-capsules" className="text-gray-400 hover:text-white transition-colors">My Capsules</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
