"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
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
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-wrap sm:justify-start sm:flex-nowrap w-full 
                       bg-white/20 backdrop-blur-xl text-sm py-3 border-b border-white/40 shadow-sm">
      <nav className="max-w-[85rem] w-full mx-auto px-4 sm:flex sm:items-center sm:justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="flex-none font-semibold text-xl text-gray-900 drop-shadow-sm focus:outline-none focus:opacity-80"
          aria-label="SkinNova"
        >
          SkinNova
        </Link>

        {/* Right side links */}
        <div className="flex flex-row items-center gap-5 mt-3 sm:justify-end sm:mt-0 sm:ps-5">
          <Link href="/" className="font-medium text-gray-900 hover:text-gray-700 drop-shadow-sm">
            Home
          </Link>
          <Link href="/aboutus" className="font-medium text-gray-900 hover:text-gray-700 drop-shadow-sm">
            About Us
          </Link>
          <Link href="/contactus" className="font-medium text-gray-900 hover:text-gray-700 drop-shadow-sm">
            Contact Us
          </Link>

          {user ? (
            <>
              <button
                onClick={goToDashboard}
                className="font-medium text-gray-900 hover:text-gray-700 drop-shadow-sm"
              >
                Dashboard
              </button>
              <Link href="/chat" className="font-medium text-gray-900 hover:text-gray-700 drop-shadow-sm">
                Messages
              </Link>
              <button
                onClick={handleLogout}
                className="font-medium text-gray-900 hover:text-gray-700 drop-shadow-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-medium text-gray-900 hover:text-gray-700 drop-shadow-sm"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="font-medium text-gray-900 hover:text-gray-700 drop-shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
