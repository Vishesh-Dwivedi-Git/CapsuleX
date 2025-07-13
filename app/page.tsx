"use client";

import Link from "next/link";
import { ArrowRight, Shield, Clock, Users, Zap, Lock, Globe } from "lucide-react";
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
      <section className="pt-20 pb-24 border-b-4 border-yellow-500">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase border-4 border-white p-4 mb-6 inline-block">
            Secure Your
            <span className="block text-yellow-500 mt-2">Digital Legacy</span>
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-10 font-medium">
            Mint raw, time-locked <span className="text-yellow-500">NFT capsules</span> to preserve secrets, messages, or assets. Unlock with blockchain-verified triggers.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/create"
              className="inline-flex items-center px-8 py-4 bg-yellow-500 text-black font-bold border-4 border-white uppercase hover:ring-4 hover:ring-blue-600 transition-all"
            >
              Mint Capsule
              <ArrowRight className="ml-2 w-6 h-6 text-black" />
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center px-8 py-4 bg-black text-white font-bold border-4 border-yellow-500 uppercase hover:bg-blue-600 hover:text-yellow-500 transition-all"
            >
              Explore Marketplace
              <ArrowRight className="ml-2 w-6 h-6 text-yellow-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-b-4 border-yellow-500">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold tracking-tighter uppercase border-b-4 border-white inline-block mb-4">
              Why CapsuleX?
            </h2>
            <p className="text-lg text-gray-200 max-w-xl mx-auto font-medium">
              Raw, unfiltered blockchain features for <span className="text-yellow-500">secure digital preservation</span>
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Clock size={28} className="text-blue-500" />,
                title: "Time-Locked Vaults",
                description: "Program brutal unlock triggers with smart contracts for precise secret reveals.",
              },
              {
                icon: <Shield size={28} className="text-blue-500" />,
                title: "Blockchain Storage",
                description: "Immutable, decentralized storage ensures your capsules resist censorship.",
              },
              {
                icon: <Users size={28} className="text-blue-500" />,
                title: "Nominee Protocol",
                description: "Assign trusted wallets for verified capsule access under strict conditions.",
              },
              {
                icon: <Zap size={28} className="text-blue-500" />,
                title: "Raw Trading",
                description: "Trade capsules instantly on a no-nonsense decentralized marketplace.",
              },
              {
                icon: <Lock size={28} className="text-blue-500" />,
                title: "Hardened Encryption",
                description: "Unbreakable cryptographic locks secure your data until conditions are met.",
              },
              {
                icon: <Globe size={28} className="text-blue-500" />,
                title: "Global Access",
                description: "Retrieve capsules from any chain with a wallet, no compromises.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-black border-4 border-yellow-500 p-6 hover:ring-2 hover:ring-blue-500 transition-all"
              >
                <div className="w-12 h-12 bg-white text-black flex items-center justify-center border-4 border-yellow-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-extrabold uppercase text-white mb-3">{feature.title}</h3>
                <p className="text-gray-200 text-sm font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-b-4 border-yellow-500">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-extrabold tracking-tighter uppercase border-4 border-white p-4 inline-block mb-6">
            Mint Your <span className="text-yellow-500">Capsule</span> Now
          </h2>
          <p className="text-lg text-gray-200 mb-10 font-medium">
            Join the raw Web3 movement with CapsuleX to lock in your digital legacy
          </p>
          <Link
            href="/create"
            className="inline-flex items-center px-8 py-4 bg-yellow-500 text-black font-bold border-4 border-white uppercase hover:ring-4 hover:ring-blue-600 transition-all"
          >
            Get Started
            <ArrowRight className="ml-2 w-6 h-6 text-black" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t-4 border-yellow-500">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-500 text-black flex items-center justify-center border-4 border-white">
                  <Lock size={24} />
                </div>
                <span className="ml-2 text-2xl font-extrabold uppercase text-white">CapsuleX</span>
              </div>
              <p className="text-gray-200 text-sm font-medium">
                Unapologetic decentralized NFT capsules for raw digital legacy preservation.
              </p>
            </div>
            <div>
              <h3 className="text-white font-extrabold uppercase mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-200 text-sm font-medium">
                <li><Link href="/marketplace" className="hover:text-blue-500 transition-all">Marketplace</Link></li>
                <li><Link href="/create" className="hover:text-blue-500 transition-all">Create Capsule</Link></li>
                <li><Link href="/my-capsules" className="hover:text-blue-500 transition-all">My Capsules</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-extrabold uppercase mb-4">Support</h3>
              <ul className="space-y-2 text-gray-200 text-sm font-medium">
                <li><a href="#" className="hover:text-blue-500 transition-all">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-all">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-500 transition-all">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t-4 border-yellow-500 mt-8 pt-8 text-center text-gray-200 text-sm font-medium">
            <p>© 2025 CapsuleX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
