"use client";
import "../styles/globals.css";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/footer";

export const metadata = {
  title: "skinova",
  description: "Starter Next.js + TypeScript + Tailwind project",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const hideNavbar = pathname === "/login" || pathname === "/signup";

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {!hideNavbar && <Navbar />}
        <main className="flex-1">{children}</main>
        {!hideNavbar && <Footer />}
      </body>
    </html>
  );
}
