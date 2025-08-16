"use client"

import "@rainbow-me/rainbowkit/styles.css"
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { polygonMumbai } from "wagmi/chains";
import { defineChain } from 'viem'

const queryClient = new QueryClient();

export const citreaTestnet = defineChain({
  id: 5115,
  name: 'Citrea Testnet',
  network: 'citrea-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Citrea Bitcoin',
    symbol: 'cBTC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.citrea.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Citrea Explorer',
      url: 'https://explorer.testnet.citrea.xyz',
    },
  },
  testnet: true,
})

const NEXT_PUBLIC_PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? "";

const config = getDefaultConfig({
  appName: "CapsuleX",
  projectId: NEXT_PUBLIC_PROJECT_ID,
  chains: [citreaTestnet, polygonMumbai],
  ssr: true,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#ecc94b",
            accentColorForeground: "black",
            borderRadius: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
