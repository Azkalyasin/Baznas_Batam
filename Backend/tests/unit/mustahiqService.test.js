import mustahiqService from '../../src/services/mustahiqService.js';
import Mustahiq from '../../src/models/mustahiqModel.js';
import Distribusi from '../../src/models/distribusiModel.js';

jest.mock('../../src/models/mustahiqModel.js');
jest.mock('../../src/models/distribusiModel.js');

describe('mustahiqService', () => {
  beforeEach(() => jest.clearAllMocks());

  // ─── getById ───────────────────────────────────────────────────────────────

  describe('getById()', () => {
    test('mustahiq ditemukan → return data', async () => {
      const mock = { id: 1, nama: 'Ahmad', nrm: 'NRM001' };
      Mustahiq.findByPk.mockResolvedValue(mock);

      const result = await mustahiqService.getById(1);
      expect(result).toEqual(mock);
    });

    test('mustahiq tidak ditemukan → throw 404', async () => {
      Mustahiq.findByPk.mockResolvedValue(null);

      await expect(mustahiqService.getById(999)).rejects.toMatchObject({
        message: 'Mustahiq tidak ditemukan.',
        status: 404
      });
    });
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create()', () => {
    const payload = {
      nrm: 'NRM001', nama: 'Ahmad', kelurahan: 'Tembesi',
      kecamatan: 'Batu Aji', asnaf: 'Fakir', registered_date: '2026-01-01'
    };

    test('berhasil membuat mustahiq → auto-generate no_reg_bpp', async () => {
      Mustahiq.findOne.mockResolvedValue(null); // Tidak ada duplikat NRM / last BPP
      Mustahiq.create.mockResolvedValue({ id: 1, no_reg_bpp: 'BPP202602001', ...payload });

      const result = await mustahiqService.create(payload, 1);

      expect(Mustahiq.create).toHaveBeenCalled();
      expect(result).toHaveProperty('no_reg_bpp');
    });

    test('NRM sudah digunakan → throw 409', async () => {
      Mustahiq.findOne.mockResolvedValueOnce({ id: 5, nrm: 'NRM001' }); // Duplikat NRM

      await expect(mustahiqService.create(payload, 1)).rejects.toMatchObject({
        message: 'NRM sudah digunakan.',
        status: 409
      });
    });

    test('NIK sudah digunakan → throw 409', async () => {
      const payloadWithNik = { ...payload, nik: '1234567890123456' };
      Mustahiq.findOne
        .mockResolvedValueOnce(null)  // NRM check OK
        .mockResolvedValueOnce({ id: 3, nik: '1234567890123456' }); // NIK duplikat

      await expect(mustahiqService.create(payloadWithNik, 1)).rejects.toMatchObject({
        message: 'NIK sudah digunakan.',
        status: 409
      });
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update()', () => {
    test('mustahiq tidak ditemukan → throw 404', async () => {
      Mustahiq.findByPk.mockResolvedValue(null);

      await expect(mustahiqService.update(999, { nama: 'Baru' })).rejects.toMatchObject({
        status: 404
      });
    });

    test('NRM konflik dengan mustahiq lain → throw 409', async () => {
      const existing = { id: 1, nrm: 'NRM001', update: jest.fn() };
      Mustahiq.findByPk.mockResolvedValue(existing);
      Mustahiq.findOne.mockResolvedValue({ id: 2, nrm: 'NRM002' }); // Konflik

      await expect(mustahiqService.update(1, { nrm: 'NRM002' })).rejects.toMatchObject({
        status: 409
      });
      expect(existing.update).not.toHaveBeenCalled();
    });
  });

  // ─── updateStatus ─────────────────────────────────────────────────────────

  describe('updateStatus()', () => {
    test('berhasil ubah status', async () => {
      const mock = { id: 1, status: 'active', update: jest.fn().mockResolvedValue(true) };
      Mustahiq.findByPk.mockResolvedValue(mock);

      const result = await mustahiqService.updateStatus(1, 'blacklist');
      expect(mock.update).toHaveBeenCalledWith({ status: 'blacklist' });
    });

    test('mustahiq tidak ditemukan → throw 404', async () => {
      Mustahiq.findByPk.mockResolvedValue(null);

      await expect(mustahiqService.updateStatus(999, 'inactive')).rejects.toMatchObject({
        status: 404
      });
    });
  });

  // ─── destroy ───────────────────────────────────────────────────────────────

  describe('destroy()', () => {
    test('berhasil hapus', async () => {
      const mock = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Mustahiq.findByPk.mockResolvedValue(mock);
      Distribusi.count.mockResolvedValue(0);

      await expect(mustahiqService.destroy(1)).resolves.toBeUndefined();
      expect(mock.destroy).toHaveBeenCalled();
    });

    test('mustahiq tidak ditemukan → throw 404', async () => {
      Mustahiq.findByPk.mockResolvedValue(null);

      await expect(mustahiqService.destroy(999)).rejects.toMatchObject({ status: 404 });
    });

    test('memiliki distribusi terkait → throw 400', async () => {
      Mustahiq.findByPk.mockResolvedValue({ id: 1, destroy: jest.fn() });
      Distribusi.count.mockResolvedValue(5);

      await expect(mustahiqService.destroy(1)).rejects.toMatchObject({
        status: 400,
        message: expect.stringContaining('5 data distribusi')
      });
    });
  });

  // ─── getRiwayat ────────────────────────────────────────────────────────────

  describe('getRiwayat()', () => {
    test('mustahiq tidak ditemukan → throw 404', async () => {
      Mustahiq.findByPk.mockResolvedValue(null);

      await expect(mustahiqService.getRiwayat(999, {})).rejects.toMatchObject({ status: 404 });
    });

    test('berhasil ambil riwayat distribusi', async () => {
      const mockMustahiq = {
        id: 1, nama: 'Ahmad',
        total_penerimaan_count: 3, total_penerimaan_amount: 1500000,
        last_received_date: '2026-01-15'
      };
      Mustahiq.findByPk.mockResolvedValue(mockMustahiq);
      Distribusi.findAndCountAll.mockResolvedValue({ rows: [{ id: 10 }], count: 1 });

      const result = await mustahiqService.getRiwayat(1, { page: 1, limit: 10 });

      expect(result.mustahiq).toEqual(mockMustahiq);
      expect(result.total_penerimaan_count).toBe(3);
      expect(result.riwayat.data).toHaveLength(1);
    });
  });
});
