"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useReadContracts, useWalletClient, useSwitchChain } from "wagmi";
import { toast } from "sonner";
import { Lock, Unlock, Loader, Download, AlertTriangle, ArrowRight } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { capsuleXAbi, capsuleXAddress } from "@/constants/contract";

// Correct TACo imports - use individual functions, not the entire package
import {
  initialize,
  decrypt,
  conditions,
  domains
} from "@nucypher/taco";
import { ethers } from "ethers";

// --- Network IDs ---
const CITREA_TESTNET_ID = 5115; // Citrea Testnet Chain ID
const SEPOLIA_TESTNET_ID = 11155111;

// --- Types ---
interface MyCapsule {
    id: bigint;
    name: string;
    ipfsHash: string;
    policyId: `0x${string}`;
    unlockTime: Date;
    status: 'locked' | 'unlocked';
}

type DecryptionStep = 'idle' | 'switching' | 'decrypting';

export default function MyCapsulesPage() {
    const { address: accountAddress, isConnected, chain } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { switchChain } = useSwitchChain();

    const [isTacoInitialized, setIsTacoInitialized] = useState(false);
    const [capsules, setCapsules] = useState<MyCapsule[]>([]);
    const [decryptionStep, setDecryptionStep] = useState<DecryptionStep>('idle');
    const [processingCapsuleId, setProcessingCapsuleId] = useState<bigint | null>(null);

    // Initialize TACo when component mounts
    useEffect(() => {
        const initTaco = async () => {
            try {
                await initialize();
                setIsTacoInitialized(true);
                toast.success("Decryption service ready!");
            } catch (error) {
                toast.error("Failed to initialize encryption service.");
                console.error("TACo initialization error:", error);
            }
        };
        initTaco();
    }, []);

    // Fetch IDs of capsules owned by the connected user
    const { data: ownedIds, isLoading: isLoadingIds, isSuccess: isSuccessIds } = useReadContract({
        address: capsuleXAddress,
        abi: capsuleXAbi as any,
        functionName: 'capsulesOfOwner',
        args: [accountAddress as `0x${string}`],
        query: { enabled: typeof accountAddress === "string" },
    });

    // Fetch details for each owned capsule
    const { data: capsulesData, isLoading: isLoadingData, isSuccess: isSuccessData } = useReadContracts({
        contracts: ownedIds ? (ownedIds as bigint[]).map(id => ({
            address: capsuleXAddress,
            abi: capsuleXAbi as any,
            functionName: 'getCapsule',
            args: [id],
        })) : [],
        query: { enabled: !!ownedIds && (ownedIds as bigint[]).length > 0 },
    });

    const [hasLoaded, setHasLoaded] = useState(false);
    useEffect(() => {
        if (capsulesData && ownedIds && !hasLoaded) {
            const now = new Date();
            const formattedCapsules: MyCapsule[] = capsulesData
                .filter((res: any) => res.status === 'success')
                .map((capsuleResult: any, index: number) => {
                    const unlockTime = new Date(Number(capsuleResult.result.unlockTime) * 1000);
                    return {
                        id: (ownedIds as bigint[])[index],
                        name: capsuleResult.result.title,
                        ipfsHash: capsuleResult.result.ipfsHash,
                        policyId: capsuleResult.result.policyId,
                        unlockTime: unlockTime,
                        status: now >= unlockTime ? 'unlocked' : 'locked',
                    };
                });
            setCapsules(formattedCapsules);
            
            if (isSuccessIds && isSuccessData) {
                toast.success(`Loaded ${formattedCapsules.length} owned capsule(s) on Citrea.`);
                setHasLoaded(true);
            }
        }
    }, [capsulesData, ownedIds, isSuccessIds, isSuccessData, hasLoaded]);

    // Helper function to switch networks
    const handleNetworkSwitch = async (targetChainId: number) => {
        try {
            await switchChain({ chainId: targetChainId });
            return true;
        } catch (error) {
            console.error("Network switch failed:", error);
            toast.error("Failed to switch network. Please switch manually in your wallet.");
            return false;
        }
    };

    const handleDecrypt = async (capsule: MyCapsule) => {
        if (!isTacoInitialized) {
            return toast.error("Encryption service is not ready. Please wait.");
        }
        
        if (capsule.status === 'locked') {
            return toast.error("This capsule has not reached its unlock time yet.");
        }

        setProcessingCapsuleId(capsule.id);

        // Check if we need to switch to Sepolia for decryption
        if (chain?.id !== SEPOLIA_TESTNET_ID) {
            setDecryptionStep('switching');
            toast.info("Switching to Sepolia for decryption...");
            
            const switched = await handleNetworkSwitch(SEPOLIA_TESTNET_ID);
            if (!switched) {
                setProcessingCapsuleId(null);
                setDecryptionStep('idle');
                return;
            }
            
            // Wait for network switch to complete
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        if (!walletClient) {
            setProcessingCapsuleId(null);
            setDecryptionStep('idle');
            return toast.error("Wallet client not available.");
        }

        setDecryptionStep('decrypting');
        toast.loading("Decrypting capsule...");

        try {
            // 1. Set up ethers provider and signer
            const { transport } = walletClient;
            const provider = new ethers.providers.Web3Provider(transport);
            const signer = provider.getSigner();

            // 2. Fetch encrypted data from IPFS
            toast.info("Fetching encrypted file from IPFS...");
            const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${capsule.ipfsHash}`;
            const ipfsResponse = await fetch(ipfsUrl);
            
            if (!ipfsResponse.ok) {
                throw new Error("Failed to fetch file from IPFS.");
            }
            
            const encryptedBytes = new Uint8Array(await ipfsResponse.arrayBuffer());

            // 3. Decrypt using TACo (correct function call)
            toast.info("Decrypting with TACo...");
            
            const decryptedBytes = await decrypt(
                provider,           // ethers provider
                domains.TESTNET,    // TACo domain
                encryptedBytes,     // encrypted message kit
                signer             // ethers signer
            );

            // 4. Create downloadable file
            const blob = new Blob([decryptedBytes]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `decrypted_${capsule.name.replace(/\s+/g, '_')}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success("🎉 File decrypted and download started!");
            
            // Switch back to Citrea after successful decryption
            setTimeout(async () => {
                toast.info("Switching back to Citrea...");
                await handleNetworkSwitch(CITREA_TESTNET_ID);
            }, 2000);

        } catch (error: any) {
            toast.error(error.message || "Decryption failed.");
            console.error("Decryption error:", error);
        } finally {
            setProcessingCapsuleId(null);
            setDecryptionStep('idle');
        }
    };
    
    const renderDecryptButton = (capsule: MyCapsule) => {
        const isProcessingThis = processingCapsuleId === capsule.id;
        const currentChainId = chain?.id;
        const isOnSepolia = currentChainId === SEPOLIA_TESTNET_ID;

        if (capsule.status === 'locked') {
            return (
                <button 
                    disabled 
                    className="w-full px-4 py-2 bg-gray-600 text-white border-4 border-white font-bold uppercase flex items-center justify-center cursor-not-allowed"
                >
                    <Lock className="w-4 h-4 mr-2" />
                    Locked Until {capsule.unlockTime.toLocaleDateString()}
                </button>
            );
        }

        if (isProcessingThis) {
            switch (decryptionStep) {
                case 'switching':
                    return (
                        <button 
                            disabled 
                            className="w-full px-4 py-2 bg-blue-600 text-white border-4 border-white font-bold uppercase flex items-center justify-center"
                        >
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Switching Networks...
                        </button>
                    );
                case 'decrypting':
                    return (
                        <button 
                            disabled 
                            className="w-full px-4 py-2 bg-purple-600 text-white border-4 border-white font-bold uppercase flex items-center justify-center"
                        >
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Decrypting...
                        </button>
                    );
            }
        }
        
        return (
            <button 
                onClick={() => handleDecrypt(capsule)} 
                disabled={!isTacoInitialized} 
                className="w-full px-4 py-2 bg-green-500 text-black border-4 border-white font-bold uppercase hover:bg-green-600 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
                <Download className="w-4 h-4 mr-2" />
                {!isOnSepolia ? 'Switch & Decrypt' : 'Decrypt File'}
            </button>
        );
    };

    // Network status indicator
    const renderNetworkStatus = () => {
        if (!isConnected) return null;
        
        const isOnCitrea = chain?.id === CITREA_TESTNET_ID;
        const isOnSepolia = chain?.id === SEPOLIA_TESTNET_ID;
        
        return (
            <div className={`mb-6 p-4 border-2 rounded ${
                isOnCitrea ? 'bg-green-900/20 border-green-500' : 
                isOnSepolia ? 'bg-blue-900/20 border-blue-500' : 
                'bg-orange-900/20 border-orange-500'
            }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400">Current Network:</p>
                        <p className={`font-bold ${
                            isOnCitrea ? 'text-green-400' : 
                            isOnSepolia ? 'text-blue-400' : 
                            'text-orange-400'
                        }`}>
                            {isOnCitrea && '🏠 Citrea Testnet (Home)'}
                            {isOnSepolia && '🔐 Sepolia (For Decryption)'}
                            {!isOnCitrea && !isOnSepolia && `❓ ${chain?.name || 'Unknown'}`}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Address:</p>
                        <p className="font-mono text-sm text-white">
                            {accountAddress?.slice(0, 6)}...{accountAddress?.slice(-4)}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-black text-white font-mono">
            <header className="sticky top-0 bg-black border-b-4 border-yellow-500 z-20">
                <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-yellow-500 text-black flex items-center justify-center border-4 border-white">
                            <Lock size={24} aria-hidden="true" />
                        </div>
                        <div>
                            <span className="text-3xl font-extrabold tracking-tighter uppercase">CapsuleX</span>
                            <p className="text-xs text-yellow-500 uppercase tracking-wide">Powered by Citrea</p>
                        </div>
                    </div>
                    <div className="hidden md:flex space-x-6">
                        {["Home", "Marketplace", "Create", "My Capsules"].map((name, i) => (
                            <Link
                                key={i}
                                href={name === "Home" ? "/" : `/${name.toLowerCase().replace(" ", "-")}`}
                                className="text-white font-bold border-b-4 border-transparent hover:text-yellow-500 hover:border-yellow-500 transition-all"
                            >
                                {name}
                            </Link>
                        ))}
                    </div>
                    <div className="px-6 py-3 bg-yellow-500 text-black font-bold border-4 border-white uppercase hover:ring-4 hover:ring-yellow-600 transition-all">
                        <ConnectButton showBalance={false} />
                    </div>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold uppercase tracking-tighter border-4 border-white inline-block p-4">
                        My Capsules
                    </h1>
                    <p className="mt-4 text-gray-400 max-w-2xl mx-auto font-medium">
                        View and decrypt your time-locked NFT capsules stored on Citrea
                    </p>
                </div>

                {renderNetworkStatus()}

                {(isLoadingIds || isLoadingData) ? (
                    <div className="text-center py-10">
                        <Loader className="animate-spin h-12 w-12 mx-auto text-yellow-500" />
                        <p className="mt-4">Loading Your Capsules from Citrea...</p>
                    </div>
                ) : !isConnected ? (
                    <div className="text-center py-10">
                        <p className="text-xl text-gray-400 mb-4">Please connect your wallet to see your capsules.</p>
                        <ConnectButton />
                    </div>
                ) : capsules.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-xl text-gray-400 mb-4">You don't own any capsules yet.</p>
                        <Link 
                            href="/create" 
                            className="inline-block px-6 py-3 bg-yellow-500 text-black font-bold border-4 border-white uppercase hover:bg-yellow-600 transition-colors"
                        >
                            Create Your First Capsule
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {capsules.map((capsule) => (
                            <div key={capsule.id.toString()} className="bg-black border-4 border-yellow-500 p-6 flex flex-col justify-between hover:border-white transition-colors">
                                <div>
                                    <div className={`aspect-square bg-black border-4 flex items-center justify-center mb-4 ${
                                        capsule.status === 'unlocked' ? 'border-green-500' : 'border-gray-500'
                                    }`}>
                                        {capsule.status === 'unlocked' ? 
                                            <Unlock className="w-10 h-10 text-green-500" /> : 
                                            <Lock className="w-10 h-10 text-gray-400" />
                                        }
                                    </div>
                                    <h3 className="text-xl font-bold uppercase mb-2 text-yellow-500">{capsule.name}</h3>
                                    <p className="text-sm text-gray-400 mb-2">
                                        <strong>Status:</strong> {capsule.status === 'unlocked' ? '🟢 Unlocked' : '🔒 Locked'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        <strong>Unlock Time:</strong><br />
                                        {capsule.unlockTime.toLocaleString()}
                                    </p>
                                    {capsule.status === 'locked' && (
                                        <p className="text-xs text-yellow-600 mt-2">
                                            ⏰ {Math.ceil((capsule.unlockTime.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4">
                                    {renderDecryptButton(capsule)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
