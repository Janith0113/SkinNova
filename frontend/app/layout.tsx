import "../styles/globals.css";
import { ReactNode } from "react";
import ClientWrapper from "../components/LayoutClientWrapper";

export const metadata = {
  title: "SkinNova",
  description: "Starter Next.js + TypeScript + Tailwind project",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
