"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Lock, Unlock, Eye, Download, Share2, Loader } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { useAccount, useReadContracts, useSignMessage } from "wagmi";
import { capsuleXAbi, capsuleXAddress } from "@/constants/contract";
import CountdownTimer from "@/components/CountdownTimer";

// Types
interface Capsule {
  id: bigint;
  name: string;
  hint: string;
  unlockTime: Date;
  status: 'locked' | 'unlocked';
  type: 'created' | 'purchased';
  ipfsHash: string;
  policyLabel: string;
}

function MyCapsulesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { address: accountAddress, isConnected } = useAccount();

    const [myCapsules, setMyCapsules] = useState<Capsule[]>([]);
    const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
    const [isProcessing, setIsProcessing] = useState<bigint | null>(null);

    const { signMessageAsync } = useSignMessage();

    // Data fetching for created capsules
    const { data: createdCapsulesData, isLoading: isLoadingCreated } = useReadContracts({
        contracts: accountAddress ? [{
            address: capsuleXAddress,
            abi: capsuleXAbi as any,
            functionName: 'createdCapsulesOf',
            args: [accountAddress as `0x${string}`],
        }] : [],
        query: { enabled: !!accountAddress },
    });

    // Data fetching for owned capsules
    const { data: ownedCapsulesData, isLoading: isLoadingOwned } = useReadContracts({
        contracts: accountAddress ? [{
            address: capsuleXAddress,
            abi: capsuleXAbi as any,
            functionName: 'capsulesOfOwner',
            args: [accountAddress as `0x${string}`],
        }] : [],
        query: { enabled: !!accountAddress },
    });

    // Get unique capsule IDs
    const createdIds = (createdCapsulesData?.[0]?.result as bigint[]) || [];
    const ownedIds = (ownedCapsulesData?.[0]?.result as bigint[]) || [];
    const uniqueIds = [...new Set([...createdIds, ...ownedIds])];

    // Fetch capsule details
    const { data: capsuleDetails, isLoading: isLoadingDetails } = useReadContracts({
        contracts: uniqueIds.map((id: bigint) => ({
            address: capsuleXAddress,
            abi: capsuleXAbi as any,
            functionName: 'getCapsule',
            args: [id],
        })),
        query: { enabled: uniqueIds.length > 0 },
    });

    useEffect(() => {
        if (capsuleDetails && uniqueIds.length > 0) {
            const now = new Date();
            const formatted: Capsule[] = capsuleDetails
                .filter((res: any) => res.status === 'success')
                .map((detail: any, index: number) => {
                    const capsuleData = detail.result;
                    const unlockTime = new Date(Number(capsuleData.unlockTime) * 1000);
                    const isCreator = createdIds.some((id: bigint) => id.toString() === uniqueIds[index].toString());
                    return {
                        id: uniqueIds[index],
                        name: capsuleData.title,
                        hint: capsuleData.hint,
                        unlockTime: unlockTime,
                        status: now >= unlockTime ? 'unlocked' : 'locked',
                        type: isCreator ? 'created' : 'purchased',
                        ipfsHash: capsuleData.ipfsHash,
                        policyLabel: capsuleData.policyLabel,
                    };
                });
            setMyCapsules(formatted);
        }
    }, [capsuleDetails, uniqueIds, createdIds]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.push(`/my-capsules?tab=${tab}`);
    };

    const triggerDownload = (decryptedBlob: Blob, fileName: string) => {
        const url = URL.createObjectURL(decryptedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleUnlockAndDecrypt = async (capsule: Capsule) => {
        if (!isConnected) return toast.error("Please connect your wallet first!");
        
        setIsProcessing(capsule.id);
        const decryptionPromise = async () => {
            // 1. Prove ownership
            toast.info("Please sign the message to prove ownership...");
            const messageToSign = `I own CapsuleX NFT #${capsule.id.toString()} and wish to decrypt its content.`;
            const signature = await signMessageAsync({ message: messageToSign });

            // 2. Request re-encryption from NuCypher (placeholder)
            toast.info("Requesting content key from NuCypher network...");
            // const reencryptedKey = await nucypher.requestReencryption(capsule.policyLabel, signature);
            // const symmetricKey = await nucypher.decryptReencryptedKey(reencryptedKey);

            // 3. Download encrypted file from IPFS
            toast.info("Downloading encrypted file from IPFS...");
            const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${capsule.ipfsHash}`;
            const response = await fetch(ipfsUrl);
            if (!response.ok) throw new Error("Could not fetch file from IPFS.");
            const encryptedBlob = await response.blob();

            // 4. Decrypt file locally (placeholder)
            toast.info("Decrypting file...");
            // const decryptedBlob = await nucypher.decryptWithSymmetricKey(encryptedBlob, symmetricKey);
            
            // Using a placeholder for the final step
            const decryptedBlob = new Blob([`DECRYPTED_CONTENT_OF_${capsule.name}`], { type: 'text/plain' });
            return { decryptedBlob, fileName: capsule.name.replace(/ /g, '_') + '.txt' };
        };

        toast.promise(decryptionPromise(), {
            loading: 'Unlocking & Decrypting Capsule...',
            success: (result) => {
                triggerDownload(result.decryptedBlob, result.fileName);
                return 'Content decrypted successfully!';
            },
            error: (err) => err.shortMessage || err.message || 'Decryption failed.',
            finally: () => setIsProcessing(null),
        });
    };
    
    if (isLoadingCreated || isLoadingOwned || isLoadingDetails) {
        return (
            <div className="min-h-screen bg-black text-white font-mono">
                <header className="fixed top-0 left-0 right-0 bg-black border-b-4 border-yellow-500 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                        <Link href="/" className="text-2xl font-bold text-yellow-500">
                            CapsuleX
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link href="/marketplace" className="px-4 py-2 bg-yellow-500 text-black border-4 border-white font-bold uppercase hover:bg-blue-500 hover:text-white">
                                Marketplace
                            </Link>
                            <Link href="/create" className="px-4 py-2 bg-yellow-500 text-black border-4 border-white font-bold uppercase hover:bg-blue-500 hover:text-white">
                                Create
                            </Link>
                            <ConnectButton />
                        </div>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                    <div className="text-center py-10">
                        <Loader className="animate-spin h-12 w-12 mx-auto text-yellow-500" />
                        <p className="mt-4">Loading Your Capsules...</p>
                    </div>
                </main>
            </div>
        );
    }

    const filteredCapsules = myCapsules.filter((capsule) => activeTab === "all" || capsule.type === activeTab);

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
                    <p className="mt-10 text-gray-400 max-w-2xl mx-auto font-medium">
                        Manage and unlock your time-locked NFT capsules
                    </p>
                </div>

                <div className="flex space-x-1 mb-8 bg-white/5 border border-white rounded-lg p-1">
                    {[
                        { key: "all", label: "All Capsules" },
                        { key: "created", label: "Created" },
                        { key: "purchased", label: "Purchased" }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`flex-1 py-2 px-4 rounded-md font-bold transition-all ${
                                activeTab === tab.key
                                    ? "bg-yellow-500 text-black"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {filteredCapsules.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCapsules.map((capsule) => (
                            <div key={capsule.id.toString()} className="bg-black border-4 border-yellow-500 p-6 flex flex-col justify-between">
                                <div>
                                    <div className="aspect-square bg-black border-4 border-white flex items-center justify-center mb-4">
                                        <Lock className="w-10 h-10 text-yellow-500" />
                                    </div>
                                    <h3 className="text-xl font-bold uppercase mb-2">{capsule.name}</h3>
                                    <div className="text-sm text-blue-400 mb-2 italic flex items-center">
                                        <Eye className="w-4 h-4 mr-2" /> {capsule.hint}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400 flex items-center mb-4">
                                        <Clock className="w-4 h-4 mr-2" />
                                        {capsule.status === 'locked' ? (
                                            <CountdownTimer unlockTime={capsule.unlockTime} />
                                        ) : (
                                            <span>Ready to Unlock</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        {capsule.status === 'unlocked' ? (
                                            <button 
                                                onClick={() => handleUnlockAndDecrypt(capsule)} 
                                                disabled={isProcessing === capsule.id} 
                                                className="w-full px-5 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold border-2 border-white hover:from-blue-700 hover:to-green-700 transition-all flex items-center justify-center disabled:opacity-50"
                                            >
                                                {isProcessing === capsule.id ? 
                                                    <Loader className="w-4 h-4 mr-2 animate-spin" /> : 
                                                    <Unlock className="w-4 h-4 mr-2" />
                                                } 
                                                {isProcessing === capsule.id ? 'Decrypting...' : 'Unlock & Decrypt'}
                                            </button>
                                        ) : (
                                            <button disabled className="w-full px-5 py-2 bg-gray-600 text-gray-300 font-bold border-2 border-white cursor-not-allowed flex items-center justify-center">
                                                <Lock className="w-4 h-4 mr-2" /> Locked
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No Capsules Found</h3>
                        <p className="text-gray-400 mb-6">
                            {activeTab === "all" 
                                ? "You don't have any capsules yet." 
                                : `You don't have any ${activeTab} capsules yet.`
                            }
                        </p>
                        <Link href="/create" className="px-6 py-3 bg-yellow-500 text-black font-bold border-2 border-white hover:bg-yellow-600 transition-all">
                            Create Your First Capsule
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function MyCapsulesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
                <Loader className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-spin" />
            </div>
        }>
            <MyCapsulesContent />
        </Suspense>
    );
}
