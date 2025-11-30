import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";

import { Toaster } from "@/components/ui/sonner";
import ReduxProvider from "@/providers/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Manager",
  description:
    "A simple task management application built with Next.js and TypeScript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}  min-h-screen max-w-[100vw] antialiased font-normal overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        <ReduxProvider>
          <ThemeProvider>
            {children}

            <Toaster position="top-right" className="z-1000000000" richColors />
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
