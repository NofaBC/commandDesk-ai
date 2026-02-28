'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Settings,
  Mail,
  Activity,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/activity', label: 'Activity', icon: Activity },
  { href: '/dashboard/emails', label: 'Emails', icon: Mail },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow border-r bg-white pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">CommandDesk</h1>
              <p className="text-xs text-gray-500">AI Command Center</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-4 border-t">
          <p className="text-xs text-gray-400">NOFA AI Factory</p>
          <p className="text-xs text-gray-400">CommandDesk AI™ v0.1.0</p>
        </div>
      </div>
    </aside>
  );
}
