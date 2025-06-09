"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentType, SVGProps } from 'react'
import { 
  HomeIcon, 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  CubeIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Finance', href: '/finance', icon: CurrencyDollarIcon },
  { name: 'Sales', href: '/sales', icon: ShoppingCartIcon },
  { name: 'Inventory', href: '/inventory', icon: CubeIcon },
  { name: 'Projects', href: '/projects', icon: ClipboardDocumentListIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'HR', href: '/hr', icon: UserGroupIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">ERP System</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">
              Profile
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
} 