'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Download, Eye } from 'lucide-react';
import { ReportPreview } from '@/components/report-preview';

export default function LaporanPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [filters, setFilters] = useState({
    tanggalMulai: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    tanggalAkhir: new Date().toISOString().split('T')[0],
    jenisData: 'distribusi',
  });

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { Document, Packer, Paragraph, Table, TableCell, TableRow, AlignmentType, BorderStyle } = await import('docx');

      // Create document structure
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: 'LAPORAN BAZNAS BATAM',
              alignment: AlignmentType.CENTER,
              bold: true,
              size: 28,
            }),
            new Paragraph({
              text: 'Sistem Manajemen Dana Zakat, Infaq, dan Sedekah',
              alignment: AlignmentType.CENTER,
              size: 20,
            }),
            new Paragraph({
              text: '',
            }),
            new Paragraph({
              text: `Periode: ${new Date(filters.tanggalMulai).toLocaleDateString('id-ID')} - ${new Date(filters.tanggalAkhir).toLocaleDateString('id-ID')}`,
              alignment: AlignmentType.CENTER,
              size: 22,
            }),
            new Paragraph({
              text: `Jenis Data: ${filters.jenisData === 'distribusi' ? 'Distribusi' : 'Pengumpulan'}`,
              alignment: AlignmentType.CENTER,
              size: 22,
            }),
            new Paragraph({
              text: '',
            }),
            new Paragraph({
              text: '',
            }),

            // Summary Section
            new Paragraph({
              text: 'RINGKASAN DATA',
              bold: true,
              size: 24,
            }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: 'Item' })],
                      borders: { all: { color: '000000', space: 1, style: BorderStyle.SINGLE } },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'Jumlah' })],
                      borders: { all: { color: '000000', space: 1, style: BorderStyle.SINGLE } },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: 'Total Transaksi' })],
                      borders: { all: { color: '000000', space: 1, style: BorderStyle.SINGLE } },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: '0' })],
                      borders: { all: { color: '000000', space: 1, style: BorderStyle.SINGLE } },
                    }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: 'Total Nominal' })],
                      borders: { all: { color: '000000', space: 1, style: BorderStyle.SINGLE } },
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'Rp 0' })],
                      borders: { all: { color: '000000', space: 1, style: BorderStyle.SINGLE } },
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: 'pct' },
            }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: '' }),

            // Footer
            new Paragraph({
              text: `Dihasilkan: ${new Date().toLocaleString('id-ID')}`,
              alignment: AlignmentType.CENTER,
              italics: true,
              size: 20,
            }),
          ],
        }],
      });

      // Generate and download
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan-BAZNAS-${filters.jenisData}-${new Date().toISOString().split('T')[0]}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengekspor laporan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Laporan & Export</h1>
          <p className="text-muted-foreground mt-1">
            Buat laporan komprehensif dan export ke file Word
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Filter Laporan</CardTitle>
            <CardDescription>
              Tentukan parameter laporan yang ingin dibuat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="tanggal-mulai">Tanggal Mulai</Label>
                <Input
                  id="tanggal-mulai"
                  type="date"
                  value={filters.tanggalMulai}
                  onChange={(e) => setFilters({ ...filters, tanggalMulai: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal-akhir">Tanggal Akhir</Label>
                <Input
                  id="tanggal-akhir"
                  type="date"
                  value={filters.tanggalAkhir}
                  onChange={(e) => setFilters({ ...filters, tanggalAkhir: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenis-data">Jenis Data</Label>
                <Select value={filters.jenisData} onValueChange={(v) => setFilters({ ...filters, jenisData: v })}>
                  <SelectTrigger id="jenis-data">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distribusi">Distribusi</SelectItem>
                    <SelectItem value="pengumpulan">Pengumpulan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                disabled={isLoading}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button onClick={handleExport} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengekspor...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export ke Word
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {showPreview && (
          <ReportPreview filters={filters} />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informasi Laporan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Laporan mencakup ringkasan data dalam periode yang dipilih</p>
            <p>• Format export: Microsoft Word (.docx)</p>
            <p>• Laporan dapat diedit lebih lanjut di Microsoft Word</p>
            <p>• Data yang ditampilkan: nomor transaksi, nominal, tanggal, dan keterangan</p>
            <p>• Laporan mencakup total transaksi dan total nominal</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
