'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { laporanApi } from '@/lib/api';
import { Loader2, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PerubahanDanaContent() {
    const searchParams = useSearchParams();
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // We use month/year if available, or extract from start_date
        const date = startDate ? new Date(startDate) : new Date();
        const bulan = date.toLocaleString('id-ID', { month: 'long' });
        const tahun = date.getFullYear();

        const fetchData = async () => {
            try {
                const res = await laporanApi.getPerubahanDana({ bulan, tahun });
                if (res.success) {
                    setData(res.data);
                } else {
                    throw new Error(res.message || 'Gagal mengambil data');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [startDate]);

    const handleDownloadPdf = async () => {
        const element = document.getElementById('pdf-content');
        if (!element) return;

        const html2pdf = (await import('html2pdf.js')).default;
        const opt = {
            margin: 10,
            filename: `Laporan-Perubahan-Dana-${data?.periode}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };

        html2pdf().set(opt).from(element).save();
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Menyiapkan Laporan...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center text-red-500 font-bold">
                Error: {error}
            </div>
        );
    }

    const { zakat, infak, periode } = data;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('id-ID').format(val);
    };

    const RenderSection = ({ title, subTitle, dataSection, startAcc }: any) => {
        const totalPenerimaan = dataSection.total_penerimaan;
        const totalPenyaluran = dataSection.total_penyaluran;
        const surplus = totalPenerimaan - totalPenyaluran;
        const saldoAkhir = dataSection.saldo_awal + surplus;

        return (
            <div className="mb-12 page-break-after">
                <div className="text-center mb-6">
                    <h1 className="font-bold text-xl uppercase">BAZNAS KOTA BATAM</h1>
                    <h2 className="font-bold text-lg uppercase">LAPORAN PERUBAHAN DANA (UNAUDITED)</h2>
                    <p className="font-medium">Per {periode}</p>
                    <hr className="my-2 border-black" />
                    <p className="text-sm italic">(Dinyatakan dalam Rupiah Penuh)</p>
                </div>

                <div className="mt-8">
                    <h3 className="font-bold border-b border-black pb-1 mb-4">{title}</h3>

                    <div className="grid grid-cols-12 gap-2 font-bold mb-2">
                        <div className="col-span-6"></div>
                        <div className="col-span-2 text-center">Acc. No.</div>
                        <div className="col-span-2 text-right">2026</div>
                        <div className="col-span-2 text-right">2025</div>
                    </div>

                    {/* Penerimaan */}
                    <div className="mb-6">
                        <p className="font-bold mb-2">Penerimaan Dana</p>
                        {dataSection.penerimaan.map((item: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 text-sm py-1">
                                <div className="col-span-6 pl-4">Penerimaan | {subTitle} | {item.nama_jenis}</div>
                                <div className="col-span-2 text-center">{startAcc + idx}</div>
                                <div className="col-span-2 text-right">{formatCurrency(item.total)}</div>
                                <div className="col-span-2 text-right">0</div>
                            </div>
                        ))}
                        <div className="grid grid-cols-12 gap-2 font-bold pt-2 border-t border-black">
                            <div className="col-span-6">Jumlah Penerimaan</div>
                            <div className="col-span-2"></div>
                            <div className="col-span-2 text-right">{formatCurrency(totalPenerimaan)}</div>
                            <div className="col-span-2 text-right">0</div>
                        </div>
                    </div>

                    {/* Penyaluran */}
                    <div className="mb-6">
                        <p className="font-bold mb-2">Penyaluran Dana</p>
                        {dataSection.penyaluran.map((item: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 text-sm py-1">
                                <div className="col-span-6 pl-4">Penyaluran | {subTitle} | {item.nama_asnaf}</div>
                                <div className="col-span-2 text-center">{startAcc + 1000 + idx}</div>
                                <div className="col-span-2 text-right">{formatCurrency(item.total)}</div>
                                <div className="col-span-2 text-right">0</div>
                            </div>
                        ))}
                        <div className="grid grid-cols-12 gap-2 font-bold pt-2 border-t border-black">
                            <div className="col-span-6">Jumlah Penyaluran</div>
                            <div className="col-span-2"></div>
                            <div className="col-span-2 text-right">{formatCurrency(totalPenyaluran)}</div>
                            <div className="col-span-2 text-right">0</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-2 font-bold py-2 mt-4 border-t-2 border-black">
                        <div className="col-span-6">Surplus (Defisit)</div>
                        <div className="col-span-2"></div>
                        <div className="col-span-2 text-right">{formatCurrency(surplus)}</div>
                        <div className="col-span-2 text-right">0</div>
                    </div>

                    <div className="grid grid-cols-12 gap-2 font-bold py-2">
                        <div className="col-span-6">Saldo {title} Awal Periode</div>
                        <div className="col-span-2"></div>
                        <div className="col-span-2 text-right">{formatCurrency(dataSection.saldo_awal)}</div>
                        <div className="col-span-2 text-right">0</div>
                    </div>

                    <div className="grid grid-cols-12 gap-2 font-bold py-2 border-t border-b-4 border-black border-double">
                        <div className="col-span-6">Saldo {title} Akhir Periode</div>
                        <div className="col-span-2"></div>
                        <div className="col-span-2 text-right">{formatCurrency(saldoAkhir)}</div>
                        <div className="col-span-2 text-right">0</div>
                    </div>
                </div>

                <div className="mt-16 flex justify-between items-end">
                    <div className="text-center text-sm">
                        <div className="h-20"></div>
                        <div className="font-bold">Habib Soleh, M.Pd.I.</div>
                        <div>Ketua</div>
                    </div>
                    <div className="text-center text-sm">
                        <div className="mb-8">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                        <div className="font-bold mb-1">PIMPINAN</div>
                        <div className="h-20"></div>
                    </div>
                    <div className="text-center text-sm">
                        <div className="h-20"></div>
                        <div className="font-bold">Achmad Fahmi, S.T.</div>
                        <div>Wakil Ketua Bidang Keuangan</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8">
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center no-print">
                <Button variant="outline" onClick={() => window.close()}>Tutup</Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadPdf}>
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" /> Cetak
                    </Button>
                </div>
            </div>

            <div id="pdf-content" className="bg-white p-12 shadow-xl mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        body { background: white; p: 0; }
                        .no-print { display: none !important; }
                        .page-break-after { page-break-after: always; }
                    }
                ` }} />

                <RenderSection title="DANA ZAKAT" subTitle="Zakat" dataSection={zakat} startAcc={4101} />
                <RenderSection title="DANA INFAK" subTitle="Infak dan Sedekah" dataSection={infak} startAcc={4201} />
            </div>
        </div>
    );
}

export default function LaporanPerubahanDanaPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Memuat parameter...</span>
            </div>
        }>
            <PerubahanDanaContent />
        </Suspense>
    );
}
