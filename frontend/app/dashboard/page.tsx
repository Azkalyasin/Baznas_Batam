'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const quickLinks = [
    {
      title: 'Pelayanan',
      description: 'Kelola data Mustahiq (Penerima Zakat)',
      icon: '👥',
      href: '/pelayanan',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'Muzakki',
      description: 'Kelola data Muzakki (Pemberi Zakat)',
      icon: '💰',
      href: '/muzakki',
      color: 'bg-green-50 border-green-200',
    },
    {
      title: 'Distribusi',
      description: 'Catat Distribusi Dana Zakat',
      icon: '📦',
      href: '/distribusi',
      color: 'bg-orange-50 border-orange-200',
    },
    {
      title: 'Pengumpulan',
      description: 'Catat Pengumpulan Dana Zakat',
      icon: '💵',
      href: '/pengumpulan',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      title: 'Migrasi Excel',
      description: 'Import data dari file Excel',
      icon: '📁',
      href: '/migrasi-excel',
      color: 'bg-cyan-50 border-cyan-200',
    },
    {
      title: 'Laporan',
      description: 'Buat laporan dan export ke Word',
      icon: '📄',
      href: '/laporan',
      color: 'bg-yellow-50 border-yellow-200',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-balance">Selamat Datang di BAZNAS Batam</h1>
          <p className="text-muted-foreground mt-2">
            Sistem Manajemen Dana Zakat, Infaq, dan Sedekah
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-2 ${link.color}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl">{link.icon}</div>
                  </div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    Buka
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Sistem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Sistem ini digunakan untuk mengelola data Mustahiq dan Muzakki</p>
            <p>• Pencatatan Distribusi dan Pengumpulan dana Zakat, Infaq, dan Sedekah</p>
            <p>• Fitur Import/Export untuk migrasi data dengan Excel</p>
            <p>• Laporan komprehensif dengan export ke format Word</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
