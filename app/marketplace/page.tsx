"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Eye, Lock, ShoppingCart, Loader } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { useAccount, useReadContract, useReadContracts, useWriteContract, usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import { capsuleXAbi, capsuleXAddress } from "@/constants/contract";
import CountdownTimer from "@/components/CountdownTimer";

// Types
interface Capsule {
  id: bigint;
  name: string;
  hint: string;
  unlockTime: Date;
  price: bigint;
  creator: string;
  status: 'locked' | 'unlocked';
}

export default function MarketplacePage() {
    const router = useRouter();
    const { isConnected } = useAccount();
    const publicClient = usePublicClient();

    const [capsules, setCapsules] = useState<Capsule[]>([]);
    const [processingCapsuleId, setProcessingCapsuleId] = useState<bigint | null>(null);

    const { writeContractAsync: approveAsync } = useWriteContract();
    const { writeContractAsync: buyAsync } = useWriteContract();

    // Data fetching hooks
    const { data: listedIds, isLoading: isLoadingIds } = useReadContract({
        address: capsuleXAddress,
        abi: capsuleXAbi as any,
        functionName: 'listedCapsules',
    });

    const { data: capsulesData, isLoading: isLoadingData } = useReadContracts({
        contracts: listedIds ? (listedIds as bigint[]).map((id: bigint) => ({
            address: capsuleXAddress,
            abi: capsuleXAbi as any,
            functionName: 'getCapsule',
            args: [id],
        })) : [],
        query: { enabled: !!listedIds && (listedIds as bigint[]).length > 0 },
    });
    
    // Updated logic to format data AND filter out unlocked capsules
    useEffect(() => {
        if (capsulesData && listedIds) {
            const now = new Date();
            const formattedAndFilteredCapsules: Capsule[] = capsulesData
                .filter((res: any) => res.status === 'success') // Ensure the contract read was successful
                .map((capsuleResult: any, index: number) => {
                    const unlockTime = new Date(Number(capsuleResult.result.unlockTime) * 1000);
                    const status: 'locked' | 'unlocked' = now >= unlockTime ? 'unlocked' : 'locked';
                    return {
                        id: (listedIds as bigint[])[index],
                        name: capsuleResult.result.title,
                        hint: capsuleResult.result.hint,
                        unlockTime: unlockTime,
                        price: capsuleResult.result.price,
                        creator: capsuleResult.result.creator,
                        status: status,
                    };
                })
                // Filter to only show capsules that are still locked
                .filter((capsule) => capsule.status === 'locked');

            setCapsules(formattedAndFilteredCapsules);
        }
    }, [capsulesData, listedIds]);

    const handleBuyCapsule = async (capsule: Capsule) => {
        if (!isConnected) return toast.error("Please connect your wallet first!");
        if (!publicClient) return toast.error("Failed to connect to blockchain");
        
        setProcessingCapsuleId(capsule.id);
        
        const purchasePromise = async () => {
            const paymentTokenAddress = await publicClient.readContract({
                address: capsuleXAddress,
                abi: capsuleXAbi as any,
                functionName: 'paymentToken',
                args: []
            });

            const erc20Abi = [{"inputs":[{"name":"spender","type":"address"},{"name":"amount","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];
            
            toast.info("Please approve the token transfer in your wallet...");
            await approveAsync({
                address: paymentTokenAddress as `0x${string}`,
                abi: erc20Abi,
                functionName: 'approve',
                args: [capsuleXAddress, capsule.price],
            });

            toast.info("Approval successful! Please confirm the purchase...");
            await buyAsync({
                address: capsuleXAddress,
                abi: capsuleXAbi as any,
                functionName: 'buyCapsule',
                args: [capsule.id],
            });
        };

        toast.promise(purchasePromise(), {
            loading: 'Processing transaction...',
            success: () => {
                setTimeout(() => router.push('/my-capsules'), 2000);
                return 'Capsule purchased successfully!';
            },
            error: (err) => err.shortMessage || 'Purchase failed or was rejected.',
            finally: () => setProcessingCapsuleId(null),
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

            <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-extrabold uppercase tracking-tighter border-4 border-white inline-block p-4">
                        NFT Capsule Marketplace
                    </h1>

                    <p className="mt-4 text-gray-400 max-w-2xl mx-auto font-medium">
                    Explore and acquire unique encrypted NFT capsules from creators worldwide
                    </p>
                </div>
                
                {(isLoadingIds || isLoadingData) ? (
                    <div className="text-center py-10">
                        <Loader className="animate-spin h-12 w-12 mx-auto text-yellow-500" />
                        <p className="mt-4">Loading Capsules...</p>
                    </div>
                ) : capsules.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-xl text-gray-400">There are no time-locked capsules available for purchase right now.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {capsules.map((capsule) => (
                            <div key={capsule.id.toString()} className="bg-black border-4 border-yellow-500 p-6 flex flex-col justify-between hover:bg-gray-900">
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
                                        <CountdownTimer unlockTime={capsule.unlockTime} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-bold">{formatUnits(capsule.price, 18)} ETH</div>
                                            <div className="text-xs text-gray-500">
                                                by {`${capsule.creator.slice(0, 6)}...${capsule.creator.slice(-4)}`}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleBuyCapsule(capsule)} 
                                            disabled={processingCapsuleId === capsule.id} 
                                            className="px-4 py-2 bg-yellow-500 text-black border-4 border-white font-bold uppercase hover:bg-blue-500 hover:text-white disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                                        >
                                            {processingCapsuleId === capsule.id ? 
                                                <Loader className="animate-spin w-4 h-4 mr-2" /> : 
                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                            }
                                            {processingCapsuleId === capsule.id ? 'Processing...' : 'Buy'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
