'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { penerimaanApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { PengumpulanForm } from '@/components/pengumpulan-form';

export default function PengumpulanPage() {
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

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  useEffect(() => { fetchData(); }, [page, limit, startDate, endDate]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = { page, limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await penerimaanApi.list(params);
      const resData: any = res.data;
      if (resData) {
        const arr = Array.isArray(resData) ? resData : resData.data ?? [];
        setList(arr);
        setTotal(resData.total ?? arr.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data Pengumpulan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      await penerimaanApi.delete(id);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Penerimaan ZIS</h1>
            <p className="text-muted-foreground mt-1">Catat penerimaan ZIS</p>
          </div>
          <Button onClick={() => { setEditingId(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Pengumpulan
          </Button>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex flex-col gap-2 p-3 border rounded-md bg-muted/30">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Filter Tanggal:</span>
            <div className="flex flex-wrap items-center gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase ml-1">Dari</span>
                <Input type="date" size={1} className="h-8 text-xs w-36" 
                  value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-muted-foreground uppercase ml-1">Sampai</span>
                <Input type="date" size={1} className="h-8 text-xs w-36" 
                  value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} />
              </div>
              {(startDate || endDate) && (
                <Button variant="ghost" size="sm" className="h-8 mt-4" 
                  onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}>
                  Bersihkan
                </Button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Daftar Penerimaan</CardTitle>
            <CardDescription>Total: {total} data</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : list.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">Belum ada data Pengumpulan</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Muzakki</TableHead>
                        <TableHead>ZIS</TableHead>
                        <TableHead>Via</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{new Date(p.tanggal).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell>{p.Muzakki?.nama || p.muzakki?.nama || p.nama_muzakki || '-'}</TableCell>
                          <TableCell>{p.zis?.nama || '-'}{p.jenis_zis?.nama ? ` / ${p.jenis_zis.nama}` : ''}</TableCell>
                          <TableCell>{p.via?.nama || '-'}</TableCell>
                          <TableCell className="text-right font-mono">Rp {(p.jumlah || 0).toLocaleString('id-ID')}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="outline"
                              onClick={() => { setEditingId(p.id); setFormOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Entries per page:</span>
                    <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
                      <SelectTrigger className="w-[70px] h-8">
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
                    <p className="text-sm text-muted-foreground">
                      Halaman {page} dari {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
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
            <DialogTitle>{editingId ? 'Edit Penerimaan' : 'Tambah Penerimaan Baru'}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 pb-6">
            <PengumpulanForm
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
