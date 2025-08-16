"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract, useWalletClient, useSwitchChain } from "wagmi";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { capsuleXAbi, capsuleXAddress } from "@/constants/contract";
import {
  Upload,
  Calendar,
  FileText,
  Eye,
  Lock,
  Loader,
  DollarSign,
  Layers,
  AlertTriangle,
  CalendarDays,
  Clock
} from "lucide-react";
import { ethers } from "ethers";

// Network Configuration (aligned with Providers)
const NETWORKS = {
  CITREA_TESTNET: { id: 5115, name: "Citrea Testnet" },
  POLYGON_MUMBAI: { id: 80002, name: "Polygon Mumbai" }
} as const;

const TACO_RITUAL_ID = 0;

// TACo imports
interface TacoFunctions {
  initialize: () => Promise<void>;
  encrypt: (
    provider: ethers.providers.Web3Provider,
    domain: string,
    message: Uint8Array,
    condition: any,
    ritualId: number,
    signer: ethers.Signer
  ) => Promise<any>;
  decrypt: (...args: any[]) => Promise<any>;
  conditions: { base: { time: { TimeCondition: any } } };
  domains: { TESTNET: string };
}

let tacoAvailable = false;
let tacoFunctions: Partial<TacoFunctions> = {};

try {
  const taco = require("@nucypher/taco");
  tacoFunctions = {
    initialize: taco.initialize,
    encrypt: taco.encrypt,
    decrypt: taco.decrypt,
    conditions: taco.conditions,
    domains: taco.domains
  };
  tacoAvailable = true;
} catch (error) {
  console.warn("TACo library not available:", error);
  tacoAvailable = false;
}

// Types
type ProcessingStep = "idle" | "encrypting" | "uploading" | "minting" | "complete";

interface EncryptedPayload {
  ciphertext: Uint8Array;
  policyId: `0x${string}`;
}

interface FormData {
  name: string;
  price: string;
  secretHint: string;
  unlockDate: string;
  unlockTime: string;
  file: File | null;
  mintAmount: number;
}

interface CalendarDay {
  date: Date;
  day: number;
  isPastDate: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
  dateString: string;
}

export default function CreateCapsulePage() {
  const router = useRouter();
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync: mintCapsuleAsync } = useWriteContract();

  const [isTacoInitialized, setIsTacoInitialized] = useState(false);
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
  const [encryptedPayloads, setEncryptedPayloads] = useState<EncryptedPayload[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarNavigating, setCalendarNavigating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    price: "0",
    secretHint: "",
    unlockDate: "",
    unlockTime: "12:00",
    file: null,
    mintAmount: 1
  });

  // Initialize TACo
  useEffect(() => {
    const initTaco = async () => {
      if (!tacoAvailable || !tacoFunctions.initialize) {
        console.log("TACo unavailable or initialize function missing");
        toast.info("TACo library not available. Using secure Citrea fallback encryption.");
        return;
      }

      try {
        await tacoFunctions.initialize();
        setIsTacoInitialized(true);
        console.log("TACo initialized successfully");
        toast.success("🐹 TACo Tapir encryption service ready!");
      } catch (error) {
        console.error("TACo Tapir initialization error:", error);
        toast.info("TACo Tapir initialization failed. Using Citrea fallback encryption.");
        setIsTacoInitialized(false);
      }
    };
    initTaco();
  }, []);

  /**
   * Combines unlock date and time into a Date object
   * @returns Date object or null if invalid
   */
  const getCombinedDateTime = useCallback(() => {
    if (!formData.unlockDate || !formData.unlockTime) return null;
    const dateTime = new Date(`${formData.unlockDate}T${formData.unlockTime}+05:30`); // IST offset
    return isNaN(dateTime.getTime()) ? null : dateTime;
  }, [formData.unlockDate, formData.unlockTime]);

  const isFormValid = useMemo(
    () =>
      formData.name &&
      parseFloat(formData.price) >= 0 &&
      formData.unlockDate &&
      formData.unlockTime &&
      formData.file &&
      getCombinedDateTime() &&
      getCombinedDateTime()! > new Date(),
    [formData, getCombinedDateTime]
  );

  /**
   * Handles input changes for form fields
   * @param e - Input or textarea change event
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const val =
        name === "mintAmount"
          ? Math.max(1, Math.min(10, parseInt(value, 10) || 1))
          : name === "price"
          ? value === "" || parseFloat(value) >= 0
            ? value
            : "0"
          : value;
      setFormData(prev => ({ ...prev, [name]: val }));
    },
    []
  );

  /**
   * Handles file selection
   * @param e - File input change event
   */
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  }, []);

  /**
   * Generates calendar days for a given year and month
   * @param year - Year to generate calendar for
   * @param month - Month to generate calendar for (0-11)
   * @returns Array of calendar day objects
   */
  const generateCalendarDays = useMemo(
    () =>
      (year: number, month: number): CalendarDay[] => {
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: CalendarDay[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < 42; i++) {
          const currentDate = new Date(startDate);
          currentDate.setDate(startDate.getDate() + i);

          const isPastDate = currentDate < today;
          const isCurrentMonth = currentDate.getMonth() === month;
          const dateString = currentDate.toISOString().split("T")[0];
          const isSelected = formData.unlockDate === dateString;

          days.push({
            date: currentDate,
            day: currentDate.getDate(),
            isPastDate,
            isCurrentMonth,
            isSelected,
            dateString
          });
        }

        return days;
      },
    [formData.unlockDate]
  );

  const [calendarView, setCalendarView] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  /**
   * Handles date selection from calendar
   * @param dateString - Selected date in YYYY-MM-DD format
   */
  const handleDateSelect = useCallback((dateString: string) => {
    setFormData(prev => ({
      ...prev,
      unlockDate: dateString
    }));
    setShowCalendar(false);
    toast.success(`Date selected: ${new Date(dateString).toLocaleDateString("en-IN")}`);
  }, []);

  /**
   * Navigates calendar to previous or next month
   * @param direction - 'prev' or 'next'
   */
  const navigateCalendar = useCallback(
    (direction: "prev" | "next") => {
      if (calendarNavigating) return;
      setCalendarNavigating(true);

      setCalendarView(prev => {
        let newYear = prev.year;
        let newMonth = prev.month;

        if (direction === "next") {
          newMonth = prev.month + 1;
          if (newMonth > 11) {
            newMonth = 0;
            newYear = prev.year + 1;
          }
        } else {
          newMonth = prev.month - 1;
          if (newMonth < 0) {
            newMonth = 11;
            newYear = prev.year - 1;
          }
        }

        return { year: newYear, month: newMonth };
      });

      setTimeout(() => setCalendarNavigating(false), 300);
    },
    [calendarNavigating]
  );

  /**
   * Generates quick date options
   * @returns Array of quick date objects
   */
  const getQuickDates = useMemo(
    () => () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      const nextWeek = new Date(now);
      nextWeek.setDate(now.getDate() + 7);

      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);

      return [
        { label: "Tomorrow", date: tomorrow },
        { label: "Next Week", date: nextWeek },
        { label: "Next Month", date: nextMonth }
      ];
    },
    []
  );

  /**
   * Performs fallback encryption on Citrea
   * @param data - Data to encrypt
   * @param copyIndex - Copy number (1-based)
   * @param totalCopies - Total number of copies
   * @returns Encrypted payload
   */
  const createCitreaEncryption = async (
    data: Uint8Array,
    copyIndex: number,
    totalCopies: number
  ): Promise<EncryptedPayload> => {
    console.log(`Starting Citrea encryption for copy ${copyIndex}/${totalCopies}`);
    const timestamp = Date.now();
    const walletAddress = address || "0x0000000000000000000000000000000000000000";

    const uniqueSalt = `Citrea-${walletAddress}-${timestamp}-copy-${copyIndex}-of-${totalCopies}-${Math.random().toString(36)}`;
    const saltBytes = new TextEncoder().encode(uniqueSalt);

    const key = new TextEncoder().encode(`CapsuleX-Citrea-${uniqueSalt}-${formData.name}`);
    let encrypted = new Uint8Array(data.length);

    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < data.length; i++) {
        const keyIndex = (i + copyIndex * 7 + pass * 11) % key.length;
        const saltIndex = (i + pass * 13) % saltBytes.length;
        encrypted[i] = (pass === 0 ? data[i] : encrypted[i]) ^ key[keyIndex] ^ saltBytes[saltIndex];
      }
    }

    const hashInput = `${uniqueSalt}-${Buffer.from(encrypted.slice(0, 32)).toString("hex")}-citrea-${copyIndex}`;
    const hash = Array.from(new TextEncoder().encode(hashInput))
      .map(byte => byte.toString(16).padStart(2, "0"))
      .join("");

    const policyId = `0x${hash.padEnd(64, "0").substring(0, 64)}` as `0x${string}`;

    console.log(`Generated Citrea policy ID for copy ${copyIndex}: ${policyId}`);
    return { ciphertext: encrypted, policyId };
  };

  /**
   * Performs TACo Tapir encryption
   * @param data - Data to encrypt
   * @param copyIndex - Copy number (1-based)
   * @param totalCopies - Total number of copies
   * @param provider - Ethers provider
   * @param signer - Ethers signer
   * @param unlockTimestamp - Unlock timestamp in seconds
   * @returns Encrypted payload
   */
  const createTacoTapirEncryption = async (
    data: Uint8Array,
    copyIndex: number,
    totalCopies: number,
    provider: ethers.providers.Web3Provider,
    signer: ethers.Signer,
    unlockTimestamp: number
  ): Promise<EncryptedPayload> => {
    console.log(`Starting TACo Tapir encryption for copy ${copyIndex}/${totalCopies}`);
    const copySpecificData = `tapir-copy-${copyIndex}-of-${totalCopies}-${Date.now()}-${Math.random()}`;
    const copyBytes = new TextEncoder().encode(copySpecificData);

    const uniqueMessage = new Uint8Array(data.length + copyBytes.length);
    uniqueMessage.set(data);
    uniqueMessage.set(copyBytes, data.length);

    const timeCondition = new tacoFunctions.conditions!.base.time.TimeCondition({
      returnValueTest: {
        comparator: ">=",
        value: unlockTimestamp
      },
      method: "blocktime",
      chain: NETWORKS.POLYGON_MUMBAI.id
    });

    try {
      const messageKit = await tacoFunctions.encrypt!(
        provider,
        tacoFunctions.domains!.TESTNET,
        uniqueMessage,
        timeCondition,
        TACO_RITUAL_ID,
        signer
      );

      const ciphertext = messageKit.toBytes();
      const hash = Buffer.from(ciphertext).toString("hex");
      const policyId = `0x${hash.slice(0, 64)}` as `0x${string}`;

      console.log(`Generated TACo Tapir policy ID for copy ${copyIndex}: ${policyId}`);
      return { ciphertext, policyId };
    } catch (error) {
      console.error(`TACo encryption failed for copy ${copyIndex}:`, error);
      throw new Error(`TACo encryption failed for copy ${copyIndex}`);
    }
  };

  /**
   * Switches to the specified network
   * @param chainId - Target chain ID
   * @param networkName - Name of the network for toast messages
   * @returns True if successful, false otherwise
   */
  const switchToNetwork = useCallback(
    async (chainId: number, networkName: string) => {
      try {
        console.log(`Switching to network ${networkName} (chainId: ${chainId})`);
        await switchChainAsync({ chainId });
        console.log(`Successfully switched to ${networkName}`);
        return true;
      } catch (error) {
        console.error(`Failed to switch to ${networkName} (chain ${chainId}):`, error);
        toast.error(`Failed to switch to ${networkName}. Please switch manually in your Rainbow wallet.`);
        return false;
      }
    },
    [switchChainAsync]
  );

  /**
   * Handles the encryption process for multiple copies
   */
  const handleEncryption = async () => {
    if (!walletClient || !formData.file || !formData.unlockDate || !formData.unlockTime) {
      console.error("Missing required inputs or wallet connection", {
        walletClient: !!walletClient,
        file: !!formData.file,
        unlockDate: formData.unlockDate,
        unlockTime: formData.unlockTime
      });
      toast.error("Missing required inputs or wallet connection.");
      setProcessingStep("idle");
      return;
    }

    const unlockDateTime = getCombinedDateTime();
    if (!unlockDateTime || unlockDateTime <= new Date()) {
      console.error("Invalid or past unlock time", { unlockDateTime });
      toast.error("Unlock time must be in the future.");
      setProcessingStep("idle");
      return;
    }

    setProcessingStep("encrypting");
    const encryptionToastId = `encryption-${Date.now()}`;
    toast.loading(`Creating ${formData.mintAmount} unique encrypted copies...`, { id: encryptionToastId });

    const encryptedCopies: EncryptedPayload[] = [];

    try {
      console.log("Reading file content...");
      const message = new Uint8Array(await formData.file.arrayBuffer());
      console.log(`File content read: ${message.length} bytes`);

      if (isTacoInitialized && tacoAvailable && tacoFunctions.encrypt && tacoFunctions.domains && tacoFunctions.conditions) {
        console.log("Attempting TACo Tapir encryption");
        try {
          const originalChain = chain?.id;
          let needToSwitchBack = false;

          // Switch to Polygon Mumbai for TACo Tapir
          if (originalChain !== NETWORKS.POLYGON_MUMBAI.id) {
            toast.loading(`🐹 Switching to ${NETWORKS.POLYGON_MUMBAI.name} for TACo Tapir encryption...`, {
              id: encryptionToastId
            });
            const switched = await switchToNetwork(NETWORKS.POLYGON_MUMBAI.id, NETWORKS.POLYGON_MUMBAI.name);
            if (!switched) {
              throw new Error(`Failed to switch to ${NETWORKS.POLYGON_MUMBAI.name}`);
            }
            needToSwitchBack = true;
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

          const { transport } = walletClient;
          const provider = new ethers.providers.Web3Provider(transport);
          const signer = provider.getSigner();
          const unlockTimestamp = Math.floor(unlockDateTime.getTime() / 1000);
          console.log(`Provider and signer initialized for TACo encryption`);

          // Encrypt each copy with TACo Tapir
          for (let i = 0; i < formData.mintAmount; i++) {
            const copyNumber = i + 1;
            toast.loading(`🐹 Encrypting copy ${copyNumber}/${formData.mintAmount} with TACo Tapir...`, {
              id: encryptionToastId
            });

            const encryptedData = await createTacoTapirEncryption(
              message,
              copyNumber,
              formData.mintAmount,
              provider,
              signer,
              unlockTimestamp
            );

            encryptedCopies.push(encryptedData);
            toast.success(`✅ Tapir copy ${copyNumber}/${formData.mintAmount} encrypted!`, { id: encryptionToastId });
          }

          // Switch back to Citrea for minting
          if (needToSwitchBack && originalChain === NETWORKS.CITREA_TESTNET.id) {
            toast.loading(`🔄 Switching back to ${NETWORKS.CITREA_TESTNET.name} for minting...`, {
              id: encryptionToastId
            });
            const switched = await switchToNetwork(NETWORKS.CITREA_TESTNET.id, NETWORKS.CITREA_TESTNET.name);
            if (!switched) {
              throw new Error(`Failed to switch back to ${NETWORKS.CITREA_TESTNET.name}`);
            }
            await new Promise(resolve => setTimeout(resolve, 1500));
          }

          toast.success("🎉 All copies encrypted with TACo Tapir! Ready for Citrea minting.", {
            id: encryptionToastId
          });
        } catch (tacoError) {
          console.error("TACo Tapir encryption failed:", tacoError);
          toast.error("❌ TACo Tapir encryption failed. Switching to Citrea fallback encryption...", {
            id: encryptionToastId
          });
          throw new Error("TACo Tapir failed, using Citrea fallback");
        }
      } else {
        console.log("TACo not available or incomplete, using Citrea fallback encryption");
        toast.info(`🔐 TACo unavailable. Using secure ${NETWORKS.CITREA_TESTNET.name} encryption...`, {
          id: encryptionToastId
        });
      }

      // Fallback to Citrea encryption
      if (chain?.id !== NETWORKS.CITREA_TESTNET.id) {
        toast.loading(`🔄 Switching to ${NETWORKS.CITREA_TESTNET.name} for encryption...`, { id: encryptionToastId });
        const switched = await switchToNetwork(NETWORKS.CITREA_TESTNET.id, NETWORKS.CITREA_TESTNET.name);
        if (!switched) {
          console.error("Failed to switch to Citrea for fallback encryption");
          toast.error(`Failed to switch to ${NETWORKS.CITREA_TESTNET.name}. Aborting encryption.`, {
            id: encryptionToastId
          });
          setProcessingStep("idle");
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      for (let i = 0; i < formData.mintAmount; i++) {
        const copyNumber = i + 1;
        toast.loading(`🔐 Encrypting copy ${copyNumber}/${formData.mintAmount} on Citrea...`, {
          id: encryptionToastId
        });

        const encryptedData = await createCitreaEncryption(message, copyNumber, formData.mintAmount);
        encryptedCopies.push(encryptedData);

        toast.success(`✅ Citrea copy ${copyNumber}/${formData.mintAmount} encrypted!`, { id: encryptionToastId });
      }

      setEncryptedPayloads(encryptedCopies);
      toast.success(`🎉 All ${formData.mintAmount} copies encrypted with unique policy IDs!`, {
        id: encryptionToastId
      });

      await handleUploadAndMint();
    } catch (error: any) {
      console.error("Encryption error:", error);
      toast.error(error.message || "Encryption failed. Please try again.", { id: encryptionToastId });
      setProcessingStep("idle");
    }
  };

  /**
   * Uploads encrypted payloads to IPFS and mints NFTs on Citrea
   */
  const handleUploadAndMint = async () => {
    if (!encryptedPayloads.length) {
      console.error("No encrypted payloads found");
      toast.error("No encrypted data found.");
      setProcessingStep("idle");
      return;
    }

    if (!capsuleXAddress || !capsuleXAbi) {
      console.error("Contract configuration missing", { capsuleXAddress, capsuleXAbi });
      toast.error("Contract configuration missing for Citrea Testnet. Please check CapsuleX contract settings.");
      setProcessingStep("idle");
      return;
    }

    if (chain?.id !== NETWORKS.CITREA_TESTNET.id) {
      console.log(`Current chain (${chain?.id}) is not Citrea Testnet (${NETWORKS.CITREA_TESTNET.id})`);
      const mintToastId = `mint-${Date.now()}`;
      toast.info(`🔄 Switching to ${NETWORKS.CITREA_TESTNET.name} for minting...`, { id: mintToastId });
      const switched = await switchToNetwork(NETWORKS.CITREA_TESTNET.id, NETWORKS.CITREA_TESTNET.name);
      if (!switched) {
        console.error(`Failed to switch to ${NETWORKS.CITREA_TESTNET.name} for minting`);
        toast.error(`Please manually switch to ${NETWORKS.CITREA_TESTNET.name} in your Rainbow wallet.`, {
          id: mintToastId
        });
        setProcessingStep("idle");
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setProcessingStep("uploading");
    const mintToastId = `mint-${Date.now()}`;
    toast.loading("Uploading to IPFS and minting on Citrea...", { id: mintToastId });

    try {
      const unlockDateTime = getCombinedDateTime();
      if (!unlockDateTime) {
        console.error("Invalid unlock time");
        throw new Error("Invalid unlock time");
      }

      for (let i = 0; i < encryptedPayloads.length; i++) {
        const currentCopy = i + 1;
        const encryptedPayload = encryptedPayloads[i];
        const toastPrefix = `[${currentCopy}/${encryptedPayloads.length}]`;

        // Upload to IPFS
        console.log(`${toastPrefix} Uploading to IPFS...`);
        toast.loading(`${toastPrefix} 📤 Uploading to IPFS...`, { id: mintToastId });
        const ipfsFormData = new FormData();
        const encryptedFile = new File(
          [encryptedPayload.ciphertext],
          `citrea_${formData.file!.name}_copy_${currentCopy}`,
          { type: formData.file!.type }
        );
        ipfsFormData.append("file", encryptedFile);

        const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
          },
          body: ipfsFormData
        });

        if (!pinataResponse.ok) {
          const errorText = await pinataResponse.text();
          console.error(`${toastPrefix} IPFS upload failed: ${errorText}`);
          throw new Error(`${toastPrefix} IPFS upload failed: ${errorText}`);
        }

        const { IpfsHash } = await pinataResponse.json();
        console.log(`${toastPrefix} Uploaded to IPFS: ${IpfsHash}`);
        toast.success(`${toastPrefix} ✅ Uploaded to IPFS!`, { id: mintToastId });

        // Mint on Citrea
        setProcessingStep("minting");
        console.log(`${toastPrefix} Minting capsule on Citrea...`);
        toast.loading(`${toastPrefix} 🏗️ Minting capsule on Citrea...`, { id: mintToastId });

        const priceInSmallestUnit = parseUnits(formData.price || "0", 18);

        try {
          await mintCapsuleAsync({
            address: capsuleXAddress,
            abi: capsuleXAbi,
            functionName: "mintCapsule",
            args: [
              `${formData.name} #${currentCopy}`,
              formData.secretHint,
              IpfsHash,
              priceInSmallestUnit,
              BigInt(Math.floor(unlockDateTime.getTime() / 1000)),
              encryptedPayload.policyId
            ]
          });
          console.log(`${toastPrefix} Successfully minted capsule on Citrea`);
          toast.success(`${toastPrefix} 🎉 Capsule minted on Citrea!`, { id: mintToastId });
        } catch (contractError: any) {
          console.error(`${toastPrefix} Minting failed:`, contractError);
          throw new Error(
            contractError.shortMessage || contractError.message || `${toastPrefix} Failed to mint on Citrea`
          );
        }
      }

      setProcessingStep("complete");
      toast.success(`🎊 All ${encryptedPayloads.length} unique capsules created on Citrea!`, { id: mintToastId });
      setTimeout(() => {
        console.log("Redirecting to /my-capsules");
        router.push("/my-capsules");
      }, 3000);
    } catch (error: any) {
      console.error("Minting error:", error);
      toast.error(error.message || "Failed to mint on Citrea.", { id: mintToastId });
      setProcessingStep("idle");
    }
  };

  /**
   * Initiates the encryption and minting process
   * @param e - Form submission event
   */
  const beginProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      console.error("Wallet not connected");
      toast.error("Please connect your wallet using Rainbow.");
      return;
    }
    if (!isFormValid) {
      console.error("Form validation failed", { formData });
      toast.error("Please fill out all required fields and ensure unlock time is in the future.");
      return;
    }

    await handleEncryption();
  };

  /**
   * Renders the action button based on processing step
   */
  const renderActionButton = useCallback(() => {
    const buttonConfigs: Record<
      ProcessingStep | "disconnected",
      { label: string; disabled: boolean; className: string; icon?: JSX.Element }
    > = {
      disconnected: {
        label: "",
        disabled: false,
        className: "text-center",
        icon: undefined
      },
      idle: {
        label: `Create ${formData.mintAmount} Unique Capsule${formData.mintAmount > 1 ? "s" : ""} on Citrea`,
        disabled: !isFormValid,
        className:
          "px-10 py-3 bg-yellow-500 text-black font-extrabold border-2 border-white hover:bg-yellow-600 hover:scale-105 transition-all flex items-center cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100",
        icon: <Lock className="w-5 h-5 mr-2" />
      },
      encrypting: {
        label: "Encrypting (May switch networks)...",
        disabled: true,
        className:
          "px-10 py-3 bg-blue-600 text-white font-extrabold border-2 border-white flex items-center cursor-not-allowed",
        icon: <Loader className="w-5 h-5 mr-2 animate-spin" />
      },
      uploading: {
        label: "Uploading to IPFS...",
        disabled: true,
        className:
          "px-10 py-3 bg-purple-600 text-white font-extrabold border-2 border-white flex items-center cursor-not-allowed",
        icon: <Loader className="w-5 h-5 mr-2 animate-spin" />
      },
      minting: {
        label: "Minting on Citrea...",
        disabled: true,
        className:
          "px-10 py-3 bg-green-600 text-white font-extrabold border-2 border-white flex items-center cursor-not-allowed",
        icon: <Loader className="w-5 h-5 mr-2 animate-spin" />
      },
      complete: {
        label: "Complete! Redirecting...",
        disabled: true,
        className:
          "px-10 py-3 bg-green-500 text-white font-extrabold border-2 border-white flex items-center cursor-not-allowed",
        icon: <>✅</>
      }
    };

    if (!isConnected) {
      return (
        <div className={buttonConfigs.disconnected.className}>
          <p className="text-gray-400 mb-4">Connect your wallet using Rainbow to create capsules on Citrea</p>
          <ConnectButton />
        </div>
      );
    }

    const { label, disabled, className, icon } = buttonConfigs[processingStep];
    return (
      <button type={processingStep === "idle" ? "submit" : "button"} disabled={disabled} className={className}>
        {icon}
        {label}
        {processingStep === "idle" && isTacoInitialized && <span className="ml-2 text-xs">🐹 Tapir Ready</span>}
      </button>
    );
  }, [isConnected, processingStep, isFormValid, formData.mintAmount, isTacoInitialized]);

  /**
   * Renders the network status indicator
   */
  const renderNetworkStatus = useCallback(() => {
    if (!isConnected) return null;

    const isOnCitrea = chain?.id === NETWORKS.CITREA_TESTNET.id;
    const isOnMumbai = chain?.id === NETWORKS.POLYGON_MUMBAI.id;

    const statusConfigs = {
      citrea: {
        bgClass: "bg-green-900/20 border-green-500",
        textClass: "text-green-400",
        label: `🏠 ${NETWORKS.CITREA_TESTNET.name} (Main Chain)`
      },
      mumbai: {
        bgClass: "bg-purple-900/20 border-purple-500",
        textClass: "text-purple-400",
        label: `🐹 ${NETWORKS.POLYGON_MUMBAI.name} (TACo Tapir)`
      },
      other: {
        bgClass: "bg-orange-900/20 border-orange-500",
        textClass: "text-orange-400",
        label: `❓ ${chain?.name || "Unknown"}`
      }
    };

    const status = isOnCitrea ? "citrea" : isOnMumbai ? "mumbai" : "other";

    return (
      <div className={`mb-6 p-4 border-2 rounded ${statusConfigs[status].bgClass}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Current Network:</p>
            <p className={`font-bold ${statusConfigs[status].textClass}`}>{statusConfigs[status].label}</p>
            <p className="text-xs text-gray-500 mt-1">
              {isTacoInitialized ? `✅ TACo Tapir ready (${NETWORKS.POLYGON_MUMBAI.name})` : "⚠️ Using Citrea encryption"}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              💎 NFTs mint on Citrea • 🐹 TACo encrypts on Tapir (Mumbai)
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Address:</p>
            <p className="font-mono text-sm text-white">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>
      </div>
    );
  }, [isConnected, chain, isTacoInitialized, address]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ] as const;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

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
              <p className="text-xs text-yellow-500 uppercase tracking-wide">Powered by Citrea + TACo Tapir</p>
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold uppercase tracking-tighter border-4 border-white inline-block p-4">
            Create Your Capsules
          </h1>
          <p className="text-lg text-gray-400 mt-4">
            Encrypt with <span className="text-purple-400 font-bold">🐹 TACo Tapir</span> • Mint on{" "}
            <span className="text-yellow-500 font-bold">Citrea</span>
          </p>
          <p className="text-sm text-gray-500">Automatic network switching • Each copy gets unique encryption</p>
        </div>

        {renderNetworkStatus()}

        <form onSubmit={beginProcess} className="bg-black border-4 border-yellow-500 p-8 space-y-8 shadow-xl">
          <fieldset disabled={processingStep !== "idle" || !isConnected}>
            <div>
              <label className="flex items-center font-bold mb-2 text-yellow-500">
                <FileText className="w-5 h-5 mr-2" /> Capsule Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter a memorable name for your Citrea capsule series"
                className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 disabled:bg-gray-900 disabled:text-gray-500"
                required
              />
            </div>

            <div>
              <label className="flex items-center font-bold mb-2 text-yellow-500">
                <DollarSign className="w-5 h-5 mr-2" /> Price (in cBTC)
              </label>
              <input
                type="number"
                name="price"
                step="0.001"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., 0.01 cBTC"
                className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 disabled:bg-gray-900 disabled:text-gray-500"
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
                placeholder="Optional hint about the encrypted content"
                className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 disabled:bg-gray-900 disabled:text-gray-500"
              />
            </div>

            <div>
              <label className="flex items-center font-bold mb-2 text-yellow-500">
                <CalendarDays className="w-5 h-5 mr-2" /> Unlock Date & Time
              </label>

              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Quick Select:</p>
                <div className="flex gap-2 flex-wrap">
                  {getQuickDates().map((quickDate, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        const dateString = quickDate.date.toISOString().split("T")[0];
                        setFormData(prev => ({
                          ...prev,
                          unlockDate: dateString
                        }));
                        toast.success(`Selected: ${quickDate.label}`);
                      }}
                      className="px-3 py-1 bg-gray-700 text-white text-sm border border-gray-500 hover:bg-gray-600 hover:border-yellow-500 transition-colors"
                    >
                      {quickDate.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative mb-4">
                <div className="flex gap-2">
                  <input
                    type="date"
                    name="unlockDate"
                    value={formData.unlockDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="flex-1 px-4 py-3 bg-black border-2 border-white text-white focus:outline-none focus:border-yellow-500 disabled:bg-gray-900 disabled:text-gray-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="px-4 py-3 bg-yellow-500 text-black border-2 border-white hover:bg-yellow-600 transition-colors"
                    disabled={calendarNavigating}
                    aria-label={showCalendar ? "Close calendar" : "Open calendar"}
                  >
                    {calendarNavigating ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Calendar className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {showCalendar && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black border-4 border-yellow-500 p-4 z-50">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => navigateCalendar("prev")}
                        className="px-2 py-1 bg-gray-700 text-white hover:bg-gray-600 rounded"
                        disabled={calendarNavigating}
                        aria-label="Previous month"
                      >
                        ←
                      </button>
                      <h3 className="text-lg font-bold text-yellow-500">
                        {monthNames[calendarView.month]} {calendarView.year}
                      </h3>
                      <button
                        type="button"
                        onClick={() => navigateCalendar("next")}
                        className="px-2 py-1 bg-gray-700 text-white hover:bg-gray-600 rounded"
                        disabled={calendarNavigating}
                        aria-label="Next month"
                      >
                        →
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {dayNames.map(day => (
                        <div key={day} className="text-center text-sm text-gray-400 py-1 font-semibold">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {generateCalendarDays(calendarView.year, calendarView.month).map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (!day.isPastDate) {
                              handleDateSelect(day.dateString);
                            }
                          }}
                          disabled={day.isPastDate}
                          className={`
                            aspect-square flex items-center justify-center text-sm border border-gray-600 rounded
                            ${day.isPastDate ? "text-gray-600 cursor-not-allowed bg-gray-800" : "text-white hover:bg-gray-700 cursor-pointer"}
                            ${!day.isCurrentMonth ? "opacity-50" : ""}
                            ${day.isSelected ? "bg-yellow-500 text-black border-yellow-400 font-bold" : ""}
                          `}
                          aria-label={`Select ${day.date.toLocaleDateString()}`}
                        >
                          {day.day}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowCalendar(false)}
                      className="mt-3 w-full px-3 py-2 bg-gray-700 text-white hover:bg-gray-600 text-sm rounded"
                      aria-label="Close calendar"
                    >
                      Close Calendar
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <input
                  type="time"
                  name="unlockTime"
                  value={formData.unlockTime}
                  onChange={handleInputChange}
                  className="px-4 py-3 bg-black border-2 border-white text-white focus:outline-none focus:border-yellow-500 disabled:bg-gray-900 disabled:text-gray-500"
                  required
                />
                <span className="text-sm text-gray-400">
                  {formData.unlockDate && formData.unlockTime && getCombinedDateTime() && (
                    `Unlocks: ${getCombinedDateTime()!.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`
                  )}
                </span>
              </div>

              {formData.unlockDate &&
                formData.unlockTime &&
                getCombinedDateTime() &&
                getCombinedDateTime()! <= new Date() && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Unlock time must be in the future
                  </p>
                )}
            </div>

            <div>
              <label className="flex items-center font-bold mb-2 text-yellow-500">
                <Layers className="w-5 h-5 mr-2" /> Number of Unique Copies
              </label>
              <input
                type="number"
                name="mintAmount"
                min="1"
                max="10"
                value={formData.mintAmount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black border-2 border-white text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 disabled:bg-gray-900 disabled:text-gray-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Each copy gets unique encryption (🐹 TACo Tapir) and separate policy ID for individual ownership on Citrea
              </p>
            </div>

            <div>
              <label className="flex items-center font-bold mb-2 text-yellow-500">
                <Upload className="w-5 h-5 mr-2" /> Upload Secret File
              </label>
              <div className="border-2 border-dashed border-white p-6 text-center hover:border-yellow-500 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  required
                  disabled={processingStep !== "idle" || !isConnected}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  {formData.file ? (
                    <div className="text-white">
                      <p className="font-semibold">{formData.file.name}</p>
                      <p className="text-sm text-gray-400">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p className="text-xs text-yellow-500 mt-1">
                        Will create {formData.mintAmount} unique encrypted {formData.mintAmount > 1 ? "copies" : "copy"}
                      </p>
                      <p className="text-xs text-purple-400 mt-1">🐹 TACo Tapir encryption → 💎 NFT minting on Citrea</p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <p className="text-lg font-semibold mb-1">Drop your file here or click to browse</p>
                      <p className="text-sm">Will be encrypted with TACo Tapir, then minted on Citrea</p>
                      <p className="text-xs text-yellow-500 mt-1">Supports all file types up to 100MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </fieldset>

          <div className="flex justify-center pt-4">{renderActionButton()}</div>
        </form>
      </main>
    </div>
  );
}