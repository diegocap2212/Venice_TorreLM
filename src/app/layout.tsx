import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/components/providers/role-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Venice | Pipeline de Talentos LM",
  description: "Fonte única de verdade para o pipeline R&S e Onboarding",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 antialiased`}>
        <RoleProvider>
          <div className="flex h-screen overflow-hidden">
            <Suspense fallback={<div className="w-72 bg-slate-100 animate-pulse" />}>
              <Sidebar />
            </Suspense>
            <div className="flex flex-col flex-1 overflow-hidden">
              <Suspense fallback={<div className="h-20 bg-slate-50 animate-pulse" />}>
                <Topbar />
              </Suspense>
              <main className="flex-1 overflow-auto bg-slate-50/50">
                {children}
              </main>
            </div>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
