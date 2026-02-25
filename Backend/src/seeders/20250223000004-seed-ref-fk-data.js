'use strict';

/**
 * Seeder untuk tabel yang bergantung pada ID dari seeder sebelumnya:
 * - ref_sub_program     (FK -> ref_nama_program)
 * - ref_metode_bayar    (FK -> ref_via_penerimaan)
 * - ref_jenis_zis       (FK -> ref_zis)
 * - ref_jenis_upz       (standalone)
 * 
 * @type {import('sequelize-cli').Seeder}
 */
module.exports = {
  async up(queryInterface) {
    // --- ref_sub_program ---
    const [programRows] = await queryInterface.sequelize.query(
      `SELECT id, nama FROM ref_nama_program`
    );
    const progMap = {};
    programRows.forEach(r => { progMap[r.nama] = r.id; });

    await queryInterface.bulkInsert('ref_sub_program', [
      { nama_program_id: progMap['Batam Cerdas'], nama: 'B. Pendidikan Dasar dan Menengah' },
      { nama_program_id: progMap['Batam Cerdas'], nama: 'B. Pendidikan Tinggi Dalam Negeri' },
      { nama_program_id: progMap['Batam Sehat'],  nama: 'B. Pengobatan' },
      { nama_program_id: progMap['Batam Makmur'], nama: 'B. Modal Usaha' },
      { nama_program_id: progMap['Batam Peduli'], nama: 'B. Makanan' },
      { nama_program_id: progMap['Batam Taqwa'],  nama: 'B. Syiar Dakwah' }
    ], { ignoreDuplicates: true });

    // --- ref_metode_bayar ---
    const [viaRows] = await queryInterface.sequelize.query(
      `SELECT id, nama FROM ref_via_penerimaan`
    );
    const viaMap = {};
    viaRows.forEach(r => { viaMap[r.nama] = r.id; });

    await queryInterface.bulkInsert('ref_metode_bayar', [
      { nama: 'Tunai',        via_penerimaan_id: viaMap['Cash'] },
      { nama: 'Transfer BRI', via_penerimaan_id: viaMap['Bank'] },
      { nama: 'Transfer BSI', via_penerimaan_id: viaMap['Bank'] },
      { nama: 'QRIS',         via_penerimaan_id: viaMap['Kantor Digital'] },
      { nama: 'Shopeepay',    via_penerimaan_id: viaMap['Kantor Digital'] }
    ], { ignoreDuplicates: true });

    // --- ref_jenis_zis ---
    const [zisRows] = await queryInterface.sequelize.query(
      `SELECT id, nama FROM ref_zis`
    );
    const zisMap = {};
    zisRows.forEach(r => { zisMap[r.nama] = r.id; });

    await queryInterface.bulkInsert('ref_jenis_zis', [
      { zis_id: zisMap['Zakat'], nama: 'Zakat Fitrah' },
      { zis_id: zisMap['Zakat'], nama: 'Zakat Maal' },
      { zis_id: zisMap['Zakat'], nama: 'Zakat Profesi' },
      { zis_id: zisMap['Infaq'], nama: 'Infaq Masjid' },
      { zis_id: zisMap['Infaq'], nama: 'Infaq Umum' },
      { zis_id: zisMap['Infaq'], nama: 'Shadaqah' }
    ], { ignoreDuplicates: true });

    // --- ref_jenis_upz ---
    await queryInterface.bulkInsert('ref_jenis_upz', [
      { nama: 'UPZ Masjid' },
      { nama: 'UPZ Sekolah' },
      { nama: 'UPZ Perusahaan' },
      { nama: 'UPZ Instansi Pemerintah' }
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('ref_jenis_upz',    null, {});
    await queryInterface.bulkDelete('ref_jenis_zis',    null, {});
    await queryInterface.bulkDelete('ref_metode_bayar', null, {});
    await queryInterface.bulkDelete('ref_sub_program',  null, {});
  }
};
