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
  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const [searchInput, setSearchInput] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = { page, limit };
      if (searchQ) params.q = searchQ;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await distribusiApi.list(params);
      const resData: any = res;

      // Backend returns { success, rows, total, page, limit, totalPages }
      let arr: any[] = [];
      if (resData?.rows && Array.isArray(resData.rows)) {
        arr = resData.rows;
        setTotal(resData.total ?? arr.length);
      } else if (resData?.data && Array.isArray(resData.data)) {
        arr = resData.data;
        setTotal(resData.total ?? arr.length);
      }

      setList(arr);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data distribusi');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQ, statusFilter]);

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Distribusi Dana</h1>
            <p className="text-muted-foreground mt-1">Kelola penyaluran dana kepada Mustahiq</p>
          </div>
          <Button onClick={() => { setEditingId(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Distribusi
          </Button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <Input
            placeholder="Cari nama / NRM / NIK mustahiq..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="outline"><Search className="h-4 w-4" /></Button>
          {searchQ && (
            <Button type="button" variant="ghost"
              onClick={() => { setSearchInput(''); setSearchQ(''); setPage(1); }}>
              Reset
            </Button>
          )}
        </form>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map((f) => (
            <Button key={f.key} size="sm"
              variant={statusFilter === f.key ? 'default' : 'outline'}
              onClick={() => { setStatusFilter(f.key); setPage(1); }}>
              {f.label}
            </Button>
          ))}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Daftar Distribusi</CardTitle>
            <CardDescription>
              {searchQ ? `Hasil pencarian "${searchQ}" — ` : ''}
              Total: {total} data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : list.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {searchQ ? `Tidak ada hasil untuk "${searchQ}"` : 'Belum ada data Distribusi'}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NRM</TableHead>
                        <TableHead>Nama Mustahiq</TableHead>
                        <TableHead>Tgl. Distribusi</TableHead>
                        <TableHead>Program</TableHead>
                        <TableHead className="text-right">Jml. Penyaluran</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((d) => {
                        const mstq = d.Mustahiq || d.mustahiq;
                        const prog = d.NamaProgram || d.ref_nama_program || d.nama_program;
                        const statusInfo = d.status ? STATUS_BADGE[d.status] : null;
                        return (
                          <TableRow key={d.id}>
                            <TableCell className="font-mono text-xs">{mstq?.nrm || d.nrm || '-'}</TableCell>
                            <TableCell className="font-medium">{d.nama_mustahik || mstq?.nama || '-'}</TableCell>
                            <TableCell>{d.tanggal ? new Date(d.tanggal).toLocaleDateString('id-ID') : '-'}</TableCell>
                            <TableCell className="text-sm">{prog?.nama || '-'}</TableCell>
                            <TableCell className="text-right font-mono">
                              {d.status === 'diterima'
                                ? `Rp ${Number(d.jumlah || 0).toLocaleString('id-ID')}`
                                : <span className="text-muted-foreground text-xs">-</span>}
                            </TableCell>
                            <TableCell>
                              {statusInfo
                                ? <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                : <span className="text-muted-foreground text-xs">Menunggu</span>}
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                              <Button size="sm" variant="outline"
                                onClick={() => { setEditingId(d.id); setFormOpen(true); }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(d.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Halaman {page} dari {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
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
