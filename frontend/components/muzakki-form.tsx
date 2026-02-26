'use client';

import { useState, useEffect } from 'react';
import { muzakkiApi, refApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface MuzakkiFormProps {
  onSuccess: () => void;
  editingId: number | null;
  onCancelEdit: () => void;
}

export function MuzakkiForm({ onSuccess, editingId, onCancelEdit }: MuzakkiFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [kelurahanList, setKelurahanList] = useState<any[]>([]);
  const [jenisMuzakkiList, setJenisMuzakkiList] = useState<any[]>([]);
  const [jenisUpzList, setJenisUpzList] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  const [formData, setFormData] = useState({
    npwz: '',
    nama: '',
    nik: '',
    no_hp: '',
    jenis_muzakki_id: '',
    jenis_upz_id: '',
    kecamatan_id: '',
    kelurahan_id: '',
  });

  useEffect(() => {
    loadReferences();
    if (editingId) loadEditData();
    else resetForm();
  }, [editingId]);

  const resetForm = () => {
    setFormData({ npwz: '', nama: '', nik: '', no_hp: '', jenis_muzakki_id: '', jenis_upz_id: '', kecamatan_id: '', kelurahan_id: '' });
    setKelurahanList([]);
  };

  const loadReferences = async () => {
    setLoadingRefs(true);
    try {
      const [kecRes, jmRes, jupzRes] = await Promise.all([
        refApi.list('kecamatan'),
        refApi.list('jenis-muzakki'),
        refApi.list('jenis-upz'),
      ]);
      if (Array.isArray(kecRes.data)) setKecamatanList(kecRes.data);
      if (Array.isArray(jmRes.data)) setJenisMuzakkiList(jmRes.data);
      if (Array.isArray(jupzRes.data)) setJenisUpzList(jupzRes.data);
    } catch (err) {
      console.error('Failed to load references:', err);
    } finally {
      setLoadingRefs(false);
    }
  };

  const loadEditData = async () => {
    if (!editingId) return;
    try {
      const res = await muzakkiApi.get(editingId);
      if (res.data) {
        const d = res.data;
        const kecId = String(d.kecamatan_id || '');
        setFormData({
          npwz: d.npwz || '',
          nama: d.nama || '',
          nik: d.nik || '',
          no_hp: d.no_hp || '',
          jenis_muzakki_id: String(d.jenis_muzakki_id || ''),
          jenis_upz_id: String(d.jenis_upz_id || ''),
          kecamatan_id: kecId,
          kelurahan_id: String(d.kelurahan_id || ''),
        });
        // Load kelurahan sesuai kecamatan
        if (kecId) {
          const kelRes = await refApi.list('kelurahan', { kecamatan_id: kecId });
          if (Array.isArray(kelRes.data)) setKelurahanList(kelRes.data);
        }
      }
    } catch (err) {
      setError('Gagal memuat data untuk edit');
    }
  };

  const handleKecamatanChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, kecamatan_id: value, kelurahan_id: '' }));
    setKelurahanList([]);
    try {
      const res = await refApi.list('kelurahan', { kecamatan_id: value });
      if (Array.isArray(res.data)) setKelurahanList(res.data);
    } catch (err) {
      console.error('Failed to load kelurahan:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.nama.trim()) { setError('Nama wajib diisi'); setIsLoading(false); return; }
    if (!formData.kecamatan_id) { setError('Kecamatan wajib dipilih'); setIsLoading(false); return; }
    if (!formData.kelurahan_id) { setError('Kelurahan wajib dipilih'); setIsLoading(false); return; }

    try {
      const payload: any = {
        nama: formData.nama.trim(),
        npwz: formData.npwz || undefined,
        nik: formData.nik || undefined,
        no_hp: formData.no_hp || undefined,
        kecamatan_id: parseInt(formData.kecamatan_id),
        kelurahan_id: parseInt(formData.kelurahan_id),
        jenis_muzakki_id: formData.jenis_muzakki_id ? parseInt(formData.jenis_muzakki_id) : undefined,
        jenis_upz_id: formData.jenis_upz_id ? parseInt(formData.jenis_upz_id) : undefined,
      };

      if (editingId) {
        await muzakkiApi.update(editingId, payload);
      } else {
        await muzakkiApi.create(payload);
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
        {/* NPWZ */}
        <div className="space-y-2">
          <Label htmlFor="npwz">NPWZ</Label>
          <Input
            id="npwz"
            placeholder="Nomor Pokok Wajib Zakat"
            value={formData.npwz}
            onChange={(e) => setFormData({ ...formData, npwz: e.target.value })}
          />
        </div>

        {/* Nama */}
        <div className="space-y-2">
          <Label htmlFor="nama">Nama *</Label>
          <Input
            id="nama"
            required
            placeholder="Nama lengkap muzakki"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          />
        </div>

        {/* NIK */}
        <div className="space-y-2">
          <Label htmlFor="nik">NIK</Label>
          <Input
            id="nik"
            placeholder="16 digit NIK"
            maxLength={16}
            value={formData.nik}
            onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
          />
        </div>

        {/* No HP */}
        <div className="space-y-2">
          <Label htmlFor="no_hp">No. HP</Label>
          <Input
            id="no_hp"
            placeholder="08xxxxxxxxxx"
            value={formData.no_hp}
            onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
          />
        </div>

        {/* Jenis Muzakki */}
        <div className="space-y-2">
          <Label htmlFor="jenis_muzakki">Jenis Muzakki</Label>
          <Select value={formData.jenis_muzakki_id} onValueChange={(v) => setFormData({ ...formData, jenis_muzakki_id: v })}>
            <SelectTrigger id="jenis_muzakki" disabled={loadingRefs}>
              <SelectValue placeholder="Pilih jenis muzakki" />
            </SelectTrigger>
            <SelectContent>
              {jenisMuzakkiList.length > 0
                ? jenisMuzakkiList.map((j) => <SelectItem key={j.id} value={j.id.toString()}>{j.nama}</SelectItem>)
                : [
                    <SelectItem key="1" value="1">Perorangan</SelectItem>,
                    <SelectItem key="2" value="2">Badan Hukum</SelectItem>,
                    <SelectItem key="3" value="3">Usaha</SelectItem>,
                  ]}
            </SelectContent>
          </Select>
        </div>

        {/* Jenis UPZ */}
        <div className="space-y-2">
          <Label htmlFor="jenis_upz">Jenis UPZ</Label>
          <Select value={formData.jenis_upz_id} onValueChange={(v) => setFormData({ ...formData, jenis_upz_id: v })}>
            <SelectTrigger id="jenis_upz" disabled={loadingRefs}>
              <SelectValue placeholder="Pilih jenis UPZ" />
            </SelectTrigger>
            <SelectContent>
              {jenisUpzList.length > 0
                ? jenisUpzList.map((j) => <SelectItem key={j.id} value={j.id.toString()}>{j.nama}</SelectItem>)
                : [
                    <SelectItem key="1" value="1">Tempat Kerja</SelectItem>,
                    <SelectItem key="2" value="2">Rumah Ibadah</SelectItem>,
                    <SelectItem key="3" value="3">Lainnya</SelectItem>,
                  ]}
            </SelectContent>
          </Select>
        </div>

        {/* Kecamatan */}
        <div className="space-y-2">
          <Label htmlFor="kecamatan">Kecamatan *</Label>
          <Select value={formData.kecamatan_id} onValueChange={handleKecamatanChange}>
            <SelectTrigger id="kecamatan" disabled={loadingRefs}>
              <SelectValue placeholder="Pilih Kecamatan" />
            </SelectTrigger>
            <SelectContent>
              {kecamatanList.map((k) => (
                <SelectItem key={k.id} value={k.id.toString()}>{k.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kelurahan */}
        <div className="space-y-2">
          <Label htmlFor="kelurahan">Kelurahan *</Label>
          <Select value={formData.kelurahan_id} onValueChange={(v) => setFormData({ ...formData, kelurahan_id: v })} disabled={!formData.kecamatan_id}>
            <SelectTrigger id="kelurahan">
              <SelectValue placeholder={formData.kecamatan_id ? 'Pilih Kelurahan' : 'Pilih Kecamatan dulu'} />
            </SelectTrigger>
            <SelectContent>
              {kelurahanList.map((k) => (
                <SelectItem key={k.id} value={k.id.toString()}>{k.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            editingId ? 'Update' : 'Tambah'
          )}
        </Button>
      </div>
    </form>
  );
}
