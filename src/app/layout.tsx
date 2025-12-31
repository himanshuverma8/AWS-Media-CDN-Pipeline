import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CDN Control Panel - hv6.dev",
  description: "Manage your custom CDN files and images with ease",
  icons: {
    icon: [
      {
        url: "https://cdn.hv6.dev/images/logos/lighting_thunderbolt_red.jpg_circular.png?height=100&width=100",
        sizes: "32x32",
        type: "image/jpeg",
      },
      {
        url: "https://cdn.hv6.dev/images/logos/lighting_thunderbolt_red.jpg_circular.png?height=100&width=100",
        sizes: "16x16",
        type: "image/jpeg",
      },
    ],
    shortcut: "https://cdn.hv6.dev/images/logos/lighting_thunderbolt_red.jpg_circular.png?height=100&width=100",
    apple: [
      {
        url: "https://cdn.hv6.dev/images/logos/lighting_thunderbolt_red.jpg_circular.png?height=100&width=100",
        sizes: "180x180",
        type: "image/jpeg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
