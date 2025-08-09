"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, Calendar, FileText, Eye, Lock, Loader, DollarSign, Layers } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits, stringToBytes } from "viem";
import { capsuleXAbi, capsuleXAddress } from "@/constants/contract";

// Types
interface FormData {
  name: string;
  price: string;
  secretHint: string;
  unlockTime: string;
  file: File | null;
  mintAmount: number;
}

export default function CreateCapsulePage() {
    const router = useRouter();
    const { address: accountAddress, isConnected } = useAccount();
    const { writeContractAsync: mintCapsuleAsync } = useWriteContract();

    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        price: "0",
        secretHint: "",
        unlockTime: "",
        file: null,
        mintAmount: 1,
    });

    // Automatically set the creator address when the wallet is connected
    useEffect(() => {
        if (isConnected && accountAddress) {
            console.log("Wallet connected, creator set to:", accountAddress);
        }
    }, [isConnected, accountAddress]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const val = name === 'mintAmount' ? parseInt(value, 10) : value;
        setFormData((prev) => ({ ...prev, [name]: val }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, file }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected) return toast.error("Please connect your wallet.");
        if (!formData.file) return toast.error("Please upload a secret file.");
        if (!formData.unlockTime) return toast.error("Please set an unlock time.");
        if (formData.mintAmount < 1) return toast.error("Number of copies must be at least 1.");

        setIsProcessing(true);
        const creationPromise = async () => {
            const mintAmount = formData.mintAmount;
            toast.info(`Preparing to mint ${mintAmount} capsule(s)...`);

            for (let i = 0; i < mintAmount; i++) {
                const currentCopy = i + 1;
                toast.info(`[${currentCopy}/${mintAmount}] Creating unique policy and uploading to IPFS...`);

                // Mock policy data for now - replace with real NuCypher SDK calls
                const mockPolicyData = {
                    policyLabel: `policy_${formData.name}_${Date.now()}_${currentCopy}`,
                    aliceVerifyingKey: stringToBytes(`alice_key_${currentCopy}`) as any,
                    policyPublicKey: stringToBytes(`policy_pub_key_${currentCopy}`) as any,
                    policyExpiry: BigInt(Math.floor(new Date(formData.unlockTime).getTime() / 1000) + 3600 * 24 * 365),
                };

                // Upload file to IPFS
                const ipfsFormData = new FormData();
                ipfsFormData.append("file", formData.file!);
                
                const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}` },
                    body: ipfsFormData,
                });
                const { IpfsHash } = await res.json();
                if (!IpfsHash) throw new Error(`[${currentCopy}/${mintAmount}] IPFS upload failed.`);

                // Mint on-chain
                toast.info(`[${currentCopy}/${mintAmount}] Please confirm transaction in your wallet...`);
                const priceInSmallestUnit = parseUnits(formData.price, 18);
                const unlockTimestamp = BigInt(Math.floor(new Date(formData.unlockTime).getTime() / 1000));

                await mintCapsuleAsync({
                    address: capsuleXAddress,
                    abi: capsuleXAbi as any,
                    functionName: 'mintCapsule',
                    args: [
                        `${formData.name} #${currentCopy}`, // Add copy number to title
                        formData.secretHint,
                        IpfsHash,
                        priceInSmallestUnit,
                        unlockTimestamp,
                        mockPolicyData.policyLabel,
                        mockPolicyData.aliceVerifyingKey,
                        mockPolicyData.policyPublicKey,
                        mockPolicyData.policyExpiry,
                    ],
                });
            }
        };

        toast.promise(creationPromise(), {
            loading: 'Encrypting & Minting Capsules...',
            success: () => {
                setTimeout(() => router.push('/my-capsules'), 2000);
                return `${formData.mintAmount} capsule(s) created successfully!`;
            },
            error: (err) => err.shortMessage || err.message || 'An error occurred during creation.',
            finally: () => setIsProcessing(false),
        });
    };

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
          <div className="px-6 py-3 bg-yellow-500 text-black font-bold border-4 border-white uppercase hover:ring-4 hover:ring-blue-600 transition-all">
              
              <ConnectButton showBalance={false} />
          </div>
        </nav>
      </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
                <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold uppercase tracking-tighter border-4 border-white inline-block p-4">
                Create Your Capsule
                    </h1>
                    <p className="text-lg text-gray-400">Encrypt your secrets, messages, or files in a time-locked NFT capsule</p>
                </div>
                
                <form onSubmit={handleSubmit} className="bg-black border-4 border-yellow-500 p-8 space-y-8 shadow-xl">
                    <div>
                        <label className="flex items-center font-bold mb-2 text-yellow-500">
                            <FileText className="w-5 h-5 mr-2" /> Capsule Name
                        </label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            placeholder="Enter a memorable name" 
                            className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-500 focus:outline-none hover:border-yellow-500" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="flex items-center font-bold mb-2 text-yellow-500">
                            <DollarSign className="w-5 h-5 mr-2" /> Price (in ETH)
                        </label>
                        <input 
                            type="number" 
                            name="price" 
                            step="0.01" 
                            min="0" 
                            value={formData.price} 
                            onChange={handleInputChange} 
                            placeholder="e.g., 0.1" 
                            className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-500 focus:outline-none hover:border-yellow-500" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="flex items-center font-bold mb-2 text-yellow-500">
                            <Eye className="w-5 h-5 mr-2" /> Secret Hint
                        </label>
                        <input 
                            type="text" 
                            name="secretHint" 
                            value={formData.secretHint} 
                            onChange={handleInputChange} 
                            placeholder="Optional cryptic hint" 
                            className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-500 focus:outline-none hover:border-yellow-500" 
                        />
                    </div>
                    
                    <div>
                        <label className="flex items-center font-bold mb-2 text-yellow-500">
                            <Calendar className="w-5 h-5 mr-2" /> Unlock Time
                        </label>
                        <input 
                            type="datetime-local" 
                            name="unlockTime" 
                            value={formData.unlockTime} 
                            onChange={handleInputChange} 
                            className="w-full px-4 py-3 bg-black border-2 border-white text-white focus:outline-none hover:border-yellow-500" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="flex items-center font-bold mb-2 text-yellow-500">
                            <Layers className="w-5 h-5 mr-2" /> Number of Copies
                        </label>
                        <input 
                            type="number" 
                            name="mintAmount" 
                            min="1" 
                            value={formData.mintAmount} 
                            onChange={handleInputChange} 
                            className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-500 focus:outline-none hover:border-yellow-500" 
                            required 
                        />
                    </div>
                    
                    <div>
                        <label className="flex items-center font-bold mb-2 text-yellow-500">
                            <Upload className="w-5 h-5 mr-2" /> Upload Secret File
                        </label>
                        <div className="border-2 border-dashed border-white p-6 text-center hover:border-yellow-500 cursor-pointer">
                            <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                {formData.file ? (
                                    <div className="text-white">
                                        <p className="font-semibold">{formData.file.name}</p>
                                        <p className="text-sm text-gray-400">
                                            {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
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
                    
                    <div className="flex justify-center pt-4">
                        <button 
                            type="submit" 
                            disabled={isProcessing || !isConnected} 
                            className="px-10 py-3 bg-yellow-500 text-black font-extrabold border-2 border-white hover:bg-yellow-600 hover:scale-105 transition-all flex items-center cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100"
                        >
                            {isProcessing ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Lock className="w-5 h-5 mr-2" />}
                            {isProcessing ? 'Processing...' : `Create ${formData.mintAmount} Capsule(s)`}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
