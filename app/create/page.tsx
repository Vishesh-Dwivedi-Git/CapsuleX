"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Upload,
  Calendar,
  User,
  FileText,
  Eye,
  Lock,
  Hash,
  Layers
} from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function CreateCapsulePage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    secretHint: "",
    unlockTime: "",
    nominee: "",
    file: null as File | null,
    mintAmount: 1,
    creator: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, file }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating capsule:", formData)
    setTimeout(() => {
      router.push("/marketplace")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <header className="sticky top-0 bg-black border-b-4 border-yellow-500 z-20">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500 text-black flex items-center justify-center border-4 border-white">
              <Lock size={24} />
            </div>
            <span className="text-3xl font-extrabold uppercase tracking-tighter">CapsuleX</span>
          </div>
          <div className="hidden md:flex space-x-6">
            {["Home", "Marketplace", "Create", "My Capsules"].map((name) => (
              <Link
                key={name}
                href={name === "Home" ? "/" : `/${name.toLowerCase().replace(" ", "-")}`}
                className="text-white font-bold border-b-4 border-transparent hover:text-blue-500 hover:border-yellow-500 transition-all"
              >
                {name}
              </Link>
            ))}
          </div>
          <button className="px-6 py-3 bg-yellow-500 text-black font-bold border-4 border-white uppercase hover:ring-4 hover:ring-blue-600 transition-all">
           <ConnectButton showBalance={false} />
          </button>
        </nav>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-4">Create Your Capsule</h1>
          <p className="text-lg text-gray-400">Encrypt your secrets, messages, or files in a time-locked NFT capsule</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-black border-4 border-white p-8 space-y-8 shadow-xl"
        >
          <div>
            <label className="flex items-center font-bold mb-2 text-[#D4A300]">
              <FileText className="w-5 h-5 mr-2" /> Capsule Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter a memorable name"
              className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-500 focus:outline-none hover:border-[#D4A300]"
              required
            />
          </div>

          <div>
            <label className="flex items-center font-bold mb-2 text-[#D4A300]">
              <FileText className="w-5 h-5 mr-2" /> Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the capsule contents"
              rows={4}
              className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-500 focus:outline-none hover:border-[#D4A300]"
              required
            />
          </div>

          <div>
            <label className="flex items-center font-bold mb-2 text-[#D4A300]">
              <Eye className="w-5 h-5 mr-2" /> Secret Hint
            </label>
            <input
              type="text"
              name="secretHint"
              value={formData.secretHint}
              onChange={handleInputChange}
              placeholder="Optional cryptic hint"
              className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-500 focus:outline-none hover:border-[#D4A300]"
            />
          </div>

          <div>
            <label className="flex items-center font-bold mb-2 text-[#D4A300]">
              <Calendar className="w-5 h-5 mr-2" /> Unlock Time
            </label>
            <input
              type="datetime-local"
              name="unlockTime"
              value={formData.unlockTime}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-black border-2 border-white text-white focus:outline-none hover:border-[#D4A300]"
              required
            />
          </div>

          <div>
            <label className="flex items-center font-bold mb-2 text-[#D4A300]">
              <User className="w-5 h-5 mr-2" /> Nominee (optional)
            </label>
            <input
              type="text"
              name="nominee"
              value={formData.nominee}
              onChange={handleInputChange}
              placeholder="Wallet address of trusted person"
              className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-500 focus:outline-none hover:border-[#D4A300]"
            />
          </div>

          <div>
            <label className="flex items-center font-bold mb-2 text-[#D4A300]">
              <Layers className="w-5 h-5 mr-2" /> Number of Copies
            </label>
            <input
              type="number"
              name="mintAmount"
              min={1}
              value={formData.mintAmount}
              onChange={handleInputChange}
              placeholder="e.g. 10"
              className="w-full px-4 py-3 bg-black border-2 border-white text-white focus:outline-none hover:border-[#D4A300]"
              required
            />
          </div>

          <div>
            <label className="flex items-center font-bold mb-2 text-[#D4A300]">
              <Hash className="w-5 h-5 mr-2" /> Creator Wallet Address
            </label>
            <input
              type="text"
              name="creator"
              value={formData.creator}
              onChange={handleInputChange}
              placeholder="Your wallet address"
              className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-500 focus:outline-none hover:border-[#D4A300]"
              required
            />
          </div>

          <div>
            <label className="flex items-center font-bold mb-2 text-[#D4A300]">
              <Upload className="w-5 h-5 mr-2" /> Upload File
            </label>
            <div className="border-2 border-dashed border-white p-6 text-center hover:border-[#D4A300] cursor-pointer">
              <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                {formData.file ? (
                  <div className="text-white">
                    <p className="font-semibold">{formData.file.name}</p>
                    <p className="text-sm text-gray-400">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <p className="text-lg font-semibold mb-1">Drop your file here or click to browse</p>
                    <p className="text-sm">Supports all file types up to 100MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="px-10 py-3 bg-[#D4A300] text-black font-extrabold border-2 border-white hover:bg-[#C19500] hover:scale-105 transition-all flex items-center cursor-pointer"
            >
              <Lock className="w-5 h-5 mr-2" /> Create Capsule
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
