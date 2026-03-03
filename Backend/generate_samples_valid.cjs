const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Real Data from DB
const DATA = {
    KEC: ['Batam Kota', 'Batu Aji', 'Batu Ampar', 'Belakang Padang', 'Bengkong'],
    KEL: ['Air Raja', 'Baloi Indah', 'Baloi Permai', 'Batu Besar', 'Batu Legong'],
    ASNAF: ['Amil', 'Fakir', 'Fisabillillah', 'Gharimin', 'Ibnu Sabil'],
    KM: ['Individu', 'Lembaga', 'Masjid'],
    VIA: ['Bank', 'Cash', 'Kantor Digital'],
    METODE: ['Bank BCA', 'Bank BRI', 'Bank BRI Syariah'],
    ZIS: ['DSKL / CSR / Hibah', 'Fidyah', 'Infak/Sedekah'],
    JZ: ['CSR', 'DSKL', 'Fidyah'],
    PROG: ['Batam Cerdas', 'Batam Makmur', 'Batam Peduli'],
    SP: ['Bantuan Infrastruktur Pendidikan Asnaf Fakir', 'Bantuan Infrastruktur Pendidikan Asnaf Miskin'],
    PK: ['B. Sembako', 'B. Daging Qurban'],
    ENT: ['BAZNAS KOTA BATAM', 'Baznas Tanggap Bencana (BTB)', 'Individu'],
    JZD: ['Hibah', 'Infak Terikat', 'Infak Tidak Terikat'],
    FB: ['Rutin', 'Tidak Rutin']
};

const outputDir = path.join(__dirname, 'samples');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDigits = (n) => {
    let res = '';
    for (let i = 0; i < n; i++) res += Math.floor(Math.random() * 10);
    return res;
};

async function generateMustahiq() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('DATA MUSTAHIQ');
    // Correct order based on COLUMN_CONFIG.mustahiq
    sheet.columns = [
        { header: 'NRM', key: 'nrm' },
        { header: 'Nama', key: 'nama' },
        { header: 'NIK', key: 'nik' },
        { header: 'Alamat', key: 'alamat' },
        { header: 'Kelurahan', key: 'kelurahan' },
        { header: 'Kecamatan', key: 'kecamatan' },
        { header: 'No HP', key: 'no_hp' },
        { header: 'Asnaf', key: 'asnaf' },
        { header: 'Kategori Mustahiq', key: 'kategori_mustahiq' }
    ];

    for (let i = 1; i <= 100; i++) {
        const row = sheet.addRow({
            nrm: `MS2026${randomDigits(4)}${i.toString().padStart(3,'0')}`,
            nama: `Mustahiq Sample ${i}`,
            nik: `2171${randomDigits(12)}`,
            alamat: `Alamat Sample No. ${i}, Batam`,
            kelurahan: randomItem(DATA.KEL),
            kecamatan: randomItem(DATA.KEC),
            no_hp: `0812${randomDigits(8)}`,
            asnaf: randomItem(DATA.ASNAF),
            kategori_mustahiq: randomItem(DATA.KM)
        });
        row.getCell('nik').numFmt = '@';
        row.getCell('nrm').numFmt = '@';
        row.getCell('no_hp').numFmt = '@';
    }
    await workbook.xlsx.writeFile(path.join(outputDir, 'sample_mustahiq_100.xlsx'));
}

async function generateMuzakki() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('DATA MUZAKKI');
    // Correct order based on COLUMN_CONFIG.muzakki
    sheet.columns = [
        { header: 'NPWZ', key: 'npwz' },
        { header: 'Nama', key: 'nama' },
        { header: 'NIK', key: 'nik' },
        { header: 'No HP', key: 'no_hp' },
        { header: 'Alamat', key: 'alamat' },
        { header: 'Kelurahan', key: 'kelurahan' },
        { header: 'Kecamatan', key: 'kecamatan' },
        { header: 'Jenis Muzakki', key: 'jenis_muzakki' },
        { header: 'Jenis UPZ', key: 'jenis_upz' }
    ];

    for (let i = 1; i <= 100; i++) {
        const row = sheet.addRow({
            npwz: `MZ2026${randomDigits(4)}${i.toString().padStart(3,'0')}`,
            nama: `Muzakki Sample ${i}`,
            nik: `2171${randomDigits(12)}`,
            no_hp: `0811${randomDigits(8)}`,
            alamat: `Alamat Sample No. ${i}, Batam`,
            kelurahan: randomItem(DATA.KEL),
            kecamatan: randomItem(DATA.KEC),
            jenis_muzakki: 'Individu',
            jenis_upz: 'Lainnya'
        });
        row.getCell('nik').numFmt = '@';
        row.getCell('npwz').numFmt = '@';
        row.getCell('no_hp').numFmt = '@';
    }
    await workbook.xlsx.writeFile(path.join(outputDir, 'sample_muzakki_100.xlsx'));
}

async function generatePenerimaan() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('DATA PENERIMAAN');
    // Correct order based on COLUMN_CONFIG.penerimaan
    sheet.columns = [
        { header: 'Muzakki ID / NIK', key: 'muzakki_identifier' },
        { header: 'Tanggal (YYYY-MM-DD)', key: 'tanggal' },
        { header: 'Via', key: 'via' },
        { header: 'Metode Bayar', key: 'metode_bayar' },
        { header: 'ZIS', key: 'zis' },
        { header: 'Jenis ZIS', key: 'jenis_zis' },
        { header: 'Jumlah', key: 'jumlah' },
        { header: 'Keterangan', key: 'keterangan' }
    ];

    for (let i = 1; i <= 100; i++) {
        const row = sheet.addRow({
            muzakki_identifier: `2171${randomDigits(12)}`,
            tanggal: '2026-03-01',
            via: randomItem(DATA.VIA),
            metode_bayar: randomItem(DATA.METODE),
            zis: randomItem(DATA.ZIS),
            jenis_zis: randomItem(DATA.JZ),
            jumlah: Math.floor(Math.random() * 1000000) + 50000,
            keterangan: `Penerimaan Sample ${i}`
        });
        row.getCell('muzakki_identifier').numFmt = '@';
    }
    await workbook.xlsx.writeFile(path.join(outputDir, 'sample_penerimaan_100.xlsx'));
}

async function generateDistribusi() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('DATA DISTRIBUSI');
    // Correct order based on COLUMN_CONFIG.distribusi
    sheet.columns = [
        { header: 'Mustahiq ID / NIK', key: 'mustahiq_identifier' },
        { header: 'Tanggal (YYYY-MM-DD)', key: 'tanggal' },
        { header: 'Jumlah', key: 'jumlah' },
        { header: 'Program', key: 'nama_program' },
        { header: 'Sub Program', key: 'sub_program' },
        { header: 'Program Kegiatan', key: 'program_kegiatan' },
        { header: 'Nama Entitas', key: 'nama_entitas' },
        { header: 'Kategori Mustahiq', key: 'kategori_mustahiq' },
        { header: 'Jenis ZIS Distribusi', key: 'jenis_zis_distribusi' },
        { header: 'Frekuensi Bantuan', key: 'frekuensi_bantuan' },
        { header: 'Keterangan', key: 'keterangan' }
    ];

    for (let i = 1; i <= 100; i++) {
        const row = sheet.addRow({
            mustahiq_identifier: `2171${randomDigits(12)}`,
            tanggal: '2026-03-01',
            jumlah: Math.floor(Math.random() * 500000) + 100000,
            nama_program: randomItem(DATA.PROG),
            sub_program: randomItem(DATA.SP),
            program_kegiatan: randomItem(DATA.PK),
            nama_entitas: randomItem(DATA.ENT),
            kategori_mustahiq: randomItem(DATA.KM),
            jenis_zis_distribusi: randomItem(DATA.JZD),
            frekuensi_bantuan: randomItem(DATA.FB),
            keterangan: `Distribusi Sample ${i}`
        });
        row.getCell('mustahiq_identifier').numFmt = '@';
    }
    await workbook.xlsx.writeFile(path.join(outputDir, 'sample_distribusi_100.xlsx'));
}

(async () => {
    await Promise.all([
        generateMustahiq(),
        generateMuzakki(),
        generatePenerimaan(),
        generateDistribusi()
    ]);
    console.log('All correct samples generated successfully!');
})();
