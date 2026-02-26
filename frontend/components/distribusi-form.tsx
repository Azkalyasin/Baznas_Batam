'use client';

import { useState, useEffect } from 'react';
import { distribusiApi, mustahiqApi, refApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface DistribusiFormProps {
  onSuccess: () => void;
  editingId: number | null;
  onCancelEdit: () => void;
}

export function DistribusiForm({ onSuccess, editingId, onCancelEdit }: DistribusiFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mustahiqList, setMustahiqList] = useState<any[]>([]);
  const [programList, setProgramList] = useState<any[]>([]);    // nama-program
  const [subProgramList, setSubProgramList] = useState<any[]>([]); // sub-program
  const [viaList, setViaList] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    mustahiq_id: '',
    nama_program_id: '',
    sub_program_id: '',
    jumlah: '',
    via_id: '',
    keterangan: '',
  });

  useEffect(() => {
    loadRefs();
    if (editingId) loadEditData();
    else resetForm();
  }, [editingId]);

  // Ketika nama_program berubah, load sub-program-nya
  useEffect(() => {
    if (formData.nama_program_id) {
      loadSubProgram(formData.nama_program_id);
    } else {
      setSubProgramList([]);
    }
  }, [formData.nama_program_id]);

  const resetForm = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      mustahiq_id: '', nama_program_id: '', sub_program_id: '',
      jumlah: '', via_id: '', keterangan: '',
    });
  };

  const loadRefs = async () => {
    setLoadingRefs(true);
    try {
      const [muRes, progRes, viaRes] = await Promise.all([
        mustahiqApi.list({ page: 1, limit: 200 }),
        refApi.list('nama-program'),
        refApi.list('via'),
      ]);
      const muData: any = muRes.data;
      setMustahiqList(Array.isArray(muData) ? muData : muData?.data ?? []);
      if (Array.isArray(progRes.data)) setProgramList(progRes.data);
      if (Array.isArray(viaRes.data)) setViaList(viaRes.data);
    } catch (err) {
      console.error('Failed to load refs:', err);
    } finally {
      setLoadingRefs(false);
    }
  };

  const loadSubProgram = async (programId: string) => {
    try {
      const res = await refApi.list('sub-program', { nama_program_id: programId });
      if (Array.isArray(res.data)) setSubProgramList(res.data);
      else setSubProgramList([]);
    } catch {
      setSubProgramList([]);
    }
  };

  const loadEditData = async () => {
    if (!editingId) return;
    try {
      const res = await distribusiApi.get(editingId);
      if (res.data) {
        const d: any = res.data;
        const progId = String(d.nama_program_id || '');
        setFormData({
          tanggal: d.tanggal ? d.tanggal.split('T')[0] : new Date().toISOString().split('T')[0],
          mustahiq_id: String(d.mustahiq_id || ''),
          nama_program_id: progId,
          sub_program_id: String(d.sub_program_id || ''),
          jumlah: String(d.jumlah || ''),
          via_id: String(d.via_id || ''),
          keterangan: d.keterangan || '',
        });
        if (progId) loadSubProgram(progId);
      }
    } catch (err) {
      setError('Gagal memuat data untuk edit');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.mustahiq_id) { setError('Pilih Mustahiq terlebih dahulu'); setIsLoading(false); return; }
    if (!formData.jumlah || parseInt(formData.jumlah) <= 0) { setError('Jumlah harus lebih dari 0'); setIsLoading(false); return; }

    try {
      const payload: any = {
        tanggal: formData.tanggal,
        mustahiq_id: parseInt(formData.mustahiq_id),
        jumlah: parseInt(formData.jumlah),
      };
      if (formData.nama_program_id) payload.nama_program_id = parseInt(formData.nama_program_id);
      if (formData.sub_program_id) payload.sub_program_id = parseInt(formData.sub_program_id);
      if (formData.via_id) payload.via_id = parseInt(formData.via_id);
      if (formData.keterangan) payload.keterangan = formData.keterangan;

      if (editingId) {
        await distribusiApi.update(editingId, payload);
      } else {
        await distribusiApi.create(payload);
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

        {/* Mustahiq */}
        <div className="space-y-2">
          <Label htmlFor="mustahiq">Mustahiq *</Label>
          <Select value={formData.mustahiq_id} onValueChange={(v) => setFormData({ ...formData, mustahiq_id: v })}>
            <SelectTrigger id="mustahiq" disabled={loadingRefs}>
              <SelectValue placeholder={loadingRefs ? 'Memuat...' : 'Pilih Mustahiq'} />
            </SelectTrigger>
            <SelectContent>
              {mustahiqList.map((m) => (
                <SelectItem key={m.id} value={m.id.toString()}>{m.nama} {m.nrm ? `(${m.nrm})` : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Program Distribusi */}
        <div className="space-y-2">
          <Label htmlFor="nama_program">Program Distribusi</Label>
          <Select value={formData.nama_program_id} onValueChange={(v) => setFormData({ ...formData, nama_program_id: v, sub_program_id: '' })}>
            <SelectTrigger id="nama_program" disabled={loadingRefs}>
              <SelectValue placeholder="Pilih program" />
            </SelectTrigger>
            <SelectContent>
              {programList.length > 0
                ? programList.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.nama}</SelectItem>)
                : <SelectItem value="" disabled>Tidak ada program tersedia</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {/* Sub Program */}
        <div className="space-y-2">
          <Label htmlFor="sub_program">Sub Program</Label>
          <Select value={formData.sub_program_id} onValueChange={(v) => setFormData({ ...formData, sub_program_id: v })}
            disabled={!formData.nama_program_id || subProgramList.length === 0}>
            <SelectTrigger id="sub_program">
              <SelectValue placeholder={!formData.nama_program_id ? 'Pilih program dulu' : subProgramList.length === 0 ? 'Tidak ada sub program' : 'Pilih sub program'} />
            </SelectTrigger>
            <SelectContent>
              {subProgramList.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>{s.nama}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Via Pembayaran */}
        <div className="space-y-2">
          <Label htmlFor="via">Via Pembayaran</Label>
          <Select value={formData.via_id} onValueChange={(v) => setFormData({ ...formData, via_id: v })}>
            <SelectTrigger id="via" disabled={loadingRefs}>
              <SelectValue placeholder="Pilih via" />
            </SelectTrigger>
            <SelectContent>
              {viaList.length > 0
                ? viaList.map((v) => <SelectItem key={v.id} value={v.id.toString()}>{v.nama}</SelectItem>)
                : [
                    <SelectItem key="1" value="1">Tunai</SelectItem>,
                    <SelectItem key="2" value="2">Transfer</SelectItem>,
                  ]}
            </SelectContent>
          </Select>
        </div>

        {/* Jumlah */}
        <div className="space-y-2">
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
