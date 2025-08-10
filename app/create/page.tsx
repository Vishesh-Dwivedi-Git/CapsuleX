"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Upload, Calendar, FileText, Eye, Lock, Loader, DollarSign, Layers, AlertTriangle, ArrowRight } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { useAccount, useWriteContract, useWalletClient } from "wagmi";
import { parseUnits } from "viem";
import { capsuleXAbi, capsuleXAddress } from "@/constants/contract";

// Import the entire TACo package as a namespace to resolve the export error
import * as tacoSdk from "@nucypher/taco";
import { providers } from "ethers";

// --- Network IDs ---
const CITREA_TESTNET_ID = 7878; // Replace with the actual Chain ID for Citrea Testnet
const SEPOLIA_TESTNET_ID = 11155111;

// --- Component State Types ---
type ProcessingStep = 'idle' | 'awaiting_sepolia' | 'encrypting' | 'awaiting_citrea' | 'uploading' | 'minting';

interface EncryptedPayload {
    ciphertext: Uint8Array;
    policyId: `0x${string}`;
}

// --- Types ---
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
    const { isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { writeContractAsync: mintCapsuleAsync } = useWriteContract();

    const [isTacoInitialized, setIsTacoInitialized] = useState(false);
    const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
    const [encryptedPayload, setEncryptedPayload] = useState<EncryptedPayload | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        price: "0",
        secretHint: "",
        unlockTime: "",
        file: null,
        mintAmount: 1,
    });
     
    // Initialize the TACo SDK when the component mounts
    useEffect(() => {
        const initTaco = async () => {
            try {
                // @ts-ignore - Bypassing a known type definition issue with the library
                await tacoSdk.initialize();
                setIsTacoInitialized(true);
                toast.success("Encryption service ready.");
            } catch (error) {
                toast.error("Failed to initialize encryption service.");
                console.error("TACo initialization error:", error);
            }
        };
        initTaco();
    }, []);

    // Derived state to check if the form is valid for submission
    const isFormValid = formData.name && formData.price && formData.unlockTime && formData.file;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const val = name === 'mintAmount' ? Math.max(1, parseInt(value, 10) || 1) : value;
        setFormData((prev) => ({ ...prev, [name]: val }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({ ...prev, file }));
    };

    /**
     * Step 1: Encrypts the file using TACo on the Sepolia network.
     */
    const handleEncryptOnSepolia = async () => {
        if (!walletClient || walletClient.chain.id !== SEPOLIA_TESTNET_ID) {
            return toast.error("Please switch your wallet to the Sepolia network to proceed.");
        }
        if (!formData.file || !formData.unlockTime) return;

        setProcessingStep('encrypting');
        toast.loading("Encrypting file on Sepolia...");

        try {
            const { chain, transport } = walletClient;
            const network = { chainId: chain.id, name: chain.name };
            const provider = new providers.Web3Provider(transport, network);
            // @ts-ignore - Bypassing a known type definition issue with the library
            const taco = new tacoSdk.Taco({ signer: provider.getSigner() });

            const fileContent = await formData.file.arrayBuffer();
            const message = new Uint8Array(fileContent);
            const { ciphertext, messageKit } = await taco.encrypt(message);

            const unlockTimestamp = Math.floor(new Date(formData.unlockTime).getTime() / 1000);
            // @ts-ignore - Bypassing a known type definition issue with the library
            const conditions = new tacoSdk.ConditionBuilder().addTimelockCondition({ unlockAt: unlockTimestamp }).build();
            const policyExpiration = new Date();
            policyExpiration.setFullYear(policyExpiration.getFullYear() + 1);
            
            const policyId = await taco.createPolicy(messageKit, conditions, policyExpiration);

            setEncryptedPayload({ ciphertext, policyId });
            setProcessingStep('awaiting_citrea');
            toast.success("File encrypted! Please switch back to Citrea Testnet.");
        } catch (error: any) {
            toast.error(error.message || "Encryption failed.");
            setProcessingStep('awaiting_sepolia'); // Go back to previous step on failure
        }
    };

    /**
     * Step 2: Mints the NFT on the Citrea network after encryption is complete.
     */
    const handleMintOnCitrea = async () => {
        if (!walletClient || walletClient.chain.id !== CITREA_TESTNET_ID) {
            return toast.error("Please switch your wallet to the Citrea Testnet to proceed.");
        }
        if (!encryptedPayload) return toast.error("Encryption data not found.");

        setProcessingStep('uploading');
        
        try {
            for (let i = 0; i < formData.mintAmount; i++) {
                const currentCopy = i + 1;
                const toastPrefix = `[${currentCopy}/${formData.mintAmount}]`;

                // Upload the ENCRYPTED file to IPFS
                toast.loading(`${toastPrefix} Uploading encrypted file to IPFS...`);
                const ipfsFormData = new FormData();
                const encryptedFile = new File([encryptedPayload.ciphertext], formData.file!.name, { type: formData.file!.type });
                ipfsFormData.append("file", encryptedFile);

                const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}` },
                    body: ipfsFormData,
                });

                if (!pinataResponse.ok) throw new Error(`${toastPrefix} IPFS upload failed.`);
                const { IpfsHash } = await pinataResponse.json();
                toast.success(`${toastPrefix} File uploaded to IPFS!`);

                // Mint the capsule NFT on Citrea
                setProcessingStep('minting');
                toast.loading(`${toastPrefix} Please confirm transaction in your wallet on Citrea...`);
                const priceInSmallestUnit = parseUnits(formData.price, 18);
                
                await mintCapsuleAsync({
                    address: capsuleXAddress,
                    abi: capsuleXAbi as any,
                    functionName: 'mintCapsule',
                    args: [
                        `${formData.name} #${currentCopy}`,
                        formData.secretHint,
                        IpfsHash,
                        priceInSmallestUnit,
                        BigInt(Math.floor(new Date(formData.unlockTime).getTime() / 1000)),
                        encryptedPayload.policyId,
                    ],
                });
                 toast.success(`${toastPrefix} Capsule minted successfully!`);
            }
            // On final success
            toast.success("All capsules created successfully!");
            setTimeout(() => router.push('/my-capsules'), 2000);

        } catch (error: any) {
             toast.error(error.shortMessage || error.message || 'An error occurred during minting.');
        } finally {
            setProcessingStep('idle');
        }
    };

    const beginProcess = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return toast.error("Please fill out all required fields.");
        setProcessingStep('awaiting_sepolia');
        toast.info("Please switch your wallet to Sepolia to begin encryption.");
    };

    // --- Render correct button based on the current step ---
    const renderActionButton = () => {
        if (!isTacoInitialized) {
            return (
                 <button type="button" disabled className="px-10 py-3 bg-gray-600 text-black font-extrabold border-2 border-white flex items-center cursor-not-allowed">
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Initializing Service...
                </button>
            );
        }

        const isWrongNetwork = (networkId: number) => walletClient && walletClient.chain.id !== networkId;

        switch (processingStep) {
            case 'idle':
                return (
                    <button type="submit" disabled={!isConnected || !isFormValid} className="px-10 py-3 bg-yellow-500 text-black font-extrabold border-2 border-white hover:bg-yellow-600 hover:scale-105 transition-all flex items-center cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100">
                        <Lock className="w-5 h-5 mr-2" />
                        Create Capsule(s)
                    </button>
                );
            case 'awaiting_sepolia':
                return (
                    <button type="button" onClick={handleEncryptOnSepolia} disabled={isWrongNetwork(SEPOLIA_TESTNET_ID)} className="px-10 py-3 bg-blue-500 text-white font-extrabold border-2 border-white hover:bg-blue-600 hover:scale-105 transition-all flex items-center cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100">
                        {isWrongNetwork(SEPOLIA_TESTNET_ID) ? <AlertTriangle className="w-5 h-5 mr-2" /> : <ArrowRight className="w-5 h-5 mr-2" />}
                        Encrypt on Sepolia
                    </button>
                );
            case 'encrypting':
                return (
                    <button type="button" disabled className="px-10 py-3 bg-gray-600 text-black font-extrabold border-2 border-white flex items-center cursor-not-allowed">
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Encrypting...
                    </button>
                );
            case 'awaiting_citrea':
                 return (
                    <button type="button" onClick={handleMintOnCitrea} disabled={isWrongNetwork(CITREA_TESTNET_ID)} className="px-10 py-3 bg-green-500 text-white font-extrabold border-2 border-white hover:bg-green-600 hover:scale-105 transition-all flex items-center cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100">
                        {isWrongNetwork(CITREA_TESTNET_ID) ? <AlertTriangle className="w-5 h-5 mr-2" /> : <ArrowRight className="w-5 h-5 mr-2" />}
                        Mint on Citrea
                    </button>
                );
            case 'uploading':
            case 'minting':
                return (
                    <button type="button" disabled className="px-10 py-3 bg-gray-600 text-black font-extrabold border-2 border-white flex items-center cursor-not-allowed">
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        {processingStep === 'uploading' ? 'Uploading...' : 'Minting...'}
                    </button>
                );
        }
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
                
                <form onSubmit={beginProcess} className="bg-black border-4 border-yellow-500 p-8 space-y-8 shadow-xl">
                    <fieldset disabled={processingStep !== 'idle' || !isTacoInitialized}>
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
                                step="0.001" 
                                min="0" 
                                value={formData.price} 
                                onChange={handleInputChange} 
                                placeholder="e.g., 0.01" 
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
                                <input type="file" onChange={handleFileChange} className="hidden" id="file-upload" required/>
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
                    </fieldset>
                    
                    <div className="flex justify-center pt-4">
                        {renderActionButton()}
                    </div>
                </form>
            </main>
        </div>
    );
}
