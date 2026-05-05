"use client";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Navbar from "./Navbar";
import Footer from "./footer";

export default function LayoutClientWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const hideNavbar = pathname === "/login" || pathname === "/signup";

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      {!hideNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideNavbar && <Footer />}
    </GoogleOAuthProvider>
  );
}
