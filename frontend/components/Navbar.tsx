"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (raw) setUser(JSON.parse(raw));
  }, []);

  function goToDashboard(e: any) {
    e.preventDefault();
    const role = user?.role;
    if (role === "admin") router.push("/admin/dashboard");
    else if (role === "doctor") router.push("/doctor/dashboard");
    else router.push("/patient/dashboard");
    setIsOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
    setIsOpen(false);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-xl border-b border-white/20 shadow-lg">
      <div className="bg-gradient-to-r from-white/40 to-white/30">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                SkinNova
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all duration-300"
              >
                Home
              </Link>
              <Link
                href="/aboutus"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all duration-300"
              >
                About Us
              </Link>
              <Link
                href="/contactus"
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>

            {/* Right side actions */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <button
                    onClick={goToDashboard}
                    className="px-4 py-2 rounded-lg bg-white/40 text-gray-900 font-medium hover:bg-white/60 transition-all"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:shadow-lg transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:shadow-lg transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-all"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden mt-4 space-y-2 pb-4">
              <Link
                href="/"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all"
              >
                Home
              </Link>
              <Link
                href="/aboutus"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all"
              >
                About Us
              </Link>
              <Link
                href="/contactus"
                className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all"
              >
                Contact Us
              </Link>
              
              <div className="border-t border-white/20 pt-2 mt-2 space-y-2">
                {user ? (
                  <>
                    <button
                      onClick={goToDashboard}
                      className="w-full px-4 py-2 rounded-lg bg-white/40 text-gray-900 font-medium hover:bg-white/60 transition-all text-left"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:shadow-lg transition-all text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-white/50 font-medium transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:shadow-lg transition-all"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
