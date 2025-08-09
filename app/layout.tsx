import type { Metadata } from "next";
import { Toaster } from 'sonner'; // <-- Import Toaster
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "CapsuleX",
  description: "Time-locked NFT capsules for your secrets and assets.", // A more descriptive tag
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        
        {/* --- ADDED THIS SECTION --- */}
        {/* This component will render all the toast notifications */}
        <Toaster 
          position="bottom-right" 
          richColors 
          theme="dark"
          toastOptions={{
            style: {
              background: '#1a1a1a', // A dark, near-black background
              border: '2px solid #f59e0b', // Your brand's yellow color
              color: '#ffffff',
            },
          }}
        />
        {/* ------------------------- */}
      </body>
    </html>
  )
}