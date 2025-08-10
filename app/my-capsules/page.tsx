"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useReadContract, useReadContracts, useWalletClient } from "wagmi";
import { toast } from "sonner";
import { Lock, Unlock, Loader, Download, AlertTriangle, ArrowRight } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { capsuleXAbi, capsuleXAddress } from "@/constants/contract";

// Import the entire TACo package as a namespace to resolve the export error
import * as tacoSdk from "@nucypher/taco";
import { providers } from "ethers";

// --- Network IDs ---
const CITREA_TESTNET_ID = 7878; // Replace with the actual Chain ID for Citrea Testnet
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

type DecryptionStep = 'idle' | 'awaiting_sepolia' | 'decrypting';

export default function MyCapsulesPage() {
    const { address: accountAddress, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();

    const [isTacoInitialized, setIsTacoInitialized] = useState(false);
    const [capsules, setCapsules] = useState<MyCapsule[]>([]);
    const [decryptionStep, setDecryptionStep] = useState<DecryptionStep>('idle');
    const [processingCapsuleId, setProcessingCapsuleId] = useState<bigint | null>(null);

    // Initialize the TACo SDK when the component mounts
    useEffect(() => {
        const initTaco = async () => {
            try {
                // @ts-ignore - Bypassing a known type definition issue with the library
                await tacoSdk.initialize();
                setIsTacoInitialized(true);
            } catch (error) {
                toast.error("Failed to initialize encryption service.");
                console.error("TACo initialization error:", error);
            }
        };
        initTaco();
    }, []);

    // Fetch IDs of capsules owned by the connected user on Citrea
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

    // A flag to prevent the success toast from showing on every render
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
            // Show success toast only once after the initial load
            if (isSuccessIds && isSuccessData) {
                 toast.success(`Loaded ${formattedCapsules.length} owned capsule(s).`);
                 setHasLoaded(true);
            }
        }
    }, [capsulesData, ownedIds, isSuccessIds, isSuccessData, hasLoaded]);

    const handleDecrypt = async (capsule: MyCapsule) => {
        if (!isTacoInitialized) return toast.error("Encryption service is not ready. Please wait.");
        if (capsule.status === 'locked') {
            return toast.error("This capsule has not reached its unlock time yet.");
        }
        if (!walletClient || walletClient.chain.id !== SEPOLIA_TESTNET_ID) {
            setProcessingCapsuleId(capsule.id);
            setDecryptionStep('awaiting_sepolia');
            return toast.info("Please switch your wallet to Sepolia to decrypt.");
        }

        setDecryptionStep('decrypting');
        toast.loading("Decrypting file on Sepolia...");

        try {
            // 1. Initialize TACo on Sepolia
            const { chain, transport } = walletClient;
            const provider = new providers.Web3Provider(transport, { chainId: chain.id, name: chain.name });
            // @ts-ignore - Bypassing a known type definition issue with the library
            const taco = new tacoSdk.Taco({ signer: provider.getSigner() });

            // 2. Fetch the encrypted data from IPFS
            toast.info("Fetching encrypted file from IPFS...");
            const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${capsule.ipfsHash}`;
            const ipfsResponse = await fetch(ipfsUrl);
            if (!ipfsResponse.ok) throw new Error("Failed to fetch file from IPFS.");
            const encryptedBytes = new Uint8Array(await ipfsResponse.arrayBuffer());

            // 3. Decrypt using TACo
            toast.info("Requesting decryption from Threshold Network...");
            const decryptedBytes = await taco.decrypt(capsule.policyId, encryptedBytes);

            // 4. Create a downloadable link for the decrypted file
            const blob = new Blob([decryptedBytes]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `decrypted_${capsule.name.replace(/\s+/g, '_')}`; // Set a default filename
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success("File decrypted and download started!");
        } catch (error: any) {
            toast.error(error.message || "Decryption failed.");
        } finally {
            setProcessingCapsuleId(null);
            setDecryptionStep('idle');
        }
    };
    
    const renderDecryptButton = (capsule: MyCapsule) => {
        const isProcessingThis = processingCapsuleId === capsule.id;
        const isWrongNetwork = (networkId: number) => walletClient && walletClient.chain.id !== networkId;

        if (capsule.status === 'locked') {
            return <button disabled className="w-full px-4 py-2 bg-gray-600 text-white border-4 border-white font-bold uppercase flex items-center justify-center cursor-not-allowed"><Lock className="w-4 h-4 mr-2" />Locked</button>;
        }

        if (isProcessingThis) {
             switch (decryptionStep) {
                case 'awaiting_sepolia':
                    return <button onClick={() => handleDecrypt(capsule)} disabled={isWrongNetwork(SEPOLIA_TESTNET_ID)} className="w-full px-4 py-2 bg-blue-500 text-white border-4 border-white font-bold uppercase flex items-center justify-center disabled:bg-gray-600"><ArrowRight className="w-4 h-4 mr-2" />Decrypt on Sepolia</button>;
                case 'decrypting':
                    return <button disabled className="w-full px-4 py-2 bg-gray-600 text-white border-4 border-white font-bold uppercase flex items-center justify-center"><Loader className="w-4 h-4 mr-2 animate-spin" />Decrypting...</button>;
            }
        }
        
        return <button onClick={() => handleDecrypt(capsule)} disabled={!isTacoInitialized} className="w-full px-4 py-2 bg-green-500 text-black border-4 border-white font-bold uppercase hover:bg-green-600 flex items-center justify-center disabled:bg-gray-500"><Unlock className="w-4 h-4 mr-2" />Decrypt</button>;
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

            <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold uppercase tracking-tighter border-4 border-white inline-block p-4">
                        My Capsules
                    </h1>
                    <p className="mt-4 text-gray-400 max-w-2xl mx-auto font-medium">
                        View and decrypt the NFT capsules you own.
                    </p>
                </div>

                {(isLoadingIds || isLoadingData) ? (
                    <div className="text-center py-10"><Loader className="animate-spin h-12 w-12 mx-auto text-yellow-500" /><p className="mt-4">Loading Your Capsules...</p></div>
                ) : !isConnected ? (
                     <div className="text-center py-10"><p className="text-xl text-gray-400">Please connect your wallet to see your capsules.</p></div>
                ) : capsules.length === 0 ? (
                    <div className="text-center py-10"><p className="text-xl text-gray-400">You do not own any capsules yet.</p></div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {capsules.map((capsule) => (
                            <div key={capsule.id.toString()} className="bg-black border-4 border-yellow-500 p-6 flex flex-col justify-between">
                                <div>
                                    <div className={`aspect-square bg-black border-4 border-white flex items-center justify-center mb-4 ${capsule.status === 'unlocked' ? 'border-green-500' : 'border-white'}`}>
                                        {capsule.status === 'unlocked' ? <Unlock className="w-10 h-10 text-green-500" /> : <Lock className="w-10 h-10 text-yellow-500" />}
                                    </div>
                                    <h3 className="text-xl font-bold uppercase mb-2">{capsule.name}</h3>
                                    <p className="text-sm text-gray-400">Unlock Date: {capsule.unlockTime.toLocaleString()}</p>
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
