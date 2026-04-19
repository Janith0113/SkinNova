"use client";

import { ReactNode } from "react";

export default function RiskAnalysisLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {children}
    </div>
  );
}
