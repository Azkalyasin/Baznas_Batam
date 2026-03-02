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
import { AlertCircle, Loader2, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react';
import { PengumpulanForm } from '@/components/pengumpulan-form';

export default function PengumpulanPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const isPelayanan = user?.role === 'pelayanan';

  const [list, setList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  useEffect(() => { fetchData(); }, [page, limit, startDate, endDate, searchQ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQ(searchInput);
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = { page, limit };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (searchQ) params.q = searchQ;

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

  const handleViewDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await penerimaanApi.get(id);
      if (res.data) setDetailData(res.data);
    } catch {
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Penerimaan ZIS</h1>
            <p className="text-muted-foreground mt-1">Catat penerimaan ZIS</p>
          </div>
          {!isPelayanan && (
            <Button onClick={() => { setEditingId(null); setFormOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Pengumpulan
            </Button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end w-full">
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto md:min-w-[300px]">
            <Input
              placeholder="Cari Muzakki / Resi / No. Rek..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="md:max-w-[400px]"
            />
            <Button type="submit" variant="outline"><Search className="h-4 w-4" /></Button>
            {searchQ && (
              <Button type="button" variant="ghost" onClick={() => { setSearchInput(''); setSearchQ(''); setPage(1); }}>
                Reset
              </Button>
            )}
          </form>

          <div className="flex flex-col gap-2 p-3 border rounded-md bg-muted/30 w-full md:w-auto md:ml-auto">
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
                          <TableCell className="text-right space-x-1">
                            <Button size="icon" variant="outline" className="h-7 w-7"
                              onClick={() => handleViewDetail(p.id)} title="Detail">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {!isPelayanan && (
                              <>
                                <Button size="icon" variant="outline" className="h-7 w-7"
                                  onClick={() => { setEditingId(p.id); setFormOpen(true); }} title="Edit">
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => handleDelete(p.id)} title="Hapus">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
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
      <Dialog open={formOpen} onOpenChange={(open) => {
        setFormOpen(open);
        if (!open) { setEditingId(null); }
      }}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-none h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle>
              {editingId ? 'Edit Penerimaan' : 'Tambah Penerimaan Baru'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 pb-6">
            <PengumpulanForm
              onSuccess={handleFormSuccess}
              editingId={editingId}
              onCancelEdit={() => { setFormOpen(false); setEditingId(null); }}
              isReadOnly={isPelayanan}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-7xl sm:max-w-none w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Penerimaan</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : detailData ? (
            <div className="space-y-4 text-sm mt-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <span className="text-muted-foreground font-medium">Tanggal Pembayaran</span>
                <span>{detailData.tanggal ? new Date(detailData.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}</span>

                <span className="text-muted-foreground font-medium border-t pt-3 mt-1">Muzakki</span>
                <span className="font-semibold border-t pt-3 mt-1 text-primary">{detailData.Muzakki?.nama || detailData.muzakki?.nama || detailData.nama_muzakki || '-'} {detailData.Muzakki?.npwz ? `(${detailData.Muzakki.npwz})` : ''}</span>

                <span className="text-muted-foreground font-medium">Jenis Muzakki</span>
                <span>{detailData.JenisMuzakki?.nama || detailData.jenis_muzakki?.nama || '-'}</span>

                <span className="text-muted-foreground font-medium">Jenis UPZ</span>
                <span>{detailData.JenisUpz?.nama || detailData.jenis_upz?.nama || '-'}</span>

                <span className="text-muted-foreground font-medium border-t pt-3 mt-1">ZIS</span>
                <span className="border-t pt-3 mt-1">{detailData.zis?.nama || detailData.Zis?.nama || '-'}</span>

                <span className="text-muted-foreground font-medium">Jenis Detail ZIS</span>
                <span>{detailData.jenis_zis?.nama || detailData.JenisZis?.nama || '-'}</span>

                <span className="text-muted-foreground font-medium border-t pt-3 mt-1">Jumlah Nominal</span>
                <span className="font-bold border-t pt-3 mt-1 text-base text-primary">Rp {Number(detailData.jumlah || 0).toLocaleString('id-ID')}</span>

                <span className="text-muted-foreground font-medium">Persentase Amil</span>
                <span>{detailData.PersentaseAmil?.label || detailData.persentase_amil?.label || '-'}</span>

                <span className="text-muted-foreground font-medium border-t pt-3 mt-1">Via Pembayaran</span>
                <span className="border-t pt-3 mt-1">{detailData.via?.nama || detailData.ViaPenerimaan?.nama || '-'}</span>

                <span className="text-muted-foreground font-medium">Metode Bayar</span>
                <span>{detailData.MetodeBayar?.nama || detailData.metode_bayar?.nama || '-'}</span>

                <span className="text-muted-foreground font-medium">No. Rekening</span>
                <span className="font-mono text-xs">{detailData.no_rekening || '-'}</span>

                <span className="text-muted-foreground font-medium border-t pt-3 mt-1">Rekomendasi UPZ</span>
                <span className="border-t pt-3 mt-1">{detailData.rekomendasi_upz || '-'}</span>

                <span className="text-muted-foreground font-medium">Keterangan</span>
                <span className="italic">{detailData.keterangan || '-'}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Data tidak ditemukan</p>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout >
  );
}
