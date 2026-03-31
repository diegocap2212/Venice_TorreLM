import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/components/providers/role-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

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
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <RoleProvider>
            <div className="h-screen w-screen overflow-hidden">
              {children}
            </div>
          </RoleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
