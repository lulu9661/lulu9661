'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/brainstorm', label: 'Brainstorm' },
  { href: '/select', label: 'Select Goals' },
  { href: '/habits', label: 'Habits' },
  { href: '/check-in', label: 'Check-In' },
  { href: '/settings', label: 'Settings' }
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-1">
            <Link
              href="/"
              className="text-xl font-light tracking-wide text-neutral-900 mr-8"
            >
              Quarterly Goals
            </Link>
            <div className="hidden md:flex space-x-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-light tracking-wide transition-colors rounded-md",
                    pathname === item.href
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-3 flex overflow-x-auto space-x-2">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 text-sm font-light tracking-wide transition-colors rounded-md whitespace-nowrap",
                pathname === item.href
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
