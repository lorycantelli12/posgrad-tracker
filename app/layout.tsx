import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OneSignalProvider } from "@/components/posgrad/onesignal-provider";
import { PostHogProvider } from "@/components/posgrad/posthog-provider";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PosGrad Tracker — Encontre seu programa de pós-graduação",
  description:
    "Monitore editais de mestrado e doutorado no Brasil. Cadastre suas preferências e seja notificado quando o edital certo abrir.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <PostHogProvider>
          <OneSignalProvider>{children}</OneSignalProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
