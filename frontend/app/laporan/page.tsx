'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle, Loader2, Printer, X,
  FileText, BarChart2, TrendingUp, CalendarDays, Users, BookOpen
} from 'lucide-react';

type DateMode = 'single' | 'range';

interface ReportType {
  value: string;
  label: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
  dateMode: DateMode;
  dateLabel?: string;
}

const REPORT_GROUPS: { group: string; reports: ReportType[] }[] = [
  {
    group: 'Laporan Keuangan',
    reports: [
      {
        value: 'perubahan_dana',
        label: 'Laporan Perubahan Dana',
        description: 'Ringkasan perubahan saldo dana Zakat, Infak & Amil',
        icon: TrendingUp,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-500',
        dateMode: 'single',
        dateLabel: 'Per Tanggal',
      },
    ],
  },
  {
    group: 'Kas Keluar',
    reports: [
      {
        value: 'kas_keluar_program',
        label: 'Kas Keluar – Program',
        description: 'Rekapitulasi penyaluran berdasarkan program kegiatan',
        icon: BookOpen,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        dateMode: 'range',
      },
      {
        value: 'kas_keluar_asnaf',
        label: 'Kas Keluar – Asnaf',
        description: 'Rekapitulasi penyaluran berdasarkan kategori asnaf',
        icon: Users,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-500',
        dateMode: 'range',
      },
      {
        value: 'kas_keluar_harian',
        label: 'Kas Keluar – Harian',
        description: 'Rincian penyaluran untuk satu tanggal tertentu',
        icon: CalendarDays,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        dateMode: 'single',
        dateLabel: 'Tanggal',
      },
    ],
  },
  {
    group: 'Data Mentah',
    reports: [
      {
        value: 'distribusi',
        label: 'Data Distribusi',
        description: 'Export raw data distribusi dalam format dokumen',
        icon: BarChart2,
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-500',
        dateMode: 'range',
      },
      {
        value: 'pengumpulan',
        label: 'Data Pengumpulan',
        description: 'Export raw data penerimaan dalam format dokumen',
        icon: FileText,
        color: 'text-teal-600',
        bg: 'bg-teal-50',
        border: 'border-teal-500',
        dateMode: 'range',
      },
    ],
  },
];

const ALL_REPORTS: ReportType[] = REPORT_GROUPS.flatMap(g => g.reports);

export default function LaporanPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const getLocalYMD = (date: Date) =>
    date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');

  const [popupReport, setPopupReport] = useState<ReportType | null>(null);
  const [tanggalMulai, setTanggalMulai] = useState(getLocalYMD(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [tanggalAkhir, setTanggalAkhir] = useState(getLocalYMD(today));
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupReport(null);
      }
    };
    if (popupReport) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [popupReport]);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const isRange = popupReport?.dateMode === 'range';

  const handleExport = async () => {
    if (!popupReport) return;
    setIsLoading(true);
    setError(null);

    try {
      const startParam = isRange ? tanggalMulai : tanggalAkhir;
      const endParam = tanggalAkhir;

      if (['kas_keluar_program', 'kas_keluar_asnaf', 'kas_keluar_harian', 'perubahan_dana'].includes(popupReport.value)) {
        const path = popupReport.value === 'perubahan_dana' ? '/laporan/perubahan-dana' : '/laporan/print';
        const url = `${path}?start_date=${startParam}&end_date=${endParam}&jenis_data=${popupReport.value}`;
        window.open(url, '_blank');
        setPopupReport(null);
        setIsLoading(false);
        return;
      }

      const { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, AlignmentType, BorderStyle } = await import('docx');
      const defaultBorder = { style: BorderStyle.SINGLE, size: 1, color: '000000' };
      const cellBorders = { top: defaultBorder, bottom: defaultBorder, left: defaultBorder, right: defaultBorder };

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'LAPORAN BAZNAS BATAM', bold: true, size: 28 })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `Periode: ${new Date(startParam).toLocaleDateString('id-ID')} - ${new Date(endParam).toLocaleDateString('id-ID')}`, size: 22 })],
            }),
            new Paragraph({ text: '' }),
            new Table({
              rows: [
                new TableRow({ children: [
                  new TableCell({ children: [new Paragraph({ text: 'Item' })], borders: cellBorders }),
                  new TableCell({ children: [new Paragraph({ text: 'Jumlah' })], borders: cellBorders }),
                ]}),
                new TableRow({ children: [
                  new TableCell({ children: [new Paragraph({ text: 'Total Transaksi' })], borders: cellBorders }),
                  new TableCell({ children: [new Paragraph({ text: '0' })], borders: cellBorders }),
                ]}),
              ],
              width: { size: 100, type: 'pct' as any },
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `Dihasilkan: ${new Date().toLocaleString('id-ID')}`, italics: true, size: 20 })],
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan-BAZNAS-${popupReport.value}-${today.toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setPopupReport(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengekspor laporan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Laporan &amp; Export</h1>
          <p className="text-muted-foreground mt-1">Klik jenis laporan untuk memilih tanggal dan cetak PDF</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Grouped Report Cards */}
        <div className="space-y-6">
          {REPORT_GROUPS.map((group) => (
            <div key={group.group}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                {group.group}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.reports.map((report) => {
                  const Icon = report.icon;
                  return (
                    <button
                      key={report.value}
                      onClick={() => setPopupReport(report)}
                      className="text-left rounded-xl border-2 border-gray-200 bg-white p-4 
                        transition-all duration-150 hover:shadow-md hover:border-gray-300 focus:outline-none active:scale-[0.98]"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${report.bg} shrink-0`}>
                          <Icon className={`h-4 w-4 ${report.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-800">{report.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{report.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup Modal */}
      {popupReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            ref={popupRef}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Popup Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${popupReport.bg}`}>
                  <popupReport.icon className={`h-4 w-4 ${popupReport.color}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{popupReport.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {isRange ? 'Pilih rentang tanggal' : `Pilih ${popupReport.dateLabel || 'tanggal'}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPopupReport(null)}
                className="text-muted-foreground hover:text-foreground transition-colors ml-2 mt-0.5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Date Inputs */}
            <div className="space-y-3 mb-5">
              {isRange && (
                <div className="space-y-1.5">
                  <Label htmlFor="popup-mulai" className="text-xs">Tanggal Mulai</Label>
                  <Input
                    id="popup-mulai"
                    type="date"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="popup-akhir" className="text-xs">
                  {isRange ? 'Tanggal Akhir' : (popupReport.dateLabel || 'Tanggal')}
                </Label>
                <Input
                  id="popup-akhir"
                  type="date"
                  value={tanggalAkhir}
                  onChange={(e) => setTanggalAkhir(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            {/* Action */}
            <Button onClick={handleExport} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Printer className="mr-2 h-4 w-4" />
                  Cetak PDF
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
