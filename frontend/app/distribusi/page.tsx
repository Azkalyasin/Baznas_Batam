'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { distribusiApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle, Loader2, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { DistribusiForm } from '@/components/distribusi-form';

type StatusFilter = 'all' | 'pending' | 'diterima' | 'ditolak';

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  diterima: { label: 'Diterima', variant: 'default' },
  ditolak: { label: 'Ditolak', variant: 'destructive' },
};

export default function DistribusiPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const [searchInput, setSearchInput] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateField, setDateField] = useState<'tanggal' | 'tgl_masuk_permohonan'>('tanggal');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = { 
        page, 
        limit,
        dateField
      };
      if (searchQ) params.q = searchQ;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await distribusiApi.list(params);
      const resData: any = res;

      // Consistent data extraction
      const arr = resData.data ?? resData.rows ?? [];
      setTotal(resData.total ?? arr.length);
      setList(arr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data distribusi');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQ, statusFilter, dateField, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQ(searchInput);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus data distribusi ini?')) return;
    try {
      await distribusiApi.delete(id);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus data');
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingId(null);
    fetchData();
  };

  const filterButtons: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Menunggu Persetujuan' },
    { key: 'diterima', label: 'Diterima' },
    { key: 'ditolak', label: 'Ditolak' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header Area - Consolidated into a single row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Distribusi Dana</h1>
            <p className="text-muted-foreground text-sm">Kelola penyaluran dana kepada Mustahiq</p>
          </div>
          <Button onClick={() => { setEditingId(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Distribusi
          </Button>
        </div>

        {/* Filters Area - 2x2 Grid Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
          {/* Left Column (Search & Status) */}
          <div className="space-y-3 flex flex-col justify-between">
            {/* Top-Left: Search */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama / NRM / NIK..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Button type="submit" variant="default" size="sm" className="h-9 px-4">Cari</Button>
              {searchQ && (
                <Button type="button" variant="ghost" size="sm" className="h-9 px-2"
                  onClick={() => { setSearchInput(''); setSearchQ(''); setPage(1); }}>
                  Reset
                </Button>
              )}
            </form>

            {/* Bottom-Left: Status Filters */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-muted/20 border rounded-md">
              <span className="text-[10px] font-bold uppercase text-muted-foreground mr-2 border-r pr-2 border-muted-foreground/30">Status</span>
              <div className="flex gap-1 flex-wrap">
                {filterButtons.map((f) => (
                  <Button key={f.key} size="sm"
                    variant={statusFilter === f.key ? 'default' : 'ghost'}
                    className={`h-7 text-[10px] px-2.5 ${statusFilter === f.key ? 'shadow-sm' : 'hover:bg-muted'}`}
                    onClick={() => { setStatusFilter(f.key); setPage(1); }}>
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Date Filter - Spanning height of left column) */}
          <div className="flex flex-col justify-center p-3 border rounded-md bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Filter Tanggal</span>
              <div className="flex bg-muted p-0.5 rounded-sm">
                <button 
                  className={`px-3 py-0.5 text-[9px] font-medium rounded-sm transition-all ${dateField === 'tgl_masuk_permohonan' ? 'bg-background shadow-xs text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => { setDateField('tgl_masuk_permohonan'); setPage(1); }}
                >
                  Permohonan
                </button>
                <button 
                  className={`px-3 py-0.5 text-[9px] font-medium rounded-sm transition-all ${dateField === 'tanggal' ? 'bg-background shadow-xs text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => { setDateField('tanggal'); setPage(1); }}
                >
                  Distribusi
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 items-end">
              <div className="space-y-1">
                <span className="text-[9px] text-muted-foreground uppercase ml-1">Dari</span>
                <Input type="date" className="h-8 text-xs font-mono" 
                  value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
              </div>
              <div className="space-y-1 relative">
                <span className="text-[9px] text-muted-foreground uppercase ml-1">Sampai</span>
                <div className="flex items-center gap-1">
                  <Input type="date" className="h-8 text-xs font-mono flex-1" 
                    value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
                  {(startDate || endDate) && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" 
                      onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Daftar Distribusi</CardTitle>
                <CardDescription className="text-xs">
                  {searchQ ? `Hasil pencarian "${searchQ}" — ` : ''}
                  Total: {total} data
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : list.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                {searchQ ? `Tidak ada hasil untuk "${searchQ}"` : 'Belum ada data Distribusi'}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">NRM</TableHead>
                        <TableHead className="text-xs">Nama Mustahiq</TableHead>
                        <TableHead className="text-xs">{dateField === 'tgl_masuk_permohonan' ? 'Tgl. Permohonan' : 'Tgl. Distribusi'}</TableHead>
                        <TableHead className="text-xs">Program</TableHead>
                        <TableHead className="text-right text-xs">Jml. Penyaluran</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-right text-xs">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((d) => {
                        const mstq = d.Mustahiq || d.mustahiq;
                        const prog = d.NamaProgram || d.ref_nama_program || d.nama_program;
                        const statusInfo = d.status ? STATUS_BADGE[d.status] : null;
                        return (
                          <TableRow key={d.id}>
                            <TableCell className="font-mono text-[10px]">{mstq?.nrm || d.nrm || '-'}</TableCell>
                            <TableCell className="font-medium text-xs">{d.nama_mustahik || mstq?.nama || '-'}</TableCell>
                            <TableCell className="text-xs">
                              {dateField === 'tgl_masuk_permohonan' 
                                ? (d.tgl_masuk_permohonan ? new Date(d.tgl_masuk_permohonan).toLocaleDateString('id-ID') : '-')
                                : (d.tanggal ? new Date(d.tanggal).toLocaleDateString('id-ID') : '-')
                              }
                            </TableCell>
                            <TableCell className="text-xs">{prog?.nama || '-'}</TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {d.status === 'diterima'
                                ? `Rp ${Number(d.jumlah || 0).toLocaleString('id-ID')}`
                                : <span className="text-muted-foreground text-[10px]">-</span>}
                            </TableCell>
                            <TableCell>
                              {statusInfo
                                ? <Badge variant={statusInfo.variant} className="text-[10px] px-1 h-5">{statusInfo.label}</Badge>
                                : <span className="text-muted-foreground text-[10px]">Menunggu</span>}
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button size="icon" variant="outline" className="h-7 w-7"
                                onClick={() => { setEditingId(d.id); setFormOpen(true); }}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => handleDelete(d.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[10px] uppercase font-bold">Show:</span>
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                      <SelectTrigger className="w-[60px] h-7 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-muted-foreground text-[10px]">
                      Hal {page} dari {totalPages}
                    </p>
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog — 3/4 layar */}
      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingId(null); }}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-none h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle>{editingId ? 'Edit Distribusi' : 'Tambah Distribusi Baru'}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 pb-6">
            <DistribusiForm
              onSuccess={handleFormSuccess}
              editingId={editingId}
              onCancelEdit={() => { setFormOpen(false); setEditingId(null); }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
