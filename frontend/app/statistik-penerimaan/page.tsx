'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { dashboardApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, TrendingUp, BarChart3, PieChart, RefreshCw } from 'lucide-react';

// ── Helper format angka ──
const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const fmtNum = (n: number) => new Intl.NumberFormat('id-ID').format(n);

// ── Bar mini horizontal ──
function MiniBar({ value, max, color = 'bg-primary' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Kartu ringkasan ──
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-1 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold truncate">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ── Filter tahun/bulan ──
const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 4 }, (_, i) => currentYear - i);

export default function StatistikPenerimaanPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [tahun, setTahun] = useState(currentYear);
  const [bulan, setBulan] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<any>(null);
  const [byUpz, setByUpz] = useState<any[]>([]);
  const [byChannel, setByChannel] = useState<any[]>([]);
  const [zakatBreakdown, setZakatBreakdown] = useState<any[]>([]);
  const [infaqBreakdown, setInfaqBreakdown] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const params = { tahun, ...(bulan !== '' ? { bulan: Number(bulan) } : {}) };
    try {
      const [sumRes, upzRes, channelRes, zakatRes, infaqRes] = await Promise.all([
        dashboardApi.getSummary(params),
        dashboardApi.getByUpz(params),
        dashboardApi.getByChannel(params),
        dashboardApi.getZakatBreakdown(params),
        dashboardApi.getInfaqBreakdown(params),
      ]);
      setSummary(sumRes.data ?? sumRes);
      setByUpz(Array.isArray(upzRes.data) ? upzRes.data : Array.isArray(upzRes) ? upzRes : []);
      setByChannel(Array.isArray(channelRes.data) ? channelRes.data : Array.isArray(channelRes) ? channelRes : []);
      setZakatBreakdown(Array.isArray(zakatRes.data) ? zakatRes.data : Array.isArray(zakatRes) ? zakatRes : []);
      setInfaqBreakdown(Array.isArray(infaqRes.data) ? infaqRes.data : Array.isArray(infaqRes) ? infaqRes : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat statistik');
    } finally {
      setIsLoading(false);
    }
  }, [tahun, bulan]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Hitung max untuk bar
  const maxUpz = Math.max(...byUpz.map((u) => u.total ?? u.jumlah ?? 0), 1);
  const maxChannel = Math.max(...byChannel.map((c) => c.total ?? c.jumlah ?? 0), 1);
  const maxZakat = Math.max(...zakatBreakdown.map((z) => z.total ?? z.jumlah ?? 0), 1);
  const maxInfaq = Math.max(...infaqBreakdown.map((i) => i.total ?? i.jumlah ?? 0), 1);

  const COLORS = ['bg-green-500','bg-blue-500','bg-yellow-500','bg-purple-500','bg-red-400','bg-teal-500','bg-orange-400'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Statistik Penerimaan</h1>
            <p className="text-muted-foreground mt-1">Analisis data pengumpulan dana ZIS</p>
          </div>
          {/* Filter */}
          <div className="flex gap-2 items-center">
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={bulan}
              onChange={(e) => setBulan(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">Semua Bulan</option>
              {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <button
              onClick={loadAll}
              className="h-9 w-9 rounded-md border flex items-center justify-center hover:bg-muted"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* ── SUMMARY ── */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="Total Penerimaan"
                  value={fmt(summary.total_penerimaan ?? summary.total ?? 0)}
                  sub={`${fmtNum(summary.jumlah_transaksi ?? summary.count ?? 0)} transaksi`}
                />
                <StatCard
                  label="Total Zakat"
                  value={fmt(summary.total_zakat ?? 0)}
                />
                <StatCard
                  label="Total Infaq / Sedekah"
                  value={fmt((summary.total_infaq ?? 0) + (summary.total_sedekah ?? 0))}
                />
                <StatCard
                  label="Rata-rata / Transaksi"
                  value={fmt(
                    (summary.total_penerimaan ?? summary.total ?? 0) /
                    Math.max(summary.jumlah_transaksi ?? summary.count ?? 1, 1)
                  )}
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* ── BY UPZ ── */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4 text-primary" /> Penerimaan per UPZ
                  </CardTitle>
                  <CardDescription>Distribusi berdasarkan unit pengumpul zakat</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {byUpz.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Tidak ada data</p>
                  ) : byUpz.map((u, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate max-w-[60%]">{u.nama_upz ?? u.upz ?? u.nama ?? u.jenis_upz ?? '-'}</span>
                        <span className="font-medium text-right">{fmt(u.total ?? u.jumlah ?? 0)}</span>
                      </div>
                      <MiniBar value={u.total ?? u.jumlah ?? 0} max={maxUpz} color={COLORS[i % COLORS.length]} />
                      <p className="text-xs text-muted-foreground">{fmtNum(u.count ?? u.jumlah_transaksi ?? 0)} transaksi</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* ── BY CHANNEL ── */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-blue-500" /> Penerimaan per Channel
                  </CardTitle>
                  <CardDescription>Distribusi berdasarkan metode / saluran pembayaran</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {byChannel.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Tidak ada data</p>
                  ) : byChannel.map((c, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate max-w-[60%]">{c.channel ?? c.via ?? c.nama ?? c.metode ?? '-'}</span>
                        <span className="font-medium text-right">{fmt(c.total ?? c.jumlah ?? 0)}</span>
                      </div>
                      <MiniBar value={c.total ?? c.jumlah ?? 0} max={maxChannel} color={COLORS[(i + 2) % COLORS.length]} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* ── ZAKAT BREAKDOWN ── */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PieChart className="h-4 w-4 text-green-600" /> Rincian Zakat
                  </CardTitle>
                  <CardDescription>Breakdown penerimaan per jenis zakat</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {zakatBreakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Tidak ada data</p>
                  ) : zakatBreakdown.map((z, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate max-w-[60%]">{z.jenis_zakat ?? z.nama ?? z.kategori ?? '-'}</span>
                        <span className="font-medium text-right">{fmt(z.total ?? z.jumlah ?? 0)}</span>
                      </div>
                      <MiniBar value={z.total ?? z.jumlah ?? 0} max={maxZakat} color="bg-green-500" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* ── INFAQ BREAKDOWN ── */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PieChart className="h-4 w-4 text-yellow-500" /> Rincian Infaq & Sedekah
                  </CardTitle>
                  <CardDescription>Breakdown penerimaan infaq dan sedekah</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {infaqBreakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Tidak ada data</p>
                  ) : infaqBreakdown.map((inf, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="truncate max-w-[60%]">{inf.jenis ?? inf.nama ?? inf.kategori ?? '-'}</span>
                        <span className="font-medium text-right">{fmt(inf.total ?? inf.jumlah ?? 0)}</span>
                      </div>
                      <MiniBar value={inf.total ?? inf.jumlah ?? 0} max={maxInfaq} color="bg-yellow-500" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
