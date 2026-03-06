import * as XLSX from 'xlsx';
import { mustahiqApi } from './api';

export const exportMustahiqIndividuExcel = async (startDate?: string, endDate?: string) => {
    try {
        // Fetch all mustahiq data where kategori_mustahiq_id = 1 (Individu)
        const payload: any = { kategori_mustahiq_id: 1, limit: 9999, page: 1 };
        if (startDate) payload.start_date = startDate;
        if (endDate) payload.end_date = endDate;

        const res = await mustahiqApi.list(payload) as any;

        let rows = [];
        if (res && res.data && Array.isArray(res.data)) {
            rows = res.data;
        } else if (res && res.rows && Array.isArray(res.rows)) {
            rows = res.rows;
        } else if (Array.isArray(res)) {
            rows = res;
        }

        console.log('[Export Mustahiq] fetched individu rows:', rows?.length);

        if (!rows || rows.length === 0) {
            throw new Error('Tidak ada data mustahiq individu yang ditemukan.');
        }

        const formatDate = (dateString: string) => {
            if (!dateString) return '-';
            const d = new Date(dateString);
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        };

        const excelData = rows.map((r: any) => ({
            'Tanggal Registrasi': formatDate(r.registered_date),
            'Nama Lengkap': r.nama || '-',
            'NIK': r.nik || '-',
            'Tanggal Lahir': formatDate(r.tgl_lahir),
            'Jenis Kelamin': r.jenis_kelamin === 'Laki-laki' ? 'Pria' : r.jenis_kelamin === 'Perempuan' ? 'Wanita' : '-',
            'Alamat': r.alamat || '-',
            'No Handphone': r.no_hp || '-',
            'Keterangan': r.keterangan || '-',
        }));

        // Convert mapped data to worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Adjust column widths
        const colWidths = [
            { wch: 20 }, // Tanggal Registrasi
            { wch: 30 }, // Nama Lengkap
            { wch: 20 }, // NIK
            { wch: 15 }, // Tanggal Lahir
            { wch: 15 }, // Jenis Kelamin
            { wch: 40 }, // Alamat
            { wch: 20 }, // No Handphone
            { wch: 40 }, // Keterangan
        ];
        worksheet['!cols'] = colWidths;

        // Create a new workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Mustahiq Individu');

        // Generate Excel file and trigger download
        const timestamp = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `Data_Mustahiq_Perorangan_${timestamp}.xlsx`);
    } catch (error) {
        console.error('Error exporting Mustahiq Individu to Excel:', error);
        throw error;
    }
};

export const exportMustahiqLembagaExcel = async (startDate?: string, endDate?: string) => {
    try {
        // Fetch mustahiq data where kategori_mustahiq_id IN (2, 3) (Lembaga & Masjid) -> Frontend passing doesn't support array easily, we might need to fetch all and filter or frontend can't list by array natively without backend support.
        // Wait, the backend mustahiqService `getAll` only accepts a single `kategori_mustahiq_id`.
        // So we will do two concurrent fetches for ID 2 and ID 3, then combine them.
        const payloadLembaga: any = { kategori_mustahiq_id: 2, limit: 9999, page: 1 };
        const payloadMasjid: any = { kategori_mustahiq_id: 3, limit: 9999, page: 1 };

        if (startDate) {
            payloadLembaga.start_date = startDate;
            payloadMasjid.start_date = startDate;
        }
        if (endDate) {
            payloadLembaga.end_date = endDate;
            payloadMasjid.end_date = endDate;
        }

        const [resLembaga, resMasjid] = await Promise.all([
            mustahiqApi.list(payloadLembaga) as any,
            mustahiqApi.list(payloadMasjid) as any,
        ]);

        let rowsLembaga = [];
        if (resLembaga && resLembaga.data && Array.isArray(resLembaga.data)) rowsLembaga = resLembaga.data;
        else if (resLembaga && resLembaga.rows && Array.isArray(resLembaga.rows)) rowsLembaga = resLembaga.rows;
        else if (Array.isArray(resLembaga)) rowsLembaga = resLembaga;

        let rowsMasjid = [];
        if (resMasjid && resMasjid.data && Array.isArray(resMasjid.data)) rowsMasjid = resMasjid.data;
        else if (resMasjid && resMasjid.rows && Array.isArray(resMasjid.rows)) rowsMasjid = resMasjid.rows;
        else if (Array.isArray(resMasjid)) rowsMasjid = resMasjid;

        const combinedRows = [...rowsLembaga, ...rowsMasjid];

        console.log('[Export Mustahiq] fetched lembaga+masjid rows:', combinedRows.length);

        if (!combinedRows || combinedRows.length === 0) {
            throw new Error('Tidak ada data mustahiq lembaga/masjid yang ditemukan di rentang tanggal ini.');
        }

        const formatDate = (dateString: string) => {
            if (!dateString) return '-';
            const d = new Date(dateString);
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        };

        // Columns requested: Tanggal Registrasi, Nama Lembaga, NIK Pemimpin, jenis lembaga, Jumlah anggota, alamat, telepon, handphone, email, catatan
        // Mapped from DB Mustahiq: 
        // Nama Lembaga -> r.nama
        // NIK Pemimpin -> r.nik
        // jenis lembaga -> KategoriMustahiq.nama
        // alamat -> r.alamat
        // handphone -> r.no_hp
        // catatan -> r.keterangan
        // telepon, jumlah anggota, email -> kosongkan (-)

        const excelData = combinedRows.map((r: any) => ({
            'Tanggal Registrasi': formatDate(r.registered_date),
            'Nama Lembaga': r.nama || '-',
            'NIK Pemimpin': r.nik || '-',
            'Jenis Lembaga': r.KategoriMustahiq?.nama || r.ref_kategori_mustahiq?.nama || '-',
            'Jumlah Anggota': '-',
            'Alamat': r.alamat || '-',
            'Telepon': '-',
            'Handphone': r.no_hp || '-',
            'Email': '-',
            'Catatan': r.keterangan || '-',
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        const colWidths = [
            { wch: 20 }, // Tanggal Registrasi
            { wch: 40 }, // Nama Lembaga
            { wch: 20 }, // NIK Pemimpin
            { wch: 20 }, // Jenis Lembaga
            { wch: 15 }, // Jumlah Anggota
            { wch: 40 }, // Alamat
            { wch: 15 }, // Telepon
            { wch: 20 }, // Handphone
            { wch: 25 }, // Email
            { wch: 40 }, // Catatan
        ];
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Mustahiq Lembaga');

        const timestamp = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(workbook, `Data_Mustahiq_Lembaga_${timestamp}.xlsx`);
    } catch (error) {
        console.error('Error exporting Mustahiq Lembaga to Excel:', error);
        throw error;
    }
};
