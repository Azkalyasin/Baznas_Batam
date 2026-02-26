'use client';

import { useState, useEffect } from 'react';
import { penerimaanApi, muzakkiApi, refApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface PengumpulanFormProps {
  onSuccess: () => void;
  editingId: number | null;
  onCancelEdit: () => void;
}

export function PengumpulanForm({ onSuccess, editingId, onCancelEdit }: PengumpulanFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown options dari API
  const [muzakkiList, setMuzakkiList] = useState<any[]>([]);
  const [viaList, setViaList] = useState<any[]>([]);           // via pembayaran (tunai, transfer, dll)
  const [zisList, setZisList] = useState<any[]>([]);           // zakat / infaq / sedekah
  const [jenisZisList, setJenisZisList] = useState<any[]>([]); // jenis zakat mal, fitrah, dll
  const [persentaseAmilList, setPersentaseAmilList] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    muzakki_id: '',
    via_id: '',
    zis_id: '',
    jenis_zis_id: '',
    jumlah: '',
    persentase_amil_id: '',
    keterangan: '',
  });

  useEffect(() => {
    loadRefs();
    if (editingId) loadEditData();
    else resetForm();
  }, [editingId]);

  // Reset jenisZisList hanya ketika zis_id dikosongkan
  useEffect(() => {
    if (!formData.zis_id) {
      setJenisZisList([]);
    }
  }, [formData.zis_id]);

  const resetForm = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      muzakki_id: '', via_id: '', zis_id: '', jenis_zis_id: '',
      jumlah: '', persentase_amil_id: '', keterangan: '',
    });
  };

  const loadRefs = async () => {
    setLoadingRefs(true);
    try {
      // Muzakki load terpisah supaya error ref lain tidak block ini
      const muzRes = await muzakkiApi.list({ page: 1, limit: 500 });
      const muzData: any = muzRes.data;
      const muzArr = Array.isArray(muzData) ? muzData : muzData?.data ?? [];
      setMuzakkiList(muzArr);

      // Load ref lainnya secara parallel — error salah satu tidak mempengaruhi yang lain
      const [viaRes, zisRes, amRes] = await Promise.allSettled([
        refApi.list('via-penerimaan'),
        refApi.list('zis'),
        refApi.list('persentase-amil'),
      ]);
      if (viaRes.status === 'fulfilled' && Array.isArray(viaRes.value.data)) setViaList(viaRes.value.data);
      if (zisRes.status === 'fulfilled' && Array.isArray(zisRes.value.data)) setZisList(zisRes.value.data);
      if (amRes.status === 'fulfilled' && Array.isArray(amRes.value.data)) setPersentaseAmilList(amRes.value.data);
    } catch (err) {
      console.error('Failed to load muzakki:', err);
      setError('Gagal memuat daftar Muzakki. Pastikan Anda sudah login.');
    } finally {
      setLoadingRefs(false);
    }
  };


  const loadJenisZis = async (zisId: string) => {
    try {
      const res = await refApi.list('jenis-zis', { zis_id: zisId });
      if (Array.isArray(res.data)) setJenisZisList(res.data);
      else setJenisZisList([]);
    } catch {
      setJenisZisList([]);
    }
  };

  const loadEditData = async () => {
    if (!editingId) return;
    try {
      const res = await penerimaanApi.get(editingId);
      if (res.data) {
        const d: any = res.data;
        const zisId = String(d.zis_id || '');
        // Load jenisZisList dulu sebelum setFormData agar jenis_zis_id tidak di-reset oleh useEffect
        if (zisId) {
          await loadJenisZis(zisId);
        }
        setFormData({
          tanggal: d.tanggal ? d.tanggal.split('T')[0] : new Date().toISOString().split('T')[0],
          muzakki_id: String(d.muzakki_id || ''),
          via_id: String(d.via_id || ''),
          zis_id: zisId,
          jenis_zis_id: String(d.jenis_zis_id || ''),
          jumlah: String(d.jumlah || ''),
          persentase_amil_id: String(d.persentase_amil_id || ''),
          keterangan: d.keterangan || '',
        });
      }
    } catch (err) {
      setError('Gagal memuat data untuk edit');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.muzakki_id) { setError('Pilih Muzakki terlebih dahulu'); setIsLoading(false); return; }
    if (!formData.via_id) { setError('Pilih Via Pembayaran terlebih dahulu'); setIsLoading(false); return; }
    if (!formData.zis_id) { setError('Pilih jenis ZIS terlebih dahulu'); setIsLoading(false); return; }
    if (!formData.jenis_zis_id) { setError('Pilih Jenis ZIS detail terlebih dahulu'); setIsLoading(false); return; }
    if (!formData.jumlah || parseInt(formData.jumlah) <= 0) { setError('Jumlah harus lebih dari 0'); setIsLoading(false); return; }

    try {
      const payload: any = {
        tanggal: formData.tanggal,
        muzakki_id: parseInt(formData.muzakki_id),
        via_id: parseInt(formData.via_id),
        zis_id: parseInt(formData.zis_id),
        jenis_zis_id: parseInt(formData.jenis_zis_id),
        jumlah: parseInt(formData.jumlah),
      };
      if (formData.persentase_amil_id) payload.persentase_amil_id = parseInt(formData.persentase_amil_id);
      if (formData.keterangan) payload.keterangan = formData.keterangan;

      if (editingId) {
        await penerimaanApi.update(editingId, payload);
      } else {
        await penerimaanApi.create(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data');
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
        {/* Tanggal */}
        <div className="space-y-2">
          <Label htmlFor="tanggal">Tanggal *</Label>
          <Input id="tanggal" type="date" required value={formData.tanggal}
            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })} />
        </div>

        {/* Muzakki */}
        <div className="space-y-2">
          <Label htmlFor="muzakki">Muzakki *</Label>
          <Select value={formData.muzakki_id} onValueChange={(v) => setFormData({ ...formData, muzakki_id: v })}>
            <SelectTrigger id="muzakki" disabled={loadingRefs}>
              <SelectValue placeholder={loadingRefs ? 'Memuat...' : 'Pilih Muzakki'} />
            </SelectTrigger>
            <SelectContent>
              {muzakkiList.map((m) => (
                <SelectItem key={m.id} value={m.id.toString()}>{m.nama} {m.npwz ? `(${m.npwz})` : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Via / Kanal Pembayaran */}
        <div className="space-y-2">
          <Label htmlFor="via">Via Pembayaran</Label>
          <Select value={formData.via_id} onValueChange={(v) => setFormData({ ...formData, via_id: v })}>
            <SelectTrigger id="via" disabled={loadingRefs}>
              <SelectValue placeholder="Pilih via pembayaran" />
            </SelectTrigger>
            <SelectContent>
              {viaList.length > 0
                ? viaList.map((v) => <SelectItem key={v.id} value={v.id.toString()}>{v.nama}</SelectItem>)
                : [
                  <SelectItem key="1" value="1">Tunai</SelectItem>,
                  <SelectItem key="2" value="2">Transfer Bank</SelectItem>,
                  <SelectItem key="3" value="3">QRIS</SelectItem>,
                ]}
            </SelectContent>
          </Select>
        </div>

        {/* ZIS (Zakat / Infaq / Sedekah) */}
        <div className="space-y-2">
          <Label htmlFor="zis">Jenis ZIS *</Label>
          <Select value={formData.zis_id} onValueChange={async (v) => {
            setFormData({ ...formData, zis_id: v, jenis_zis_id: '' });
            setJenisZisList([]);
            if (v) await loadJenisZis(v);
          }}>
            <SelectTrigger id="zis" disabled={loadingRefs}>
              <SelectValue placeholder="Pilih Zakat / Infaq / Sedekah" />
            </SelectTrigger>
            <SelectContent>
              {zisList.length > 0
                ? zisList.map((z) => <SelectItem key={z.id} value={z.id.toString()}>{z.nama}</SelectItem>)
                : [
                  <SelectItem key="1" value="1">Zakat</SelectItem>,
                  <SelectItem key="2" value="2">Infaq</SelectItem>,
                  <SelectItem key="3" value="3">Sedekah</SelectItem>,
                ]}
            </SelectContent>
          </Select>
        </div>

        {/* Jenis ZIS detail (muncul setelah pilih ZIS) */}
        <div className="space-y-2">
          <Label htmlFor="jenis_zis">Jenis {zisList.find(z => z.id.toString() === formData.zis_id)?.nama || 'ZIS'} Detail</Label>
          <Select value={formData.jenis_zis_id} onValueChange={(v) => setFormData({ ...formData, jenis_zis_id: v })}
            disabled={!formData.zis_id}>
            <SelectTrigger id="jenis_zis">
              <SelectValue placeholder={!formData.zis_id ? 'Pilih ZIS dulu' : 'Pilih jenis detail'} />
            </SelectTrigger>
            <SelectContent>
              {jenisZisList.map((j) => (
                <SelectItem key={j.id} value={j.id.toString()}>{j.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Persentase Amil */}
        <div className="space-y-2">
          <Label htmlFor="persentase_amil">Persentase Amil</Label>
          <Select value={formData.persentase_amil_id} onValueChange={(v) => setFormData({ ...formData, persentase_amil_id: v })}>
            <SelectTrigger id="persentase_amil" disabled={loadingRefs}>
              <SelectValue placeholder="Pilih persentase amil" />
            </SelectTrigger>
            <SelectContent>
              {persentaseAmilList.length > 0
                ? persentaseAmilList.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.label} {/* {(Number(p.nilai) * 100).toFixed(1)}% */}</SelectItem>)
                : <SelectItem value="1">Default (1/8 = 12.5%)</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {/* Jumlah */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="jumlah">Jumlah (Rp) *</Label>
          <Input id="jumlah" type="number" required min="1" placeholder="Masukkan nominal"
            value={formData.jumlah}
            onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })} />
        </div>

        {/* Keterangan */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="keterangan">Keterangan</Label>
          <Textarea id="keterangan" placeholder="Keterangan tambahan (opsional)"
            value={formData.keterangan}
            onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isLoading}>Batal</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : editingId ? 'Update' : 'Tambah'}
        </Button>
      </div>
    </form>
  );
}
