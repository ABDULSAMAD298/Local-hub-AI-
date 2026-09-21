import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LocalHub AI — WhatsApp Business Automation",
  description:
    "Automate customer conversations, send property/product media, and follow up automatically with an AI-powered WhatsApp agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", inter.variable, jetbrainsMono.variable)}>
      <body className="font-sans antialiased">
        <SupabaseProvider>
          <AuthProvider>{children}</AuthProvider>
        </SupabaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
