import { Document, Packer, Paragraph, Table, TableCell, TableRow, AlignmentType, BorderStyle, WidthType, TextRun, Header, HeadingLevel } from 'docx';
import { laporanApi } from '@/lib/api';

export async function exportLaporanDocx(filters: any) {
    const { tanggalMulai, tanggalAkhir, jenisData } = filters;

    let data: any[] = [];
    let title = 'LAPORAN KAS KELUAR';
    let subtitle = '';
    let kode = '';

    if (jenisData === 'kas_keluar_program') {
        const res = await laporanApi.getDistribusiByProgram({ start_date: tanggalMulai, end_date: tanggalAkhir });
        if (res.success && res.data) data = res.data;
        subtitle = 'Berdasarkan Program Kegiatan\n(701/SIO-LAP)';
    } else if (jenisData === 'kas_keluar_asnaf') {
        const res = await laporanApi.getDistribusiByAsnaf({ start_date: tanggalMulai, end_date: tanggalAkhir });
        if (res.success && res.data) data = res.data;
        subtitle = 'Berdasarkan ASHNAF\n(702/SIO-LAP)';
    } else if (jenisData === 'kas_keluar_harian') {
        const res = await laporanApi.getDistribusiHarian({ start_date: tanggalMulai, end_date: tanggalAkhir });
        if (res.success && res.data) data = res.data;
        subtitle = `Hari ${new Date(tanggalMulai).toLocaleDateString('id-ID', { weekday: 'long' })} Tanggal ${new Date(tanggalMulai).toLocaleDateString('id-ID')}\n(002/SIO-LAP)`;
    }

    // BAZNAS Header Elements (to be put in the actual document Header to repeat on every page)
    const headerTitleElements: Paragraph[] = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: 'BAZNAS Kota Batam', bold: true, size: 28 }),
            ],
            spacing: { after: 200 }
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun({ text: title, bold: true, size: 36 }),
            ],
            spacing: { after: 200 }
        })
    ];

    subtitle.split('\n').forEach(line => {
        headerTitleElements.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: line, bold: true, size: 24 }),
                ],
                spacing: { after: 100 }
            })
        );
    });

    const pageContentSection: (Paragraph | Table)[] = [];

    if (jenisData === 'kas_keluar_harian') {
        // Generate Harian
        pageContentSection.push(new Paragraph({ text: '', spacing: { after: 400 } }));

        let totalTunai = 0;
        let totalLain = 0;

        const tableRows = [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ text: 'No', alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: 'NRM / No Trans', alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Nama', alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Penyaluran Dana (Rp)', alignment: AlignmentType.CENTER })] }),
                    new TableCell({ children: [new Paragraph({ text: 'Penggunaan Dana (Rp)', alignment: AlignmentType.CENTER })] }),
                ]
            })
        ];

        data.forEach((item, index) => {
            // Assuming all is 'Penyaluran Dana' for simplicity based on mockup
            const val = Number(item.jumlah) || 0;
            totalTunai += val;

            tableRows.push(
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: String(index + 1), alignment: AlignmentType.CENTER })] }),
                        new TableCell({ children: [new Paragraph({ text: item.nrm || '-' })] }),
                        new TableCell({ children: [new Paragraph({ text: item.nama_mustahik || item.ref_nama_entita?.nama || '-' })] }),
                        new TableCell({ children: [new Paragraph({ text: val.toLocaleString('id-ID'), alignment: AlignmentType.RIGHT })] }),
                        new TableCell({ children: [new Paragraph({ text: '' })] }),
                    ]
                })
            );
        });

        tableRows.push(
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Jumlah (Rp)', bold: true })], alignment: AlignmentType.RIGHT })], columnSpan: 3 }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: totalTunai.toLocaleString('id-ID'), bold: true })], alignment: AlignmentType.RIGHT })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: totalLain.toLocaleString('id-ID'), bold: true })], alignment: AlignmentType.RIGHT })] }),
                ]
            })
        );

        const table = new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
        });

        pageContentSection.push(table);

        pageContentSection.push(new Paragraph({ text: '', spacing: { before: 400, after: 200 } }));

        const summaryTable = new Table({
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pengeluaran Tunai', bold: true })] })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Rp', bold: true })] })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: totalTunai.toLocaleString('id-ID'), bold: true })], alignment: AlignmentType.RIGHT })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pengeluaran Lain', bold: true })] })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Rp', bold: true })] })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: totalLain.toLocaleString('id-ID'), bold: true })], alignment: AlignmentType.RIGHT })], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } })
                    ]
                }),
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Pengeluaran Total', bold: true })] })], borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Rp', bold: true })] })], borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (totalTunai + totalLain).toLocaleString('id-ID'), bold: true })], alignment: AlignmentType.RIGHT })], borders: { top: { style: BorderStyle.SINGLE }, bottom: { style: BorderStyle.SINGLE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } })
                    ]
                }),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
        });

        pageContentSection.push(summaryTable);
    } else {
        // Generate Program / Asnaf
        pageContentSection.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: `${new Date(tanggalMulai).toLocaleDateString('id-ID')} s/d ${new Date(tanggalAkhir).toLocaleDateString('id-ID')}`, bold: true, size: 20 }),
                ],
                spacing: { after: 400 }
            })
        );

        // Grouping logic
        const groups: Record<string, any[]> = {};
        data.forEach(item => {
            let gName = 'Lainnya';
            if (jenisData === 'kas_keluar_program') {
                const pk = item.ref_program_kegiatan?.nama || '';
                const sp = item.ref_sub_program?.nama || '';
                const np = item.ref_nama_program?.nama || '';
                gName = `${item.ref_program_kegiatan?.kode || ''} | ${np} | ${sp} | ${pk}`;
            } else if (jenisData === 'kas_keluar_asnaf') {
                gName = item.ref_asnaf?.nama || 'Tanpa Asnaf';
            }
            if (!groups[gName]) groups[gName] = [];
            groups[gName].push(item);
        });

        Object.entries(groups).forEach(([groupName, items], index) => {
            if (jenisData === 'kas_keluar_program') {
                const [kode, ...namaParts] = groupName.split(' | ');
                pageContentSection.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Kode   : ${kode}`, bold: true, size: 24 })
                        ],
                        spacing: { before: 200 },
                        pageBreakBefore: index > 0
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Nama  : ${namaParts.join(' | ')}`, bold: true, size: 24 })
                        ],
                        spacing: { after: 200 }
                    })
                );
            } else {
                pageContentSection.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: groupName, bold: true, size: 24 })
                        ],
                        spacing: { before: 200, after: 200 },
                        pageBreakBefore: index > 0
                    })
                );
            }

            const tableRows = [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true })], alignment: AlignmentType.CENTER })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tanggal', bold: true })], alignment: AlignmentType.CENTER })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'NRM', bold: true })], alignment: AlignmentType.CENTER })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Nama', bold: true })], alignment: AlignmentType.CENTER })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Alamat', bold: true })], alignment: AlignmentType.CENTER })] }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Jumlah', bold: true })], alignment: AlignmentType.CENTER })] }),
                    ]
                })
            ];

            let subtotal = 0;
            items.forEach((item, index) => {
                const val = Number(item.jumlah) || 0;
                subtotal += val;
                tableRows.push(
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ text: String(index + 1), alignment: AlignmentType.CENTER })] }),
                            new TableCell({ children: [new Paragraph({ text: new Date(item.tanggal).toLocaleDateString('id-ID'), alignment: AlignmentType.CENTER })] }),
                            new TableCell({ children: [new Paragraph({ text: item.nrm || '-' })] }),
                            new TableCell({ children: [new Paragraph({ text: item.nama_mustahik || '-' })] }),
                            new TableCell({ children: [new Paragraph({ text: item.alamat || '-' })] }),
                            new TableCell({ children: [new Paragraph({ text: val.toLocaleString('id-ID'), alignment: AlignmentType.RIGHT })] }),
                        ]
                    })
                );
            });

            tableRows.push(
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Total', bold: true })], alignment: AlignmentType.CENTER })], columnSpan: 5 }),
                        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: subtotal.toLocaleString('id-ID'), bold: true })], alignment: AlignmentType.RIGHT })] }),
                    ]
                })
            );

            const table = new Table({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
            });

            pageContentSection.push(table);
        });
    }

    const doc = new Document({
        sections: [{
            headers: {
                default: new Header({
                    children: headerTitleElements
                })
            },
            children: pageContentSection,
        }],
    });

    const blob = await Packer.toBlob(doc);
    return blob;
}
