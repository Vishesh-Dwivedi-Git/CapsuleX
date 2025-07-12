"use client"

import "@rainbow-me/rainbowkit/styles.css"
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {  sepolia } from "wagmi/chains"

const queryClient = new QueryClient()

const config = getDefaultConfig({
  appName: "CapsuleX",
  projectId: "capsulex-connect", // or use WalletConnect's real project ID if you want custom branding
  chains: [sepolia], // ✅ switch to Citrea chain ID once it's deployed/testnet
  ssr: true,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#FACC15", // yellow
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
