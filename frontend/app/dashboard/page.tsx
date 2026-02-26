'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dashboardApi } from '@/lib/api';
import { toast } from 'sonner';
import { Users, UserCheck, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Generate years from current back to 2020
  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => (currentYear - i).toString());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getUtama({ tahun: parseInt(selectedYear) });
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-balance">Selamat Datang di BAZNAS Batam</h1>
            <p className="text-muted-foreground mt-2">
              Sistem Manajemen Dana Zakat, Infaq, dan Sedekah
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter Tahun:</span>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Muzakki</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{data?.overview?.total_muzakki || 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Aktif & terdaftar tahun {selectedYear}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mustahiq</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{data?.overview?.total_mustahiq || 0}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Aktif & terdaftar tahun {selectedYear}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Penerimaan</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{formatCurrency(data?.overview?.total_penerimaan || 0)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Dana diterima periode {selectedYear}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Disalurkan</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{formatCurrency(data?.overview?.total_distribusi || 0)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Dana disalurkan periode {selectedYear}
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-balance">Menu Utama</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Penerimaan', desc: 'Catat Penerimaan ZIS', icon: '💵', href: '/pengumpulan', color: 'bg-emerald-50 border-emerald-200' },
              { title: 'Distribusi', desc: 'Catat Distribusi Dana', icon: '📦', href: '/distribusi', color: 'bg-orange-50 border-orange-200' },
              { title: 'Muzakki', desc: 'Kelola data Pemberi Zakat', icon: '💰', href: '/muzakki', color: 'bg-blue-50 border-blue-200' },
              { title: 'Mustahiq', desc: 'Kelola data Penerima Zakat', icon: '👥', href: '/pelayanan', color: 'bg-indigo-50 border-indigo-200' },
              { title: 'Laporan', desc: 'Generate laporan data', icon: '📄', href: '/laporan', color: 'bg-yellow-50 border-yellow-200' },
              { title: 'Migrasi', desc: 'Import data dari Excel', icon: '📁', href: '/migrasi-excel', color: 'bg-slate-50 border-slate-200' },
            ].map((link) => (
              <Link key={link.href} href={link.href}>
                <Card className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 border-2 ${link.color}`}>
                  <CardHeader className="pb-3 flex flex-row items-center gap-4">
                    <div className="text-3xl">{link.icon}</div>
                    <div>
                      <CardTitle className="text-base">{link.title}</CardTitle>
                      <CardDescription className="text-xs">{link.desc}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
