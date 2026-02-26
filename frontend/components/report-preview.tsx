'use client';

import { useState, useEffect } from 'react';
import { distribusiApi, penerimaanApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface ReportPreviewProps {
  filters: {
    tanggalMulai: string;
    tanggalAkhir: string;
    jenisData: 'distribusi' | 'pengumpulan';
  };
}

export function ReportPreview({ filters }: ReportPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ count: 0, nominal: 0 });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = filters.jenisData === 'distribusi'
        ? await distribusiApi.list({ page: 1, limit: 100 })
        : await penerimaanApi.list({ page: 1, limit: 100 });

      if (response.data) {
        // Filter by date range
        const filtered = response.data.filter((item: any) => {
          const itemDate = new Date(item.tanggal);
          const startDate = new Date(filters.tanggalMulai);
          const endDate = new Date(filters.tanggalAkhir);
          return itemDate >= startDate && itemDate <= endDate;
        });

        setData(filtered);

        // Calculate totals
        const totalNominal = filtered.reduce((sum: number, item: any) => sum + (item.nominal || 0), 0);
        setTotals({
          count: filtered.length,
          nominal: totalNominal,
        });
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview Laporan</CardTitle>
        <CardDescription>
          Periode: {new Date(filters.tanggalMulai).toLocaleDateString('id-ID')} - {new Date(filters.tanggalAkhir).toLocaleDateString('id-ID')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-secondary">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Transaksi</p>
                    <p className="text-3xl font-bold">{totals.count}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm opacity-90 mb-1">Total Nominal</p>
                    <p className="text-3xl font-bold">Rp {totals.nominal.toLocaleString('id-ID')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            {data.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Tanggal</TableHead>
                      {filters.jenisData === 'distribusi' ? (
                        <>
                          <TableHead>Mustahiq</TableHead>
                          <TableHead>Jenis Zakat</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead>Muzakki</TableHead>
                          <TableHead>Metode</TableHead>
                        </>
                      )}
                      <TableHead className="text-right">Nominal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.slice(0, 10).map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                        {filters.jenisData === 'distribusi' ? (
                          <>
                            <TableCell>{item.nama_mustahiq || '-'}</TableCell>
                            <TableCell>{item.jenis_zakat}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{item.nama_muzakki || '-'}</TableCell>
                            <TableCell>{item.metode_pembayaran}</TableCell>
                          </>
                        )}
                        <TableCell className="text-right font-medium">
                          Rp {(item.nominal || 0).toLocaleString('id-ID')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Tidak ada data dalam periode yang dipilih
              </div>
            )}

            {data.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                Menampilkan 10 dari {data.length} data. Laporan lengkap akan diexport dalam file Word.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
