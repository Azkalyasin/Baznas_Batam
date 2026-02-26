'use client';

import { useState, useEffect } from 'react';
import { mustahiqApi, refApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MustahiqFormProps {
  onSuccess: () => void;
  editingId: number | null;
  onCancelEdit: () => void;
}

const today = new Date().toISOString().split('T')[0];

const emptyForm = {
  nrm: '',
  nama: '',
  nik: '',
  no_hp: '',
  alamat: '',
  kecamatan_id: '',
  kelurahan_id: '',
  asnaf_id: '',
  kategori_mustahiq_id: '',
  rekomendasi_upz: '',
  keterangan: '',
  tgl_lahir: '',
  registered_date: today, // default: hari ini
};

const Req = () => <span className="text-destructive ml-1">*</span>;

export function MustahiqForm({ onSuccess, editingId, onCancelEdit }: MustahiqFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [kecamatan, setKecamatan] = useState<any[]>([]);
  const [kelurahan, setKelurahan] = useState<any[]>([]);
  const [asnafList, setAsnafList] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [formData, setFormData] = useState(emptyForm);

  // Load refs and edit data in one sequence to avoid kelurahan race condition
  useEffect(() => {
    const init = async () => {
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

        if (editingId) {
          const res = await mustahiqApi.get(editingId);
          if (res.data) {
            const d: any = res.data;
            const kecId = String(d.kecamatan_id || '');
            const kelId = String(d.kelurahan_id || '');

            // Fetch kelurahan list FIRST so Radix UI Select can match the value
            let fetchedKelList: any[] = [];
            if (kecId) {
              const kelRes = await refApi.list('kelurahan', { kecamatan_id: kecId });
              if (Array.isArray(kelRes.data)) fetchedKelList = kelRes.data;
            }
            setKelurahan(fetchedKelList);
            setFormData({
              nrm: d.nrm || '',
              nama: d.nama || '',
              nik: d.nik || '',
              no_hp: d.no_hp || '',
              alamat: d.alamat || '',
              kecamatan_id: kecId,
              kelurahan_id: kelId,
              asnaf_id: String(d.asnaf_id || ''),
              kategori_mustahiq_id: String(d.kategori_mustahiq_id || ''),
              rekomendasi_upz: d.rekomendasi_upz || '',
              keterangan: d.keterangan || '',
              tgl_lahir: d.tgl_lahir ? d.tgl_lahir.split('T')[0] : '',
              registered_date: d.registered_date ? d.registered_date.split('T')[0] : today,
            });
          }

        } else {
          setFormData({ ...emptyForm, registered_date: today });
          setKelurahan([]);
        }
      } catch (err) {
        console.error('Gagal memuat data referensi:', err);
        if (editingId) toast.error('Gagal memuat data untuk edit');
      } finally {
        setLoadingRefs(false);
      }
    };
    init();
  }, [editingId]);

  const handleKecamatanChange = async (value: string) => {
    setFormData((prev) => ({ ...prev, kecamatan_id: value, kelurahan_id: '' }));
    setKelurahan([]);
    try {
      const res = await refApi.list('kelurahan', { kecamatan_id: value });
      if (Array.isArray(res.data)) setKelurahan(res.data);
    } catch (err) {
      console.error('Gagal memuat kelurahan:', err);
    }
  };

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.nama.trim()) { toast.error('Field "Nama" wajib diisi'); setIsLoading(false); return; }
    if (!formData.kecamatan_id) { toast.error('Field "Kecamatan" wajib dipilih'); setIsLoading(false); return; }
    if (!formData.kelurahan_id) { toast.error('Field "Kelurahan" wajib dipilih'); setIsLoading(false); return; }

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
      rekomendasi_upz: formData.rekomendasi_upz || undefined,
      keterangan: formData.keterangan || undefined,
      tgl_lahir: formData.tgl_lahir || undefined,
      registered_date: formData.registered_date || undefined,
    };

    try {
      if (editingId) await mustahiqApi.update(editingId, payload as any);
      else await mustahiqApi.create(payload as any);
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan data';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* NRM */}
        <div className="space-y-2">
          <Label htmlFor="nrm">NRM</Label>
          <Input id="nrm" placeholder="Nomor Registrasi Mustahiq" maxLength={24}
            value={formData.nrm} onChange={set('nrm')} />
        </div>

        {/* Nama */}
        <div className="space-y-2">
          <Label htmlFor="nama">Nama<Req /></Label>
          <Input id="nama" placeholder="Nama lengkap" value={formData.nama} onChange={set('nama')} />
        </div>

        {/* NIK */}
        <div className="space-y-2">
          <Label htmlFor="nik">NIK</Label>
          <Input id="nik" placeholder="16 digit NIK" maxLength={16}
            value={formData.nik} onChange={set('nik')} />
        </div>

        {/* No HP */}
        <div className="space-y-2">
          <Label htmlFor="no_hp">No HP</Label>
          <Input id="no_hp" placeholder="08xxxxxxxx" maxLength={14}
            value={formData.no_hp} onChange={set('no_hp')} />
        </div>

        {/* Tanggal Lahir */}
        <div className="space-y-2">
          <Label htmlFor="tgl_lahir">Tanggal Lahir</Label>
          <Input id="tgl_lahir" type="date" value={formData.tgl_lahir} onChange={set('tgl_lahir')} />
        </div>

        {/* Tanggal Registrasi */}
        <div className="space-y-2">
          <Label htmlFor="registered_date">Tanggal Registrasi</Label>
          <Input id="registered_date" type="date" value={formData.registered_date} onChange={set('registered_date')} />
        </div>

        {/* Kecamatan */}
        <div className="space-y-2">
          <Label>Kecamatan<Req /></Label>
          <Select value={formData.kecamatan_id} onValueChange={handleKecamatanChange} disabled={loadingRefs}>
            <SelectTrigger>
              <SelectValue placeholder={loadingRefs ? 'Memuat...' : 'Pilih Kecamatan'} />
            </SelectTrigger>
            <SelectContent>
              {kecamatan.map((k) => <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Kelurahan */}
        <div className="space-y-2">
          <Label>Kelurahan<Req /></Label>
          <Select value={formData.kelurahan_id} onValueChange={(v) => setFormData((p) => ({ ...p, kelurahan_id: v }))}
            disabled={!formData.kecamatan_id || (kelurahan.length === 0 && !loadingRefs === false)}>
            <SelectTrigger>
              <SelectValue placeholder={!formData.kecamatan_id ? 'Pilih kecamatan dulu' : kelurahan.length === 0 ? 'Memuat...' : 'Pilih Kelurahan'} />
            </SelectTrigger>
            <SelectContent>
              {kelurahan.map((k) => <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Asnaf */}
        <div className="space-y-2">
          <Label>Asnaf</Label>
          <Select value={formData.asnaf_id} onValueChange={(v) => setFormData((p) => ({ ...p, asnaf_id: v }))} disabled={loadingRefs}>
            <SelectTrigger><SelectValue placeholder="Pilih Asnaf" /></SelectTrigger>
            <SelectContent>
              {asnafList.map((a) => <SelectItem key={a.id} value={String(a.id)}>{a.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Kategori Mustahiq */}
        <div className="space-y-2">
          <Label>Kategori Mustahiq</Label>
          <Select value={formData.kategori_mustahiq_id} onValueChange={(v) => setFormData((p) => ({ ...p, kategori_mustahiq_id: v }))} disabled={loadingRefs}>
            <SelectTrigger><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
            <SelectContent>
              {kategoriList.map((k) => <SelectItem key={k.id} value={String(k.id)}>{k.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Alamat */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="alamat">Alamat</Label>
          <Textarea id="alamat" placeholder="Alamat lengkap" rows={2}
            value={formData.alamat} onChange={set('alamat')} />
        </div>

        {/* Rekomendasi UPZ */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="rekomendasi_upz">Rekomendasi UPZ</Label>
          <Textarea id="rekomendasi_upz" placeholder="Nama UPZ yang merekomendasikan (opsional)" rows={2}
            value={formData.rekomendasi_upz} onChange={set('rekomendasi_upz')} />
        </div>

        {/* Keterangan */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="keterangan">Keterangan</Label>
          <Textarea id="keterangan" placeholder="Catatan tambahan (opsional)" rows={2}
            value={formData.keterangan} onChange={set('keterangan')} />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isLoading}>Batal</Button>
        <Button type="submit" disabled={isLoading || loadingRefs}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : editingId ? 'Simpan Perubahan' : 'Tambah'}
        </Button>
      </div>
    </form>
  );
}
