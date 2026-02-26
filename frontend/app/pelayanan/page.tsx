'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { mustahiqApi, refApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { MustahiqForm } from '@/components/mustahiq-form';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-600',
  blacklist: 'bg-red-100 text-red-700',
};

// helper: cari nama dari list ref berdasarkan id
function refName(list: any[], id: any): string {
  if (!id) return '-';
  const found = list.find((r) => r.id === id || r.id === Number(id));
  return found?.nama ?? String(id);
}

export default function PelayananPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const [mustahiqList, setMustahiqList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reference lookup maps
  const [asnafList, setAsnafList] = useState<any[]>([]);
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [kelurahanAll, setKelurahanAll] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);

  // Search
  const [searchInput, setSearchInput] = useState('');
  const [searchQ, setSearchQ] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  // Load semua referensi sekali saja
  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [asnafRes, kecRes, kategoriRes] = await Promise.all([
          refApi.getAsnaf(),
          refApi.getKecamatan(),
          refApi.getKategoriMustahiq(),
        ]);
        if (asnafRes.data) setAsnafList(asnafRes.data);
        if (kecRes.data) setKecamatanList(kecRes.data);
        if (kategoriRes.data) setKategoriList(kategoriRes.data);

        // Load semua kelurahan (tanpa filter kecamatan)
        const kelRes = await refApi.list('kelurahan');
        if (kelRes.data) setKelurahanAll(kelRes.data);
      } catch (err) {
        console.error('Gagal memuat referensi:', err);
      }
    };
    loadRefs();
  }, []);

  useEffect(() => { fetchMustahiq(); }, [page, searchQ]);

  const fetchMustahiq = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await mustahiqApi.list({
        q: searchQ || undefined,
        page,
        limit,
      });
      const resData: any = response.data;
      if (resData) {
        const arr = Array.isArray(resData) ? resData : resData.data ?? [];
        setMustahiqList(arr);
        setTotal(resData.total ?? arr.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data Mustahiq');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQ(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQ('');
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    try {
      await mustahiqApi.delete(id);
      fetchMustahiq();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus data');
    }
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingId(null);
    fetchMustahiq();
  };

  const handleViewDetail = async (id: number) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await mustahiqApi.get(id);
      if (res.data) setDetailData(res.data);
    } catch {
      setDetailData(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Resolve nama ref: cek data joined dari API dulu, fallback ke lookup list lokal
  const getAsnafName = (m: any) =>
    m.asnaf?.nama ?? refName(asnafList, m.asnaf_id);
  const getKecamatanName = (m: any) =>
    m.kecamatan?.nama ?? refName(kecamatanList, m.kecamatan_id);
  const getKelurahanName = (m: any) =>
    m.kelurahan?.nama ?? refName(kelurahanAll, m.kelurahan_id);
  const getKategoriName = (m: any) =>
    m.kategoriMustahiq?.nama ?? m.kategori_mustahiq?.nama ?? refName(kategoriList, m.kategori_mustahiq_id);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mustahiq</h1>
            <p className="text-muted-foreground mt-1">Kelola data penerima zakat (Mustahiq)</p>
          </div>
          <Button onClick={() => { setEditingId(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Mustahiq
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <Input
            placeholder="Cari nama / NRM / NIK..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
          {searchQ && (
            <Button type="button" variant="ghost" onClick={handleClearSearch}>
              Reset
            </Button>
          )}
        </form>

        {/* Tabel */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Mustahiq</CardTitle>
            <CardDescription>
              {searchQ ? `Hasil pencarian "${searchQ}" — ` : ''}
              Total: {total > 0 ? total : mustahiqList.length} data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : mustahiqList.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {searchQ ? `Tidak ada data untuk "${searchQ}"` : 'Belum ada data Mustahiq'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NRM</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>NIK</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mustahiqList.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.nrm || '-'}</TableCell>
                        <TableCell>{m.nama}</TableCell>
                        <TableCell>{m.nik || '-'}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => handleViewDetail(m.id)} title="Lihat Detail">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(m.id)} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)} title="Hapus">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Form Tambah / Edit */}
      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Mustahiq' : 'Tambah Mustahiq Baru'}</DialogTitle>
          </DialogHeader>
          <MustahiqForm
            onSuccess={handleFormSuccess}
            editingId={editingId}
            onCancelEdit={() => { setFormOpen(false); setEditingId(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Detail */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Mustahiq</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : detailData ? (
            <div className="space-y-3 text-sm">
              <Row label="NRM" value={detailData.nrm} />
              <Row label="Nama" value={detailData.nama} />
              <Row label="NIK" value={detailData.nik} />
              <Row label="No HP" value={detailData.no_hp} />
              <Row label="Alamat" value={detailData.alamat} />
              <Row label="Kecamatan" value={detailData.kecamatan?.nama ?? refName(kecamatanList, detailData.kecamatan_id)} />
              <Row label="Kelurahan" value={detailData.kelurahan?.nama ?? refName(kelurahanAll, detailData.kelurahan_id)} />
              <Row label="Asnaf" value={detailData.asnaf?.nama ?? refName(asnafList, detailData.asnaf_id)} />
              <Row label="Kategori" value={detailData.kategoriMustahiq?.nama ?? detailData.kategori_mustahiq?.nama ?? refName(kategoriList, detailData.kategori_mustahiq_id)} />
              {detailData.keterangan && <Row label="Keterangan" value={detailData.keterangan} />}
              {detailData.rekomendasi_upz && <Row label="Rek. UPZ" value={detailData.rekomendasi_upz} />}
              <Row label="Tanggal Registrasi" value={detailData.created_at ? new Date(detailData.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'} />
              <div className="flex gap-2 pt-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); handleEdit(detailData.id); }}>
                  <Edit className="mr-1 h-3 w-3" /> Edit
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Data tidak ditemukan</p>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function Row({ label, value, children }: { label: string; value?: any; children?: React.ReactNode }) {
  return (
    <div className="flex gap-2 border-b pb-2 last:border-0">
      <span className="font-medium w-32 shrink-0 text-muted-foreground">{label}</span>
      <span className="flex-1">{children ?? (value != null && value !== '' ? String(value) : '-')}</span>
    </div>
  );
}
