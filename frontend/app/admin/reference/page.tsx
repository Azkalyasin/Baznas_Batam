'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { refApi, RefResource } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Database, Search } from 'lucide-react';

const RESOURCES: { val: RefResource; label: string }[] = [
    { val: 'asnaf', label: 'Asnaf' },
    { val: 'kecamatan', label: 'Kecamatan' },
    { val: 'kelurahan', label: 'Kelurahan' },
    { val: 'jenis-zis', label: 'Jenis ZIS' },
    { val: 'kategori-mustahiq', label: 'Kategori Mustahiq' },
    { val: 'via-penerimaan', label: 'Via Penerimaan' },
    { val: 'metode-bayar', label: 'Metode Bayar' },
    { val: 'nama-program', label: 'Nama Program' },
    { val: 'sub-program', label: 'Sub Program' },
    { val: 'program-kegiatan', label: 'Program Kegiatan' },
    { val: 'nama-entitas', label: 'Nama Entitas' },
    { val: 'persentase-amil', label: 'Persentase Amil' },
];

export default function ReferenceManagementPage() {
    const [resource, setResource] = useState<RefResource>('asnaf');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState<Record<string, any>>({
        nama: '',
        deskripsi: '',
        is_active: 1
    });

    useEffect(() => {
        fetchData();
    }, [resource]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await refApi.list(resource);
            if (res.success && res.data) {
                setData(res.data);
            }
        } catch (err) {
            toast.error('Gagal mengambil data referensi');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
        try {
            await refApi.delete(resource, id);
            toast.success('Data berhasil dihapus');
            fetchData();
        } catch (err) {
            toast.error('Gagal menghapus data');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingItem) {
                await refApi.update(resource, editingItem.id, formData);
                toast.success('Data berhasil diupdate');
            } else {
                await refApi.create(resource, formData);
                toast.success('Data berhasil ditambahkan');
            }
            setOpen(false);
            resetForm();
            fetchData();
        } catch (err: any) {
            toast.error(err.message || 'Gagal menyimpan data');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            nama: '',
            deskripsi: '',
            is_active: 1
        });
        setEditingItem(null);
    };

    const filteredData = data.filter(item =>
        item.nama?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Data Referensi</h1>
                        <p className="text-muted-foreground">Kelola data master dan tabel referensi sistem.</p>
                    </div>
                    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Tambah Data
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingItem ? 'Edit Data' : 'Tambah Data Baru'}</DialogTitle>
                                <DialogDescription>
                                    Lengkapi informasi untuk tabel {RESOURCES.find(r => r.val === resource)?.label}.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nama / Label</label>
                                    <Input
                                        value={formData.nama}
                                        onChange={e => setFormData({ ...formData, nama: e.target.value })}
                                        placeholder="Masukkan nama"
                                        required
                                    />
                                </div>
                                {resource === 'persentase-amil' ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Nilai (Decimal 0.125 = 12.5%)</label>
                                        <Input
                                            type="number"
                                            step="0.001"
                                            value={formData.nilai}
                                            onChange={e => setFormData({ ...formData, nilai: parseFloat(e.target.value) })}
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Deskripsi</label>
                                        <Input
                                            value={formData.deskripsi || ''}
                                            onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                                            placeholder="Masukkan deskripsi (opsional)"
                                        />
                                    </div>
                                )}

                                <DialogFooter className="pt-4">
                                    <Button type="submit" disabled={submitting} className="w-full">
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        {editingItem ? 'Simpan Perubahan' : 'Tambah Data'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <Card className="w-full md:w-64 shrink-0">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Database className="h-4 w-4" /> Pilih Kategori
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                            <div className="space-y-1">
                                {RESOURCES.map((res) => (
                                    <button
                                        key={res.val}
                                        onClick={() => setResource(res.val)}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all ${resource === res.val
                                            ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                                            : 'hover:bg-muted font-medium'
                                            }`}
                                    >
                                        {res.label}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="flex-1 overflow-hidden">
                        <CardHeader className="border-b bg-muted/5 flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="capitalize">{resource.replace('-', ' ')}</CardTitle>
                                <CardDescription>Total {data.length} item ditemukan.</CardDescription>
                            </div>
                            <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari data..."
                                    className="pl-9 h-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="flex h-60 items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="w-[100px]">ID</TableHead>
                                                <TableHead>Nama</TableHead>
                                                {resource === 'persentase-amil' ? <TableHead>Nilai</TableHead> : <TableHead>Deskripsi</TableHead>}
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredData.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                                        Tidak ada data ditemukan.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredData.map((item) => (
                                                    <TableRow key={item.id} className="hover:bg-muted/20">
                                                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                                                        <TableCell className="font-bold">{item.nama}</TableCell>
                                                        {resource === 'persentase-amil' ? (
                                                            <TableCell>{(item.nilai * 100).toFixed(2)}%</TableCell>
                                                        ) : (
                                                            <TableCell className="text-muted-foreground text-sm">{item.deskripsi || '-'}</TableCell>
                                                        )}
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
