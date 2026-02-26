'use client';

import { useState, useEffect } from 'react';
import { muzakkiApi, refApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MuzakkiFormProps {
  onSuccess: () => void;
  editingId: number | null;
  onCancelEdit: () => void;
}

const today = new Date().toISOString().split('T')[0];

const emptyForm = {
  npwz: '',
  nama: '',
  nik: '',
  no_hp: '',
  jenis_muzakki_id: '',
  jenis_upz_id: '',
  kecamatan_id: '',
  kelurahan_id: '',
  alamat: '',
  keterangan: '',
  tgl_lahir: '',
  registered_date: today, // default: hari ini
};

const Req = () => <span className="text-destructive ml-1">*</span>;

export function MuzakkiForm({ onSuccess, editingId, onCancelEdit }: MuzakkiFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [kecamatanList, setKecamatanList] = useState<any[]>([]);
  const [kelurahanList, setKelurahanList] = useState<any[]>([]);
  const [jenisMuzakkiList, setJenisMuzakkiList] = useState<any[]>([]);
  const [jenisUpzList, setJenisUpzList] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [formData, setFormData] = useState(emptyForm);

  // Load refs + edit data together to avoid race condition
  useEffect(() => {
    const init = async () => {
      setLoadingRefs(true);
      try {
        const [kecRes, jmRes, jupzRes] = await Promise.all([
          refApi.list('kecamatan'),
          refApi.list('jenis-muzakki'),
          refApi.list('jenis-upz'),
        ]);
        const kecList = Array.isArray(kecRes.data) ? kecRes.data : [];
        const jmList = Array.isArray(jmRes.data) ? jmRes.data : [];
        const jupzList = Array.isArray(jupzRes.data) ? jupzRes.data : [];
        setKecamatanList(kecList);
        setJenisMuzakkiList(jmList);
        setJenisUpzList(jupzList);

        if (editingId) {
          // Load edit data AFTER refs are loaded to avoid kelurahan issue
          const res = await muzakkiApi.get(editingId);
          if (res.data) {
            const d: any = res.data;
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
              alamat: d.alamat || '',
              keterangan: d.keterangan || '',
              tgl_lahir: d.tgl_lahir ? d.tgl_lahir.split('T')[0] : '',
              registered_date: d.registered_date ? d.registered_date.split('T')[0] : today,
            });
            if (kecId) {
              const kelRes = await refApi.list('kelurahan', { kecamatan_id: kecId });
              if (Array.isArray(kelRes.data)) setKelurahanList(kelRes.data);
            }
          }
        } else {
          setFormData({ ...emptyForm, registered_date: today });
          setKelurahanList([]);
        }
      } catch (err) {
        console.error('Init error:', err);
        if (editingId) toast.error('Gagal memuat data untuk edit');
      } finally {
        setLoadingRefs(false);
      }
    };
    init();
  }, [editingId]);

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

  const set = (field: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.nama.trim()) { toast.error('Field "Nama" wajib diisi'); setIsLoading(false); return; }
    if (!formData.kecamatan_id) { toast.error('Field "Kecamatan" wajib dipilih'); setIsLoading(false); return; }
    if (!formData.kelurahan_id) { toast.error('Field "Kelurahan" wajib dipilih'); setIsLoading(false); return; }

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
        alamat: formData.alamat || undefined,
        keterangan: formData.keterangan || undefined,
        tgl_lahir: formData.tgl_lahir || undefined,
        registered_date: formData.registered_date || undefined,
      };

      if (editingId) await muzakkiApi.update(editingId, payload);
      else await muzakkiApi.create(payload);
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
        {/* NPWZ */}
        <div className="space-y-2">
          <Label htmlFor="npwz">NPWZ</Label>
          <Input id="npwz" placeholder="Nomor Pokok Wajib Zakat" maxLength={15}
            value={formData.npwz} onChange={set('npwz')} />
        </div>

        {/* Nama */}
        <div className="space-y-2">
          <Label htmlFor="nama">Nama<Req /></Label>
          <Input id="nama" required placeholder="Nama lengkap muzakki"
            value={formData.nama} onChange={set('nama')} />
        </div>

        {/* NIK */}
        <div className="space-y-2">
          <Label htmlFor="nik">NIK</Label>
          <Input id="nik" placeholder="16 digit NIK" maxLength={16}
            value={formData.nik} onChange={set('nik')} />
        </div>

        {/* No HP */}
        <div className="space-y-2">
          <Label htmlFor="no_hp">No. HP</Label>
          <Input id="no_hp" placeholder="08xxxxxxxxxx" maxLength={14}
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

        {/* Jenis Muzakki */}
        <div className="space-y-2">
          <Label>Jenis Muzakki</Label>
          <Select value={formData.jenis_muzakki_id} onValueChange={(v) => setFormData((p) => ({ ...p, jenis_muzakki_id: v }))}>
            <SelectTrigger disabled={loadingRefs}>
              <SelectValue placeholder={loadingRefs ? 'Memuat...' : 'Pilih jenis muzakki'} />
            </SelectTrigger>
            <SelectContent>
              {jenisMuzakkiList.map((j) => <SelectItem key={j.id} value={j.id.toString()}>{j.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Jenis UPZ */}
        <div className="space-y-2">
          <Label>Jenis UPZ</Label>
          <Select value={formData.jenis_upz_id} onValueChange={(v) => setFormData((p) => ({ ...p, jenis_upz_id: v }))}>
            <SelectTrigger disabled={loadingRefs}>
              <SelectValue placeholder={loadingRefs ? 'Memuat...' : 'Pilih jenis UPZ'} />
            </SelectTrigger>
            <SelectContent>
              {jenisUpzList.map((j) => <SelectItem key={j.id} value={j.id.toString()}>{j.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Kecamatan */}
        <div className="space-y-2">
          <Label>Kecamatan<Req /></Label>
          <Select value={formData.kecamatan_id} onValueChange={handleKecamatanChange}>
            <SelectTrigger disabled={loadingRefs}>
              <SelectValue placeholder={loadingRefs ? 'Memuat...' : 'Pilih Kecamatan'} />
            </SelectTrigger>
            <SelectContent>
              {kecamatanList.map((k) => <SelectItem key={k.id} value={k.id.toString()}>{k.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Kelurahan */}
        <div className="space-y-2">
          <Label>Kelurahan<Req /></Label>
          <Select value={formData.kelurahan_id} onValueChange={(v) => setFormData((p) => ({ ...p, kelurahan_id: v }))}
            disabled={!formData.kecamatan_id || loadingRefs}>
            <SelectTrigger>
              <SelectValue placeholder={!formData.kecamatan_id ? 'Pilih Kecamatan dulu' : kelurahanList.length === 0 ? 'Memuat...' : 'Pilih Kelurahan'} />
            </SelectTrigger>
            <SelectContent>
              {kelurahanList.map((k) => <SelectItem key={k.id} value={k.id.toString()}>{k.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Alamat */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="alamat">Alamat</Label>
          <Textarea id="alamat" placeholder="Alamat lengkap" rows={2}
            value={formData.alamat} onChange={set('alamat')} />
        </div>

        {/* Keterangan */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="keterangan">Keterangan</Label>
          <Textarea id="keterangan" placeholder="Catatan tambahan (opsional)" rows={2}
            value={formData.keterangan} onChange={set('keterangan')} />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isLoading}>Batal</Button>
        <Button type="submit" disabled={isLoading || loadingRefs}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : editingId ? 'Simpan Perubahan' : 'Tambah'}
        </Button>
      </div>
    </form>
  );
}
