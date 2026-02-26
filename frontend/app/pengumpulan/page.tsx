'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { penerimaanApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  useEffect(() => { fetchData(); }, [page]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await penerimaanApi.list({ page, limit });
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
            <h1 className="text-3xl font-bold">Pengumpulan Dana Zakat</h1>
            <p className="text-muted-foreground mt-1">Catat penerimaan dana zakat dari Muzakki</p>
          </div>
          <Button onClick={() => { setEditingId(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Pengumpulan
          </Button>
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
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Halaman {page} dari {totalPages} (Total: {total})</p>
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

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Penerimaan' : 'Tambah Penerimaan Baru'}</DialogTitle>
          </DialogHeader>
          <PengumpulanForm
            onSuccess={handleFormSuccess}
            editingId={editingId}
            onCancelEdit={() => { setFormOpen(false); setEditingId(null); }}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
