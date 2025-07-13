"use client"

import "@rainbow-me/rainbowkit/styles.css"
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {  citreaTestnet } from "wagmi/chains"

const queryClient = new QueryClient()

const NEXT_PUBLIC_PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID ?? "";
const config = getDefaultConfig({
  appName: "CapsuleX",
  projectId: NEXT_PUBLIC_PROJECT_ID, // or use WalletConnect's real project ID if you want custom branding
  chains: [citreaTestnet], // ✅ switch to Citrea chain ID once it's deployed/testnet
  ssr: true,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#ecc94b", // yellow
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
