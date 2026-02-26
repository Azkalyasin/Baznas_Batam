'use client';

import { useState, useEffect, useCallback } from 'react';
import { distribusiApi, mustahiqApi, refApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface DistribusiFormProps {
  onSuccess: () => void;
  editingId: number | null;
  onCancelEdit: () => void;
}

const emptyForm = {
  tanggal: new Date().toISOString().split('T')[0],
  mustahiq_id: '',
  nama_program_id: '',
  sub_program_id: '',
  program_kegiatan_id: '',
  frekuensi_bantuan_id: '',
  jenis_zis_distribusi_id: '',
  via_id: '',
  kategori_mustahiq_id: '',
  jumlah: '',
  quantity: '',
  no_rekening: '',
  tgl_masuk_permohonan: '',
  jumlah_permohonan: '',
  tgl_survei: '',
  surveyor: '',
  no_reg_bpp: '',
  status: '',
  rekomendasi_upz: '',
  keterangan: '',
};

/**
 * Form distribusi lengkap (Tambah / Edit) — dipakai di halaman /distribusi.
 * Mencakup SEMUA kolom tabel distribusi.
 * Mustahiq dipilih via search nama/NRM/NIK.
 */
export function DistribusiForm({ onSuccess, editingId, onCancelEdit }: DistribusiFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Refs
  const [programList, setProgramList] = useState<any[]>([]);
  const [subProgramList, setSubProgramList] = useState<any[]>([]);
  const [kegiatanList, setKegiatanList] = useState<any[]>([]);
  const [frekuensiList, setFrekuensiList] = useState<any[]>([]);
  const [viaList, setViaList] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [jenisZisList, setJenisZisList] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  // Mustahiq search
  const [mustahiqSearch, setMustahiqSearch] = useState('');
  const [mustahiqResults, setMustahiqResults] = useState<any[]>([]);
  const [mustahiqSearching, setMustahiqSearching] = useState(false);
  const [selectedMustahiq, setSelectedMustahiq] = useState<{ id: number; label: string } | null>(null);

  useEffect(() => {
    loadRefs();
    if (editingId) loadEditData();
    else { setForm(emptyForm); setSelectedMustahiq(null); }
  }, [editingId]);

  useEffect(() => {
    if (form.nama_program_id) loadSubProgram(form.nama_program_id);
    else setSubProgramList([]);
  }, [form.nama_program_id]);

  const loadRefs = async () => {
    setLoadingRefs(true);
    try {
      const [progRes, kegRes, frekRes, viaRes, kategoriRes, jenisZisRes] = await Promise.allSettled([
        refApi.list('nama-program'),
        refApi.list('program-kegiatan'),
        refApi.list('frekuensi-bantuan'),
        refApi.list('via-distribusi'),
        refApi.list('kategori-mustahiq'),
        refApi.list('jenis-zis-distribusi'),
      ]);
      const g = (r: any) => r.status === 'fulfilled' && Array.isArray(r.value?.data) ? r.value.data : [];
      setProgramList(g(progRes));
      setKegiatanList(g(kegRes));
      setFrekuensiList(g(frekRes));
      setViaList(g(viaRes));
      setKategoriList(g(kategoriRes));
      setJenisZisList(g(jenisZisRes));
    } finally {
      setLoadingRefs(false);
    }
  };

  const loadSubProgram = async (programId: string) => {
    try {
      const res = await refApi.list('sub-program', { nama_program_id: programId });
      if (Array.isArray(res.data)) setSubProgramList(res.data);
      else setSubProgramList([]);
    } catch { setSubProgramList([]); }
  };

  const loadEditData = async () => {
    if (!editingId) return;
    try {
      const res = await distribusiApi.get(editingId);
      if (res.data) {
        const d: any = res.data;
        const progId = String(d.nama_program_id || '');
        if (progId) loadSubProgram(progId);

        setForm({
          tanggal: d.tanggal ? d.tanggal.split('T')[0] : new Date().toISOString().split('T')[0],
          mustahiq_id: String(d.mustahiq_id || ''),
          nama_program_id: progId,
          sub_program_id: String(d.sub_program_id || ''),
          program_kegiatan_id: String(d.program_kegiatan_id || ''),
          frekuensi_bantuan_id: String(d.frekuensi_bantuan_id || ''),
          jenis_zis_distribusi_id: String(d.jenis_zis_distribusi_id || ''),
          via_id: String(d.via_id || ''),
          kategori_mustahiq_id: String(d.kategori_mustahiq_id || ''),
          jumlah: String(d.jumlah || ''),
          quantity: String(d.quantity || ''),
          no_rekening: d.no_rekening || '',
          tgl_masuk_permohonan: d.tgl_masuk_permohonan ? d.tgl_masuk_permohonan.split('T')[0] : '',
          jumlah_permohonan: String(d.jumlah_permohonan || ''),
          tgl_survei: d.tgl_survei ? d.tgl_survei.split('T')[0] : '',
          surveyor: d.surveyor || '',
          no_reg_bpp: d.no_reg_bpp || '',
          status: d.status || '',
          rekomendasi_upz: d.rekomendasi_upz || '',
          keterangan: d.keterangan || '',
        });

        // Set selected mustahiq label for display
        const mstq = d.Mustahiq || d.mustahiq;
        if (mstq) {
          setSelectedMustahiq({ id: d.mustahiq_id, label: `${mstq.nama}${mstq.nrm ? ` – ${mstq.nrm}` : ''}` });
        } else if (d.nama_mustahik) {
          setSelectedMustahiq({ id: d.mustahiq_id, label: d.nama_mustahik });
        }
      }
    } catch { toast.error('Gagal memuat data untuk edit'); }
  };

  const handleMustahiqSearch = useCallback(async () => {
    if (!mustahiqSearch.trim()) { setMustahiqResults([]); return; }
    setMustahiqSearching(true);
    try {
      const res = await mustahiqApi.list({ q: mustahiqSearch, page: 1, limit: 10 });
      const d: any = res.data;
      const arr = Array.isArray(d) ? d : d?.data ?? [];
      setMustahiqResults(arr);
    } catch { setMustahiqResults([]); }
    finally { setMustahiqSearching(false); }
  }, [mustahiqSearch]);

  const selectMustahiq = (m: any) => {
    setSelectedMustahiq({ id: m.id, label: `${m.nama}${m.nrm ? ` – ${m.nrm}` : ''}${m.nik ? ` / ${m.nik}` : ''}` });
    setForm((p) => ({ ...p, mustahiq_id: String(m.id) }));
    setMustahiqSearch('');
    setMustahiqResults([]);
  };

  const set = (f: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!form.mustahiq_id) { toast.error('Field "Mustahiq" wajib dipilih'); setIsLoading(false); return; }
    if (!form.jumlah || parseFloat(form.jumlah) <= 0) { toast.error('Field "Jumlah" harus lebih dari 0'); setIsLoading(false); return; }

    const optNum = (v: string) => v ? parseInt(v) : undefined;
    const optFloat = (v: string) => v ? parseFloat(v) : undefined;
    const optStr = (v: string) => v || undefined;

    try {
      const payload: any = {
        tanggal: form.tanggal,
        mustahiq_id: parseInt(form.mustahiq_id),
        jumlah: parseFloat(form.jumlah),
        nama_program_id: optNum(form.nama_program_id),
        sub_program_id: optNum(form.sub_program_id),
        program_kegiatan_id: optNum(form.program_kegiatan_id),
        frekuensi_bantuan_id: optNum(form.frekuensi_bantuan_id),
        jenis_zis_distribusi_id: optNum(form.jenis_zis_distribusi_id),
        via_id: optNum(form.via_id),
        kategori_mustahiq_id: optNum(form.kategori_mustahiq_id),
        quantity: optNum(form.quantity),
        no_rekening: optStr(form.no_rekening),
        tgl_masuk_permohonan: optStr(form.tgl_masuk_permohonan),
        jumlah_permohonan: optFloat(form.jumlah_permohonan),
        tgl_survei: optStr(form.tgl_survei),
        surveyor: optStr(form.surveyor),
        no_reg_bpp: optStr(form.no_reg_bpp),
        status: optStr(form.status) as any,
        rekomendasi_upz: optStr(form.rekomendasi_upz),
        keterangan: optStr(form.keterangan),
      };
      if (editingId) await distribusiApi.update(editingId, payload);
      else await distribusiApi.create(payload);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan data');
    } finally {
      setIsLoading(false);
    }
  };

  const Section = ({ title }: { title: string }) => (
    <div className="md:col-span-2 pt-3 pb-1 border-b">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
    </div>
  );

  const Sel = ({ label, field, items, disabled, placeholder }: {
    label: string; field: keyof typeof emptyForm;
    items: any[]; disabled?: boolean; placeholder: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={form[field] as string}
        onValueChange={(v) => setForm((p) => ({ ...p, [field]: v }))}
        disabled={disabled || loadingRefs}>
        <SelectTrigger>
          <SelectValue placeholder={loadingRefs ? 'Memuat...' : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((it) => <SelectItem key={it.id} value={String(it.id)}>{it.nama}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* ── INFORMASI DASAR ── */}
        <Section title="Informasi Dasar" />

        {/* Tanggal */}
        <div className="space-y-2">
          <Label htmlFor="tanggal">Tanggal Distribusi <span className="text-destructive">*</span></Label>
          <Input id="tanggal" type="date" required value={form.tanggal} onChange={set('tanggal')} />
        </div>

        {/* Mustahiq search */}
        <div className="space-y-2 md:col-span-2">
          <Label>Mustahiq <span className="text-destructive">*</span></Label>
          {selectedMustahiq ? (
            <div className="flex items-center gap-2">
              <Input value={selectedMustahiq.label} readOnly className="bg-muted flex-1" />
              <Button type="button" size="sm" variant="ghost"
                onClick={() => { setSelectedMustahiq(null); setForm((p) => ({ ...p, mustahiq_id: '' })); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Cari nama / NRM / NIK mustahiq..."
                  value={mustahiqSearch}
                  onChange={(e) => setMustahiqSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleMustahiqSearch())}
                />
                <Button type="button" variant="outline" onClick={handleMustahiqSearch} disabled={mustahiqSearching}>
                  {mustahiqSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              {mustahiqResults.length > 0 && (
                <div className="border rounded-md divide-y max-h-40 overflow-y-auto shadow-sm bg-background">
                  {mustahiqResults.map((m) => (
                    <button key={m.id} type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => selectMustahiq(m)}>
                      <span className="font-medium">{m.nama}</span>
                      {m.nrm && <span className="text-muted-foreground ml-2 text-xs">NRM: {m.nrm}</span>}
                      {m.nik && <span className="text-muted-foreground ml-2 text-xs">NIK: {m.nik}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── PROGRAM ── */}
        <Section title="Program Distribusi" />

        {/* Nama Program */}
        <div className="space-y-2">
          <Label>Program</Label>
          <Select value={form.nama_program_id}
            onValueChange={(v) => setForm((p) => ({ ...p, nama_program_id: v, sub_program_id: '' }))}
            disabled={loadingRefs}>
            <SelectTrigger><SelectValue placeholder={loadingRefs ? 'Memuat...' : 'Pilih program'} /></SelectTrigger>
            <SelectContent>
              {programList.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Sub Program */}
        <div className="space-y-2">
          <Label>Sub Program</Label>
          <Select value={form.sub_program_id}
            onValueChange={(v) => setForm((p) => ({ ...p, sub_program_id: v }))}
            disabled={!form.nama_program_id || subProgramList.length === 0}>
            <SelectTrigger>
              <SelectValue placeholder={!form.nama_program_id ? 'Pilih program dulu' : subProgramList.length === 0 ? 'Tidak ada sub-program' : 'Pilih sub-program'} />
            </SelectTrigger>
            <SelectContent>
              {subProgramList.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.nama}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Sel label="Program Kegiatan" field="program_kegiatan_id" items={kegiatanList} placeholder="Pilih kegiatan" />
        <Sel label="Frekuensi Bantuan" field="frekuensi_bantuan_id" items={frekuensiList} placeholder="Pilih frekuensi" />

        {/* ── JUMLAH & JENIS ── */}
        <Section title="Jumlah & Jenis Bantuan" />

        <div className="space-y-2">
          <Label htmlFor="jumlah">Jumlah Penyaluran (Rp) <span className="text-destructive">*</span></Label>
          <Input id="jumlah" type="number" min="0" step="0.01" placeholder="Nominal penyaluran"
            value={form.jumlah} onChange={set('jumlah')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Kuantitas</Label>
          <Input id="quantity" type="number" min="0" placeholder="Jumlah unit/item"
            value={form.quantity} onChange={set('quantity')} />
        </div>

        <Sel label="Jenis ZIS Distribusi" field="jenis_zis_distribusi_id" items={jenisZisList} placeholder="Pilih jenis ZIS" />
        <Sel label="Kategori Mustahiq" field="kategori_mustahiq_id" items={kategoriList} placeholder="Pilih kategori" />
        <Sel label="Via Pembayaran" field="via_id" items={viaList} placeholder="Pilih via" />

        <div className="space-y-2">
          <Label htmlFor="no_rekening">No. Rekening</Label>
          <Input id="no_rekening" placeholder="Nomor rekening (jika transfer)" maxLength={50}
            value={form.no_rekening} onChange={set('no_rekening')} />
        </div>

        {/* ── PERMOHONAN & SURVEI ── */}
        <Section title="Permohonan & Survei" />

        <div className="space-y-2">
          <Label htmlFor="no_reg_bpp">No. Reg BPP</Label>
          <Input id="no_reg_bpp" placeholder="No. Reg BPP" maxLength={12}
            value={form.no_reg_bpp} onChange={set('no_reg_bpp')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tgl_masuk_permohonan">Tgl. Masuk Permohonan</Label>
          <Input id="tgl_masuk_permohonan" type="date"
            value={form.tgl_masuk_permohonan} onChange={set('tgl_masuk_permohonan')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jumlah_permohonan">Jumlah Permohonan (Rp)</Label>
          <Input id="jumlah_permohonan" type="number" min="0" step="0.01"
            placeholder="Jumlah yang dimohonkan"
            value={form.jumlah_permohonan} onChange={set('jumlah_permohonan')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tgl_survei">Tgl. Survei</Label>
          <Input id="tgl_survei" type="date"
            value={form.tgl_survei} onChange={set('tgl_survei')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="surveyor">Nama Surveyor</Label>
          <Input id="surveyor" placeholder="Nama surveyor" maxLength={100}
            value={form.surveyor} onChange={set('surveyor')} />
        </div>

        <div className="space-y-2">
          <Label>Status Permohonan</Label>
          <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
            <SelectTrigger><SelectValue placeholder="Menunggu Persetujuan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="diterima">Diterima</SelectItem>
              <SelectItem value="ditolak">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── LAINNYA ── */}
        <Section title="Lainnya" />

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="rekomendasi_upz">Rekomendasi UPZ</Label>
          <Textarea id="rekomendasi_upz" placeholder="Nama UPZ yang merekomendasikan" rows={2}
            value={form.rekomendasi_upz} onChange={set('rekomendasi_upz')} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="keterangan">Keterangan</Label>
          <Textarea id="keterangan" placeholder="Catatan tambahan" rows={2}
            value={form.keterangan} onChange={set('keterangan')} />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isLoading}>Batal</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : editingId ? 'Simpan Perubahan' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
}
