'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, ChevronDown, ChevronRight } from 'lucide-react';

interface NavChild {
  href: string;
  label: string;
  icon: string;
}

interface NavItem {
  href?: string;
  label: string;
  icon: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  {
    label: 'Pengumpulan',
    icon: '💵',
    children: [
      { href: '/pengumpulan', label: 'Daftar Penerimaan', icon: '📋' },
      { href: '/statistik-penerimaan', label: 'Statistik', icon: '📈' },
    ],
  },
  { href: '/muzakki', label: 'Muzakki', icon: '🧑‍💼' },
  { href: '/pelayanan', label: 'Mustahiq', icon: '👥' },
  { href: '/distribusi', label: 'Distribusi', icon: '📦' },
  { href: '/migrasi-excel', label: 'Migrasi Excel', icon: '📁' },
  { href: '/laporan', label: 'Laporan', icon: '📄' },
];

function NavGroup({ item, pathname }: { item: NavItem; pathname: string }) {
  const isChildActive = item.children?.some((c) => pathname.startsWith(c.href)) ?? false;
  const [open, setOpen] = useState(isChildActive);

  if (item.href) {
    // Simple link
    const active = pathname === item.href || pathname.startsWith(item.href + '/');
    return (
      <li>
        <Link
          href={item.href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active
            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
            : 'hover:bg-sidebar-primary hover:text-sidebar-primary-foreground'
            }`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      </li>
    );
  }

  // Group with children (dropdown)
  return (
    <li>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isChildActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'hover:bg-sidebar-primary hover:text-sidebar-primary-foreground'
          }`}
      >
        <span>{item.icon}</span>
        <span className="flex-1 text-left">{item.label}</span>
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {open && (
        <ul className="mt-1 ml-4 space-y-1 border-l border-sidebar-border pl-3">
          {item.children?.map((child) => {
            const active = pathname === child.href || pathname.startsWith(child.href + '/');
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                    : 'hover:bg-sidebar-primary hover:text-sidebar-primary-foreground'
                    }`}
                >
                  <span className="text-xs">{child.icon}</span>
                  <span>{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-primary text-primary-foreground shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold">BAZNAS</div>
            <div className="hidden text-sm md:block">
              Sistem Manajemen Dana Zakat Batam
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{user?.nama}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <nav className="hidden w-64 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground md:block">
          <div className="p-4">
            <div className="text-sm font-semibold text-sidebar-foreground mb-4">Menu Utama</div>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <NavGroup key={item.href ?? item.label} item={item} pathname={pathname} />
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
