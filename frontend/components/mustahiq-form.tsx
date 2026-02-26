'use client';

import { useState, useEffect } from 'react';
import { mustahiqApi, refApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface MustahiqFormProps {
  onSuccess: () => void;
  editingId: number | null;
  onCancelEdit: () => void;
}

export function MustahiqForm({ onSuccess, editingId, onCancelEdit }: MustahiqFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reference data
  const [kecamatan, setKecamatan] = useState<any[]>([]);
  const [kelurahan, setKelurahan] = useState<any[]>([]);
  const [asnafList, setAsnafList] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  // Form state — semua ID disimpan sebagai string untuk Select, dikonversi ke number saat submit
  const [formData, setFormData] = useState({
    nrm: '',
    nama: '',
    nik: '',
    no_hp: '',
    alamat: '',
    kecamatan_id: '',
    kelurahan_id: '',
    asnaf_id: '',
    kategori_mustahiq_id: '',
    keterangan: '',
  });

  // Load referensi data
  useEffect(() => {
    const loadRefs = async () => {
      setLoadingRefs(true);
      try {
        const [kecRes, asnafRes, kategoriRes] = await Promise.all([
          refApi.list('kecamatan'),
          refApi.list('asnaf'),
          refApi.list('kategori-mustahiq'),
        ]);
        if (Array.isArray(kecRes.data)) setKecamatan(kecRes.data);
        if (Array.isArray(asnafRes.data)) setAsnafList(asnafRes.data);
        if (Array.isArray(kategoriRes.data)) setKategoriList(kategoriRes.data);
      } catch (err) {
        console.error('Gagal memuat data referensi:', err);
      } finally {
        setLoadingRefs(false);
      }
    };
    loadRefs();
  }, []);

  // Load data saat edit
  useEffect(() => {
    if (!editingId) {
      // Reset form saat tambah baru
      setFormData({ nrm: '', nama: '', nik: '', no_hp: '', alamat: '', kecamatan_id: '', kelurahan_id: '', asnaf_id: '', kategori_mustahiq_id: '', keterangan: '' });
      return;
    }
    const loadEdit = async () => {
      try {
        const res = await mustahiqApi.get(editingId);
        if (res.data) {
          const d = res.data;
          const kecId = String(d.kecamatan_id || '');
          setFormData({
            nrm: d.nrm || '',
            nama: d.nama || '',
            nik: d.nik || '',
            no_hp: d.no_hp || '',
            alamat: d.alamat || '',
            kecamatan_id: kecId,
            kelurahan_id: String(d.kelurahan_id || ''),
            asnaf_id: String(d.asnaf_id || ''),
            kategori_mustahiq_id: String(d.kategori_mustahiq_id || ''),
            keterangan: d.keterangan || '',
          });
          // Muat kelurahan sesuai kecamatan yang ada
          if (kecId) {
            const kelRes = await refApi.list('kelurahan', { kecamatan_id: kecId });
            if (Array.isArray(kelRes.data)) setKelurahan(kelRes.data);
          }
        }
      } catch (err) {
        setError('Gagal memuat data untuk edit');
      }
    };
    loadEdit();
  }, [editingId]);

  const handleKecamatanChange = async (value: string) => {
    setFormData(prev => ({ ...prev, kecamatan_id: value, kelurahan_id: '' }));
    setKelurahan([]);
    try {
      const res = await refApi.list('kelurahan', { kecamatan_id: value });
      if (Array.isArray(res.data)) setKelurahan(res.data);
    } catch (err) {
      console.error('Gagal memuat kelurahan:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validasi manual
    if (!formData.nama.trim()) { setError('Nama wajib diisi'); setIsLoading(false); return; }
    if (!formData.kecamatan_id) { setError('Kecamatan wajib dipilih'); setIsLoading(false); return; }
    if (!formData.kelurahan_id) { setError('Kelurahan wajib dipilih'); setIsLoading(false); return; }

    // Konversi ID ke number
    const payload = {
      nrm: formData.nrm || undefined,
      nama: formData.nama,
      nik: formData.nik || undefined,
      no_hp: formData.no_hp || undefined,
      alamat: formData.alamat || undefined,
      kecamatan_id: parseInt(formData.kecamatan_id),
      kelurahan_id: parseInt(formData.kelurahan_id),
      asnaf_id: formData.asnaf_id ? parseInt(formData.asnaf_id) : undefined,
      kategori_mustahiq_id: formData.kategori_mustahiq_id ? parseInt(formData.kategori_mustahiq_id) : undefined,
      keterangan: formData.keterangan || undefined,
    };

    try {
      if (editingId) {
        await mustahiqApi.update(editingId, payload);
      } else {
        await mustahiqApi.create(payload);
      }
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan data';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* NRM */}
        <div className="space-y-2">
          <Label htmlFor="nrm">NRM</Label>
          <Input id="nrm" placeholder="Nomor Registrasi Mustahiq" value={formData.nrm}
            onChange={(e) => setFormData(p => ({ ...p, nrm: e.target.value }))} />
        </div>

        {/* Nama */}
        <div className="space-y-2">
          <Label htmlFor="nama">Nama <span className="text-destructive">*</span></Label>
          <Input id="nama" placeholder="Nama lengkap" value={formData.nama}
            onChange={(e) => setFormData(p => ({ ...p, nama: e.target.value }))} />
        </div>

        {/* NIK */}
        <div className="space-y-2">
          <Label htmlFor="nik">NIK</Label>
          <Input id="nik" placeholder="16 digit NIK" maxLength={16} value={formData.nik}
            onChange={(e) => setFormData(p => ({ ...p, nik: e.target.value }))} />
        </div>

        {/* No HP */}
        <div className="space-y-2">
          <Label htmlFor="no_hp">No HP</Label>
          <Input id="no_hp" placeholder="08xxxxxxxx" value={formData.no_hp}
            onChange={(e) => setFormData(p => ({ ...p, no_hp: e.target.value }))} />
        </div>

        {/* Alamat */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="alamat">Alamat</Label>
          <Textarea id="alamat" placeholder="Alamat lengkap" value={formData.alamat}
            onChange={(e) => setFormData(p => ({ ...p, alamat: e.target.value }))} />
        </div>

        {/* Kecamatan */}
        <div className="space-y-2">
          <Label>Kecamatan <span className="text-destructive">*</span></Label>
          <Select value={formData.kecamatan_id} onValueChange={handleKecamatanChange} disabled={loadingRefs}>
            <SelectTrigger>
              <SelectValue placeholder={loadingRefs ? 'Memuat...' : 'Pilih Kecamatan'} />
            </SelectTrigger>
            <SelectContent>
              {kecamatan.map((k) => (
                <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kelurahan */}
        <div className="space-y-2">
          <Label>Kelurahan <span className="text-destructive">*</span></Label>
          <Select value={formData.kelurahan_id} onValueChange={(v) => setFormData(p => ({ ...p, kelurahan_id: v }))}
            disabled={!formData.kecamatan_id || kelurahan.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={!formData.kecamatan_id ? 'Pilih kecamatan dulu' : 'Pilih Kelurahan'} />
            </SelectTrigger>
            <SelectContent>
              {kelurahan.map((k) => (
                <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Asnaf */}
        <div className="space-y-2">
          <Label>Asnaf</Label>
          <Select value={formData.asnaf_id} onValueChange={(v) => setFormData(p => ({ ...p, asnaf_id: v }))} disabled={loadingRefs}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Asnaf" />
            </SelectTrigger>
            <SelectContent>
              {asnafList.map((a) => (
                <SelectItem key={a.id} value={String(a.id)}>{a.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kategori Mustahiq */}
        <div className="space-y-2">
          <Label>Kategori Mustahiq</Label>
          <Select value={formData.kategori_mustahiq_id} onValueChange={(v) => setFormData(p => ({ ...p, kategori_mustahiq_id: v }))} disabled={loadingRefs}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Kategori" />
            </SelectTrigger>
            <SelectContent>
              {kategoriList.map((k) => (
                <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Keterangan */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="keterangan">Keterangan</Label>
          <Textarea id="keterangan" placeholder="Keterangan tambahan (opsional)" value={formData.keterangan}
            onChange={(e) => setFormData(p => ({ ...p, keterangan: e.target.value }))} />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading || loadingRefs}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
          ) : (
            editingId ? 'Simpan Perubahan' : 'Tambah'
          )}
        </Button>
      </div>
    </form>
  );
}
