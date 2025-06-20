"use client";

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const Navigation = () => {
  const { isLoggedIn, user, logout } = useAuthStore();
  const { setTheme } = useTheme();

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="font-bold">
              ERP-MAS
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                Dashboard
              </Link>
              <Link href="/sales" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                Sales
              </Link>
              <Link href="/inventory" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                Inventory
              </Link>
              <Link href="/hr" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                HR
              </Link>
              <Link href="/finance" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                Finance
              </Link>
              <Link href="/projects" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                Projects
              </Link>
              <Link href="/analytics" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                Analytics
              </Link>
              <Link href="/settings" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                Settings
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="mr-2">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {isLoggedIn ? (
                <>
                  <span className="mr-4">Welcome, {user?.name}</span>
                  <button onClick={logout} className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
                    Sign In
                  </Link>
                  <Link href="/register" className="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-indigo-500 hover:bg-indigo-600">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 