"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="glass sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          ListingShield
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-700 hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className="text-sm font-medium text-slate-700 hover:text-primary transition-colors"
            >
              Upload
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-colors shadow-md"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-full hover:bg-primary-hover transition-colors shadow-md"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
