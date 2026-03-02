"use client";

import Link from "next/link";
import { useState } from "react";

export default function Footer() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const videos = [
    {
      id: 1,
      title: "AI Generation",
      source: "/videos/Video_Generation_and_Feedback.mp4",
      icon: "🤖"
    },
    {
      id: 2,
      title: "App Flow",
      source: "/videos/Flow_delpmaspu_.mp4",
      icon: "📱"
    }
  ];

  return (
    <footer className="mt-10">
      {/* Video Gallery Section */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => setSelectedVideo(video.source)}
              className="group relative overflow-hidden rounded-2xl cursor-pointer"
            >
              {/* Video Preview */}
              <video
                src={video.source}
                className="w-full h-40 object-cover rounded-2xl hover:scale-105 transition-transform duration-300"
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
                muted
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 text-white px-6 sm:px-8 py-6 sm:py-7 shadow-lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Left block */}
            <div className="flex items-center gap-4">
              
              <div>
               <img 
                src="/images/SKÍNOVA_Logo_Variation_4-removebg-preview (1).png" 
                alt="skinova Logo"
                className="h-12 w-auto object-contain"
              />
                <p className="mt-1 text-xs sm:text-sm text-gray-200 max-w-md">
                  AI‑assisted guidance for understanding your skin. Always double‑check important decisions with a qualified healthcare professional.
                </p>
              </div>
            </div>

            {/* Center links */}
            <div className="flex flex-wrap gap-4 text-xs sm:text-sm font-medium text-gray-100">
              <Link href="/aboutus" className="hover:text-emerald-300 transition-colors">
                About
              </Link>
              <Link href="/contactus" className="hover:text-emerald-300 transition-colors">
                Contact
              </Link>
              <Link href="/privacy" className="hover:text-emerald-300 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-emerald-300 transition-colors">
                Terms
              </Link>
            </div>

            {/* Right small status */}
            <div className="flex flex-col items-start sm:items-end gap-2 text-[11px] text-gray-200">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>System status: Online</span>
              </span>
              <span className="text-[10px] text-gray-300">
                © {new Date().getFullYear()} skinova. For educational use only.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-900 hover:text-red-600 transition-all"
            >
              ✕
            </button>
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full h-auto max-h-[80vh] object-cover"
            />
          </div>
        </div>
      )}
    </footer>
  );
}
