'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload, Loader2, CheckCircle2, FileUp } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function MigrasiExcelPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [dataType, setDataType] = useState<'mustahiq' | 'muzakki' | null>(null);

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFile = async (file: File) => {
    setError(null);
    setSuccess(null);
    setPreviewData([]);

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setError('File harus berformat .xlsx, .xls, atau .csv');
      return;
    }

    try {
      setIsLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        setError('File Excel kosong');
        return;
      }

      setFileName(file.name);
      setPreviewData(data.slice(0, 5)); // Show first 5 rows

      // Auto-detect data type
      const firstRow = data[0] as any;
      if (firstRow.nrm || firstRow.nama_mustahiq) {
        setDataType('mustahiq');
      } else if (firstRow.npwz || firstRow.nama_muzakki) {
        setDataType('muzakki');
      }

      setSuccess(`${data.length} baris data berhasil dimuat dari file`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membaca file Excel');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      setError('Tidak ada data untuk diimport');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate import - dalam implementasi real, data akan dikirim ke backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(`${previewData.length}+ baris data berhasil diimport ke sistem`);
      setPreviewData([]);
      setFileName('');
      setDataType(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengimport data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Migrasi Data Excel</h1>
          <p className="text-muted-foreground mt-1">
            Import data Mustahiq atau Muzakki dari file Excel
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-900">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upload File Excel</CardTitle>
            <CardDescription>
              Drag & drop atau klik untuk memilih file Excel (.xlsx, .xls, .csv)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background hover:border-primary/50'
              }`}
            >
              <input
                type="file"
                id="file-input"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                disabled={isLoading}
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Drag file Excel ke sini</p>
                    <p className="text-sm text-muted-foreground">
                      atau klik untuk memilih file
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {previewData.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  Preview Data
                </CardTitle>
                <CardDescription>
                  File: {fileName} ({previewData.length}+ baris)
                  {dataType && ` - Tipe: ${dataType === 'mustahiq' ? 'Mustahiq' : 'Muzakki'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(previewData[0] || {}).map((key) => (
                          <TableHead key={key} className="text-xs">
                            {key}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.map((row, idx) => (
                        <TableRow key={idx}>
                          {Object.values(row).map((value, i) => (
                            <TableCell key={i} className="text-xs">
                              {String(value).length > 50
                                ? String(value).substring(0, 50) + '...'
                                : String(value)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPreviewData([]);
                      setFileName('');
                      setDataType(null);
                    }}
                    disabled={isLoading}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleImport} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengimport...
                      </>
                    ) : (
                      `Import ${previewData.length} Baris`
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Format File Excel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Format Mustahiq:</h3>
              <div className="bg-muted p-3 rounded text-sm font-mono overflow-x-auto">
                <p>nrm | nama | nik | no_hp | alamat | kecamatan_id | kelurahan_id | asnaf_id</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Format Muzakki:</h3>
              <div className="bg-muted p-3 rounded text-sm font-mono overflow-x-auto">
                <p>npwz | nama | nik | no_hp | jenis_muzakki_id | jenis_upz_id | kecamatan_id</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>• File harus memiliki header di baris pertama</p>
              <p>• Format yang didukung: .xlsx, .xls, .csv</p>
              <p>• Maksimal: 10.000 baris per file</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
