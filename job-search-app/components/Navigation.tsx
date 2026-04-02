'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Jobs' },
  { href: '/tracking', label: 'Tracking' },
  { href: '/settings', label: 'Settings' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-neutral-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-sm font-light tracking-widest uppercase text-neutral-900">
            Job Search
          </Link>
          <div className="flex space-x-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 text-xs tracking-wider uppercase transition-colors rounded',
                  pathname === item.href
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
