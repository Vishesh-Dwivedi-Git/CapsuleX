"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Calendar, User, FileText, Eye, Lock } from "lucide-react"

export default function CreateCapsulePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    secretHint: "",
    unlockTime: "",
    nominee: "",
    file: null as File | null,
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
    // Here you would typically upload to IPFS and mint the NFT
    console.log("Creating capsule:", formData)

    // Simulate capsule creation and redirect to marketplace
    setTimeout(() => {
      router.push("/marketplace")
    }, 1000)
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
              <Link href="/create" className="text-blue-300 font-semibold">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-blue-300 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Create Your Capsule</h1>
          <p className="text-xl text-gray-300">Encrypt your secrets, messages, or files in a time-locked NFT capsule</p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Capsule Name */}
            <div>
              <label className="flex items-center text-white font-semibold mb-3">
                <FileText className="w-5 h-5 mr-2" />
                Capsule Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter a memorable name for your capsule"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center text-white font-semibold mb-3">
                <FileText className="w-5 h-5 mr-2" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what this capsule contains (this will be public)"
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Secret Hint */}
            <div>
              <label className="flex items-center text-white font-semibold mb-3">
                <Eye className="w-5 h-5 mr-2" />
                Secret Hint
              </label>
              <input
                type="text"
                name="secretHint"
                value={formData.secretHint}
                onChange={handleInputChange}
                placeholder="A cryptic hint about the contents (optional)"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Unlock Time */}
            <div>
              <label className="flex items-center text-white font-semibold mb-3">
                <Calendar className="w-5 h-5 mr-2" />
                Unlock Time
              </label>
              <input
                type="datetime-local"
                name="unlockTime"
                value={formData.unlockTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Nominee */}
            <div>
              <label className="flex items-center text-white font-semibold mb-3">
                <User className="w-5 h-5 mr-2" />
                Nominee (Optional)
              </label>
              <input
                type="text"
                name="nominee"
                value={formData.nominee}
                onChange={handleInputChange}
                placeholder="Wallet address of trusted person who can access this capsule"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="flex items-center text-white font-semibold mb-3">
                <Upload className="w-5 h-5 mr-2" />
                Upload File
              </label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" accept="*/*" />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  {formData.file ? (
                    <div className="text-white">
                      <p className="font-semibold">{formData.file.name}</p>
                      <p className="text-sm text-gray-400">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <p className="text-lg font-semibold mb-2">Drop your file here or click to browse</p>
                      <p className="text-sm">Supports all file types up to 100MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                className="px-12 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-green-700 transition-all transform hover:scale-105 flex items-center"
              >
                <Lock className="w-5 h-5 mr-2" />
                Create Capsule
              </button>
            </div>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Encrypted Storage</h3>
            <p className="text-gray-400 text-sm">Your files are encrypted and stored securely on IPFS</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Time-Locked</h3>
            <p className="text-gray-400 text-sm">Contents unlock automatically at your specified time</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-semibold mb-2">Nominee Access</h3>
            <p className="text-gray-400 text-sm">Trusted individuals can access under specific conditions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
