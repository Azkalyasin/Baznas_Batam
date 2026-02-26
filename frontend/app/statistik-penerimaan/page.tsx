'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dashboardApi } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowUpRight, Loader2, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const MONTHS = [
  { val: 'all', label: 'Semua Bulan' },
  { val: 'Januari', label: 'Januari' },
  { val: 'Februari', label: 'Februari' },
  { val: 'Maret', label: 'Maret' },
  { val: 'April', label: 'April' },
  { val: 'Mei', label: 'Mei' },
  { val: 'Juni', label: 'Juni' },
  { val: 'Juli', label: 'Juli' },
  { val: 'Agustus', label: 'Agustus' },
  { val: 'September', label: 'September' },
  { val: 'Oktober', label: 'Oktober' },
  { val: 'November', label: 'November' },
  { val: 'Desember', label: 'Desember' },
];

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#0ea5e9', '#f43f5e'];

export default function ReceiptStatisticsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const years = Array.from({ length: currentYear - 2020 + 1 }, (_, i) => (currentYear - i).toString());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { tahun: parseInt(selectedYear) };
      if (selectedMonth !== 'all') params.bulan = selectedMonth;

      const res = await dashboardApi.getUtama(params);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat data statistik');
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

  const renderStatsChart = (stats: any[], title: string) => {
    if (!stats || stats.length === 0) {
      return (
        <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground bg-muted/5 rounded-xl border-2 border-dashed">
          <PieChartIcon className="h-10 w-10 mb-2 opacity-20" />
          <p className="italic text-sm">Tidak ada data {title} untuk periode ini</p>
        </div>
      );
    }

    return (
      <div className="h-[450px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={stats}
              cx="50%"
              cy="45%"
              labelLine={true}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={120}
              innerRadius={60}
              paddingAngle={5}
              dataKey="total"
              nameKey="category"
            >
              {stats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any) => formatCurrency(Number(value))}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Statistik Penerimaan
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">Analisis mendalam penerimaan dana ZIS berdasarkan berbagai kategori.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground">Bulan:</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[160px] font-medium border-muted-foreground/20">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map(m => (
                    <SelectItem key={m.val} value={m.val}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground">Tahun:</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px] font-medium border-muted-foreground/20">
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
        </div>

        {/* Summary for Selected Period */}
        <Card className="bg-primary text-primary-foreground shadow-lg border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <CardContent className="p-8 relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-primary-foreground/80 font-medium mb-1">Total Penerimaan Dana</p>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  {loading ? <Loader2 className="h-10 w-10 animate-spin" /> : formatCurrency(data?.overview?.total_penerimaan || 0)}
                </h2>
                <div className="flex items-center gap-2 mt-4 bg-white/10 w-fit px-3 py-1 rounded-full text-sm font-medium">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Periode {selectedMonth === 'all' ? selectedYear : `${selectedMonth} ${selectedYear}`}</span>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                  <BarChart3 className="h-16 w-16 opacity-50" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Breakdown Tabs */}
        <Card className="shadow-xl border-none ring-1 ring-border">
          <CardHeader className="border-b bg-muted/5 pb-0">
            <Tabs defaultValue="muzakki" className="w-full">
              <TabsList className="flex w-full overflow-x-auto bg-transparent border-none gap-2 p-1 no-scrollbar justify-start">
                <TabsTrigger value="muzakki" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 rounded-full font-bold transition-all">Jenis Muzakki</TabsTrigger>
                <TabsTrigger value="zakat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 rounded-full font-bold transition-all">Sub-Zakat</TabsTrigger>
                <TabsTrigger value="infak" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 rounded-full font-bold transition-all">Sub-Infak</TabsTrigger>
                <TabsTrigger value="via" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 rounded-full font-bold transition-all">Via</TabsTrigger>
                <TabsTrigger value="upz" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 rounded-full font-bold transition-all">Jenis UPZ</TabsTrigger>
              </TabsList>

              <div className="pt-8 pb-6 px-4 md:px-6">
                <TabsContent value="muzakki" className="mt-0 focus-visible:outline-none">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-primary">Berdasarkan Jenis Muzakki</h3>
                    <p className="text-sm text-muted-foreground mt-1">Proporsi penerimaan dari Individu, Entitas, maupun UPZ</p>
                  </div>
                  {loading ? (
                    <div className="h-[400px] flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>
                  ) : renderStatsChart(data?.details?.by_jenis_muzakki, 'Jenis Muzakki')}
                </TabsContent>

                <TabsContent value="zakat" className="mt-0 focus-visible:outline-none">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-primary">Detail Jenis Zakat</h3>
                    <p className="text-sm text-muted-foreground mt-1">Rincian penerimaan berdasarkan sub-kategori Zakat</p>
                  </div>
                  {loading ? (
                    <div className="h-[400px] flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>
                  ) : renderStatsChart(data?.details?.by_jenis_zakat, 'Jenis Zakat')}
                </TabsContent>

                <TabsContent value="infak" className="mt-0 focus-visible:outline-none">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-primary">Detail Jenis Infak/Sedekah</h3>
                    <p className="text-sm text-muted-foreground mt-1">Rincian penerimaan berdasarkan sub-kategori Infak</p>
                  </div>
                  {loading ? (
                    <div className="h-[400px] flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>
                  ) : renderStatsChart(data?.details?.by_jenis_infak, 'Jenis Infak')}
                </TabsContent>

                <TabsContent value="via" className="mt-0 focus-visible:outline-none">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-primary">Jalur Penerimaan</h3>
                    <p className="text-sm text-muted-foreground mt-1">Perbandingan penerimaan melalui Cash, Transfer, maupun Digital</p>
                  </div>
                  {loading ? (
                    <div className="h-[400px] flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>
                  ) : renderStatsChart(data?.details?.by_via, 'Via Penerimaan')}
                </TabsContent>

                <TabsContent value="upz" className="mt-0 focus-visible:outline-none">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-primary">Distribusi Jenis UPZ</h3>
                    <p className="text-sm text-muted-foreground mt-1">Proporsi penerimaan berdasarkan jenis Unit Pengumpul Zakat</p>
                  </div>
                  {loading ? (
                    <div className="h-[400px] flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" /></div>
                  ) : renderStatsChart(data?.details?.by_jenis_upz, 'Jenis UPZ')}
                </TabsContent>
              </div>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </DashboardLayout>
  );
}
