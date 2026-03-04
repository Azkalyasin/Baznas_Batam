import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateDirs = path.join(__dirname, 'test_migration_files');
if (!fs.existsSync(generateDirs)) fs.mkdirSync(generateDirs);

const generate = async () => {
  // 1. MUSTAHIQ
  const wbMustahiq = new ExcelJS.Workbook();
  const wsMustahiq = wbMustahiq.addWorksheet('Data Mustahiq');
  wsMustahiq.addRow(['NRM', 'Nama Mustahik', 'NIK', 'Alamat Lengkap', 'Kelurahan', 'Kecamatan', 'No HP', 'Asnaf', 'Kategori Mustahiq']);
  wsMustahiq.addRow(['111111', 'Budi Santoso', '2171011122334455', 'Jl. Cinta Damai No 1', 'Batu Selicin', 'Lubuk Baja', '081111111111', 'Fakir', 'Individu']);
  wsMustahiq.addRow(['222222', 'Siti Aminah', '2171019988776655', 'Jl. Harapan Raya No 2', 'Belian', 'Batam Kota', '082222222222', 'Miskin', 'Individu']);
  wsMustahiq.addRow(['333333', 'Rahmat Hidayat', '2171013333333333', 'Jl. Sukajadi Asri 3', 'Sukajadi', 'Batam Kota', '083333333333', 'Fisabillillah', 'Individu']);
  wsMustahiq.addRow(['444444', 'Santi Kurnia', '2171014444444444', 'Komp. Muka Kuning 4', 'Muka Kuning', 'Sei Beduk', '084444444444', 'Gharimin', 'Individu']);
  wsMustahiq.addRow(['555555', 'Bagus Ramadhan', '2171015555555555', 'Jl. Tiban Asri 5', 'Tiban Lama', 'Sekupang', '085555555555', 'Ibnu Sabil', 'Individu']);
  wsMustahiq.addRow(['666666', 'Joko Winarno', '2171016666666666', 'Jl. Melati 6', 'Kampung Pelita', 'Lubuk Baja', '086666666666', 'Fakir', 'Individu']);
  wsMustahiq.addRow(['777777', 'Wati Sulastri', '2171017777777777', 'Jl. Bengkong Laut 7', 'Bengkong Laut', 'Bengkong', '087777777777', 'Miskin', 'Individu']);
  wsMustahiq.addRow(['888888', 'Agus Supriyanto', '2171018888888888', 'Jl. Batu Merah 8', 'Batu Merah', 'Batu Ampar', '088888888888', 'Amil', 'Individu']);
  wsMustahiq.addRow(['999999', 'Yayasan Yatim Piatu', '2171019999999999', 'Jl. Pahlawan 9', 'Belian', 'Batam Kota', '089999999999', 'Fisabillillah', 'Lembaga']);
  wsMustahiq.addRow(['101010', 'Masjid Al-Barkah', '2171010101010101', 'Jl. Masjid Komplek 10', 'Taman Baloi', 'Batam Kota', '081010101010', 'Fisabillillah', 'Masjid']);
  await wbMustahiq.xlsx.writeFile(path.join(generateDirs, 'testing_mustahiq.xlsx'));

  // 2. MUZAKKI
  const wbMuzakki = new ExcelJS.Workbook();
  const wsMuzakki = wbMuzakki.addWorksheet('Data Muzakki');
  wsMuzakki.addRow(['NPWZ', 'Nama Muzakki', 'NIK', 'No HP', 'Alamat Lengkap', 'Kelurahan', 'Kecamatan', 'Jenis Muzakki', 'Jenis UPZ']);
  wsMuzakki.addRow(['99111', 'Ahmad Dahlan', '2171099911112222', '089911111111', 'Jl. Pahlawan 1', 'Belian', 'Batam Kota', 'Individu', 'Individu']);
  wsMuzakki.addRow(['99222', 'PT Bintang Maju', '0000000000000001', '089922222222', 'Kawasan Industri Muka Kuning', 'Muka Kuning', 'Sei Beduk', 'Entitas', 'Perusahaan']);
  wsMuzakki.addRow(['99333', 'Doni Salman', '2171099933333333', '089933333333', 'Perum Tiban 3', 'Tiban Lama', 'Sekupang', 'Individu', 'Individu']);
  wsMuzakki.addRow(['99444', 'Citra Kirana', '2171099944444444', '089944444444', 'Jl. Pelita Baru 4', 'Kampung Pelita', 'Lubuk Baja', 'Individu', 'Individu']);
  wsMuzakki.addRow(['99555', 'UPZ Masjid Jami', '0000000000000002', '089955555555', 'Jl. Raya Bengkong 5', 'Bengkong Indah', 'Bengkong', 'UPZ', 'Masjid']);
  wsMuzakki.addRow(['99666', 'Klinik Sehat', '0000000000000003', '089966666666', 'Jl. Batu Aji 6', 'Buliang', 'Batu Aji', 'Entitas', 'Instansi']);
  wsMuzakki.addRow(['99777', 'Farid Anshari', '2171099977777777', '089977777777', 'Jl. Baloi Asri 7', 'Baloi Permai', 'Batam Kota', 'Individu', 'Individu']);
  wsMuzakki.addRow(['99888', 'Hamba Allah 1', '2171099988888888', '089988888888', 'Jl. Sengkuang 8', 'Tanjung Sengkuang', 'Batu Ampar', 'Individu', 'Individu']);
  wsMuzakki.addRow(['99999', 'Hamba Allah 2', '2171099999999999', '089999999999', 'Jl. Piayu 9', 'Tanjung Piayu', 'Sei Beduk', 'Individu', 'Individu']);
  wsMuzakki.addRow(['99000', 'CV Maju Terus', '0000000000000004', '089900000000', 'Jl. Kabil 10', 'Kabil', 'Nongsa', 'Entitas', 'kantor']);
  await wbMuzakki.xlsx.writeFile(path.join(generateDirs, 'testing_muzakki.xlsx'));

  // 3. PENERIMAAN (Menggunakan format penerimaan_excel)
  const wbPenerimaan = new ExcelJS.Workbook();
  const wsPenerimaan = wbPenerimaan.addWorksheet('Data Penerimaan');
  wsPenerimaan.addRow(['TANGGAL', 'BULAN', 'NAMA MUZAKKI', 'MUZAKI', 'METODE BAYAR', 'JENIS ZIS', 'JENIS MUZAKKI', 'JENIS UPZ', 'JUMLAH', 'TUNAI', 'AMIL %', 'DANA', 'ZIS']);
  wsPenerimaan.addRow(['01 Januari 2026', 'Januari', 'Ahmad Dahlan', 'Bank', 'Bank Mandiri', 'Zakat', 'Individu', 'Individu', 200000, '', '12.5', '', 'Zakat']);
  wsPenerimaan.addRow(['02 Januari 2026', 'Januari', 'PT Bintang Maju', 'Bank', 'BSI Zakat', 'Zakat Perdagangan', 'Entitas', 'Perusahaan', 5000000, '', '12.5', '', 'Zakat']);
  wsPenerimaan.addRow(['03 Februari 2026', 'Februari', 'Doni Salman', 'Kantor Digital', 'Bank Mandiri', 'Zakat Emas', 'Individu', 'Individu', 1500000, '', '12.5', '', 'Zakat']);
  wsPenerimaan.addRow(['04 Februari 2026', 'Februari', 'Citra Kirana', 'Bank', 'Bank BSI 2025', 'Zakat Emas', 'Individu', 'Individu', 300000, '', '12.5', '', 'Zakat']);
  wsPenerimaan.addRow(['05 Maret 2026', 'Maret', 'UPZ Masjid Jami', 'Bank', 'Bank Riau Kepri', 'Infak Sembako', 'UPZ', 'Masjid', 1000000, '', '12.5', '', 'Infaq']);
  wsPenerimaan.addRow(['06 Maret 2026', 'Maret', 'Klinik Sehat', 'Bank', 'Bank BCA', 'CSR', 'Entitas', 'Instansi', 7500000, '', '12.5', '', 'DSKL / CSR / Hibah']);
  wsPenerimaan.addRow(['07 April 2026', 'April', 'Farid Anshari', 'Cash', 'Cash', 'Fidyah', 'Individu', 'Individu', 60000, '', '12.5', '', 'Fidyah']);
  wsPenerimaan.addRow(['08 April 2026', 'April', 'Hamba Allah 1', 'Kantor Digital', 'BSI Zakat', 'Zakat Emas', 'Individu', 'Individu', 1200000, '', '12.5', '', 'Zakat']);
  wsPenerimaan.addRow(['09 Mei 2026', 'Mei', 'Hamba Allah 2', 'Cash', 'Cash', 'Zakat', 'Individu', 'Individu', 45000, '', '12.5', '', 'Zakat']);
  wsPenerimaan.addRow(['10 Mei 2026', 'Mei', 'CV Maju Terus', 'Bank', 'BNI', 'Infak Jumat', 'Entitas', 'kantor', 50000, '', '12.5', '', 'Infaq']);
  await wbPenerimaan.xlsx.writeFile(path.join(generateDirs, 'testing_penerimaan_excel.xlsx'));

  // 4. DISTRIBUSI (Menggunakan format distribusi_excel)
  const wbDistribusi = new ExcelJS.Workbook();
  const wsDistribusi = wbDistribusi.addWorksheet('Data Distribusi');
  wsDistribusi.addRow(['Tanggal', 'Nama Sub Program', 'Kegiatan Program', 'Frekuensi Bantuan', 'NRM', 'Nama Mustahik', 'NIK', 'Alamat', 'Kelurahan', 'Kecamatan', 'Jumlah', 'VIA', 'Kategori Mustahiq', 'Nama Program', 'Asnaf', 'Infak', 'Kuantitas', 'Jenis ZIS Distribusi', 'Nama Entitas', 'Keterangan', 'No HP', 'Rekomendasi UPZ', 'Status']);
  wsDistribusi.addRow(['05 Januari 2026', 'Bantuan Biaya Hidup Asnaf Fakir', 'Biaya Hidup Sehari-hari', 'Rutin', '111111', 'Budi Santoso', '2171011122334455', 'Jl. Cinta Damai No 1', 'Batu Selicin', 'Lubuk Baja', 500000, 'Bank', 'Individu', 'Batam Peduli', 'Fakir', '', 1, 'Zakat', 'Individu', 'Bantuan rutin 1', '081111111111', '', 'diterima']);
  wsDistribusi.addRow(['06 Januari 2026', 'Bantuan Pengobatan Asnaf Miskin', 'Berobat', 'Tidak Rutin', '222222', 'Siti Aminah', '2171019988776655', 'Jl. Harapan Raya No 2', 'Belian', 'Batam Kota', 750000, 'Bank', 'Individu', 'Batam Sehat', 'Miskin', '', 1, 'Zakat', 'Individu', 'Bantuan RS', '082222222222', '', 'diterima']);
  wsDistribusi.addRow(['07 Februari 2026', 'Bantuan Syiar Dakwah Asnaf Sabilillah', 'Sinergi Dakwah', 'Tidak Rutin', '333333', 'Rahmat Hidayat', '2171013333333333', 'Jl. Sukajadi Asri 3', 'Sukajadi', 'Batam Kota', 300000, 'Cash', 'Individu', 'Batam Taqwa', 'Fisabillillah', 'Infak Tidak Terikat', 1, 'Zakat', 'Individu', 'Operasional Dakwah', '083333333333', '', 'diterima']);
  wsDistribusi.addRow(['08 Februari 2026', 'Bantuan Pelunasan Utang Asnaf Gharimin', 'Pembayaran Hutang', 'Tidak Rutin', '444444', 'Santi Kurnia', '2171014444444444', 'Komp. Muka Kuning 4', 'Muka Kuning', 'Sei Beduk', 1200000, 'Bank', 'Individu', 'Batam Peduli', 'Gharimin', '', 1, 'Zakat', 'Individu', 'Pelunasan', '084444444444', '', 'diterima']);
  wsDistribusi.addRow(['09 Maret 2026', 'Bantuan Biaya Hidup Asnaf Ibnu Sabil', 'B. Pemulangan Ibnusabil', 'Tidak Rutin', '555555', 'Bagus Ramadhan', '2171015555555555', 'Jl. Tiban Asri 5', 'Tiban Lama', 'Sekupang', 200000, 'Cash', 'Individu', 'Batam Peduli', 'Ibnu Sabil', '', 1, 'Zakat', 'Individu', 'Tiket Pulang', '085555555555', '', 'diterima']);
  wsDistribusi.addRow(['10 Maret 2026', 'Bantuan Penyaluran Fitrah Asnaf Fakir', 'Penyaluran Zakat Fitrah', 'Tidak Rutin', '666666', 'Joko Winarno', '2171016666666666', 'Jl. Melati 6', 'Kampung Pelita', 'Lubuk Baja', 400000, 'Bank', 'Individu', 'Batam Peduli', 'Fakir', '', 1, 'Zakat', 'Individu', 'Zakat Fitrah', '086666666666', '', 'diterima']);
  wsDistribusi.addRow(['11 April 2026', 'Bantuan Modal Usaha Asnaf Miskin', 'Modal Usaha', 'Tidak Rutin', '777777', 'Wati Sulastri', '2171017777777777', 'Jl. Bengkong Laut 7', 'Bengkong Laut', 'Bengkong', 800000, 'Cash', 'Individu', 'Batam Makmur', 'Miskin', '', 1, 'Zakat', 'Individu', 'Modal Dagang', '087777777777', '', 'diterima']);
  wsDistribusi.addRow(['12 April 2026', 'Bantuan Kafalah/Mukafaah Dai Asnaf Sabilillah', 'Insentif Dai', 'Rutin', '888888', 'Agus Supriyanto', '2171018888888888', 'Jl. Batu Merah 8', 'Batu Merah', 'Batu Ampar', 150000, 'Bank', 'Individu', 'Batam Taqwa', 'Amil', '', 1, 'Zakat', 'Individu', 'Insentif Guru', '088888888888', '', 'diterima']);
  wsDistribusi.addRow(['13 Mei 2026', 'Bantuan Pendidikan Dasar dan Menengah Asnaf Miskin', 'B. Masuk SD', 'Tidak Rutin', '999999', 'Yayasan Yatim Piatu', '2171019999999999', 'Jl. Pahlawan 9', 'Belian', 'Batam Kota', 5000000, 'Bank', 'Lembaga', 'Batam Cerdas', 'Fisabillillah', '', 1, 'Zakat', 'Lembaga', 'Bantuan Panti', '089999999999', '', 'diterima']);
  wsDistribusi.addRow(['14 Mei 2026', 'Bantuan Operasional Fasilitas Kesehatan Asnaf Miskin', 'Operasional RIB', 'Rutin', '101010', 'Masjid Al-Barkah', '2171010101010101', 'Jl. Masjid Komplek 10', 'Taman Baloi', 'Batam Kota', 3500000, 'Bank', 'Masjid', 'Batam Sehat', 'Fisabillillah', 'Infak Terikat', 1, 'Zakat', 'Masjid', 'Bantuan Kas Masjid', '081010101010', '', 'diterima']);
  await wbDistribusi.xlsx.writeFile(path.join(generateDirs, 'testing_distribusi_excel.xlsx'));

  console.log('Successfully generated testing files in test_migration_files/');
};

generate().catch(console.error);
