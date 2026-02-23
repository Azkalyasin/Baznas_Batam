import muzakkiService from '../../src/services/muzakkiService.js';
import Muzakki from '../../src/models/muzakkiModel.js';
import Penerimaan from '../../src/models/penerimaanModel.js';

jest.mock('../../src/models/muzakkiModel.js');
jest.mock('../../src/models/penerimaanModel.js');

describe('muzakkiService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── getById ───────────────────────────────────────────────────────────────

  describe('getById()', () => {
    test('muzakki ditemukan → return data', async () => {
      const mock = { id: 1, nama: 'Budi', npwz: 'NPWZ202602001' };
      Muzakki.findByPk.mockResolvedValue(mock);

      const result = await muzakkiService.getById(1);
      expect(result).toEqual(mock);
    });

    test('muzakki tidak ditemukan → throw 404', async () => {
      Muzakki.findByPk.mockResolvedValue(null);

      await expect(muzakkiService.getById(999)).rejects.toMatchObject({
        message: 'Muzakki tidak ditemukan.',
        status: 404
      });
    });
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create()', () => {
    const payload = {
      npwz: 'NPWZ001', nama: 'Budi', kelurahan: 'Tembesi',
      kecamatan: 'Batu Aji', jenis_muzakki: 'Individu',
      registered_date: '2026-01-01'
    };

    test('berhasil membuat muzakki dengan npwz dari input', async () => {
      Muzakki.findOne.mockResolvedValue(null); // Tidak ada duplikat
      Muzakki.create.mockResolvedValue({ id: 1, ...payload });

      const result = await muzakkiService.create(payload, 1);

      expect(Muzakki.create).toHaveBeenCalled();
      expect(result).toHaveProperty('npwz', 'NPWZ001');
    });

    test('NPWZ sudah digunakan → throw 409', async () => {
      Muzakki.findOne.mockResolvedValueOnce({ id: 5, npwz: 'NPWZ001' });

      await expect(muzakkiService.create(payload, 1)).rejects.toMatchObject({
        message: 'NPWZ sudah digunakan.',
        status: 409
      });
    });

    test('NIK sudah digunakan → throw 409', async () => {
      const payloadWithNik = { ...payload, nik: '1234567890123456' };
      Muzakki.findOne
        .mockResolvedValueOnce(null)  // NPWZ check OK
        .mockResolvedValueOnce({ id: 3, nik: '1234567890123456' }); // NIK duplikat

      await expect(muzakkiService.create(payloadWithNik, 1)).rejects.toMatchObject({
        message: 'NIK sudah digunakan.',
        status: 409
      });
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update()', () => {
    test('muzakki tidak ditemukan → throw 404', async () => {
      Muzakki.findByPk.mockResolvedValue(null);

      await expect(muzakkiService.update(999, { nama: 'Baru' })).rejects.toMatchObject({
        status: 404
      });
    });

    test('NIK konflik → throw 409', async () => {
      const existing = { id: 1, nik: '1111111111111111', update: jest.fn() };
      Muzakki.findByPk.mockResolvedValue(existing);
      Muzakki.findOne.mockResolvedValue({ id: 2, nik: '2222222222222222' }); // Konflik

      await expect(muzakkiService.update(1, { nik: '2222222222222222' })).rejects.toMatchObject({
        status: 409
      });
      expect(existing.update).not.toHaveBeenCalled();
    });
  });

  // ─── updateStatus ─────────────────────────────────────────────────────────

  describe('updateStatus()', () => {
    test('berhasil ubah status', async () => {
      const mock = { id: 1, status: 'active', update: jest.fn().mockResolvedValue(true) };
      Muzakki.findByPk.mockResolvedValue(mock);

      await muzakkiService.updateStatus(1, 'inactive');
      expect(mock.update).toHaveBeenCalledWith({ status: 'inactive' });
    });

    test('muzakki tidak ditemukan → throw 404', async () => {
      Muzakki.findByPk.mockResolvedValue(null);

      await expect(muzakkiService.updateStatus(999, 'inactive')).rejects.toMatchObject({
        status: 404
      });
    });
  });

  // ─── destroy ───────────────────────────────────────────────────────────────

  describe('destroy()', () => {
    test('berhasil hapus', async () => {
      const mock = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Muzakki.findByPk.mockResolvedValue(mock);
      Penerimaan.count.mockResolvedValue(0);

      await expect(muzakkiService.destroy(1)).resolves.toBeUndefined();
      expect(mock.destroy).toHaveBeenCalled();
    });

    test('muzakki tidak ditemukan → throw 404', async () => {
      Muzakki.findByPk.mockResolvedValue(null);

      await expect(muzakkiService.destroy(999)).rejects.toMatchObject({ status: 404 });
    });

    test('memiliki penerimaan terkait → throw 400', async () => {
      Muzakki.findByPk.mockResolvedValue({ id: 1, destroy: jest.fn() });
      Penerimaan.count.mockResolvedValue(3);

      await expect(muzakkiService.destroy(1)).rejects.toMatchObject({
        status: 400,
        message: expect.stringContaining('3 data penerimaan')
      });
    });
  });

  // ─── getRiwayat ────────────────────────────────────────────────────────────

  describe('getRiwayat()', () => {
    test('muzakki tidak ditemukan → throw 404', async () => {
      Muzakki.findByPk.mockResolvedValue(null);

      await expect(muzakkiService.getRiwayat(999, {})).rejects.toMatchObject({ status: 404 });
    });

    test('berhasil ambil riwayat penerimaan', async () => {
      const mockMuzakki = {
        id: 1, nama: 'Budi',
        total_setor_count: 5, total_setor_amount: 5000000,
        last_setor_date: '2026-01-20'
      };
      Muzakki.findByPk.mockResolvedValue(mockMuzakki);
      Penerimaan.findAndCountAll.mockResolvedValue({ rows: [{ id: 10 }], count: 1 });

      const result = await muzakkiService.getRiwayat(1, { page: 1, limit: 10 });

      expect(result.muzakki).toEqual(mockMuzakki);
      expect(result.total_setor_count).toBe(5);
      expect(result.riwayat.data).toHaveLength(1);
    });
  });
});
