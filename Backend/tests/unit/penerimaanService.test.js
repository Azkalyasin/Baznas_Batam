import penerimaanService from '../../src/services/penerimaanService.js';
import Penerimaan from '../../src/models/penerimaanModel.js';
import Muzakki from '../../src/models/muzakkiModel.js';
import db from '../../src/config/database.js';

jest.mock('../../src/models/penerimaanModel.js', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('../../src/models/muzakkiModel.js', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
    findOne: jest.fn()
  }
}));

const mockTransaction = {
  commit: jest.fn().mockResolvedValue(true),
  rollback: jest.fn().mockResolvedValue(true)
};

jest.mock('../../src/config/database.js', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    transaction: jest.fn()
  }
}));

describe('penerimaanService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.transaction.mockResolvedValue(mockTransaction);
  });

  // ─── getById ───────────────────────────────────────────────────────────────

  describe('getById()', () => {
    test('penerimaan ditemukan → return data', async () => {
      const mock = { id: 1, jumlah: 500000 };
      Penerimaan.findByPk.mockResolvedValue(mock);

      const result = await penerimaanService.getById(1);
      expect(result).toEqual(mock);
    });

    test('penerimaan tidak ditemukan → throw 404', async () => {
      Penerimaan.findByPk.mockResolvedValue(null);

      await expect(penerimaanService.getById(999)).rejects.toMatchObject({
        message: 'Data penerimaan tidak ditemukan.',
        status: 404
      });
    });
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create()', () => {
    const payload = {
      muzakki_id: 1,
      tanggal: '2026-02-20',
      via: 'Cash',
      zis: 'Zakat',
      jenis_zis: 'Zakat',
      jumlah: 1000000,
      persentase_amil: '12.50%'
    };

    test('berhasil create → hitung dana_amil & dana_bersih + transaction', async () => {
      Muzakki.findByPk.mockResolvedValue({ id: 1, status: 'active' });
      const createdMock = {
        id: 1, ...payload,
        dana_amil: 125000, dana_bersih: 875000,
        reload: jest.fn()
      };
      Penerimaan.create.mockResolvedValue(createdMock);

      const result = await penerimaanService.create(payload, 1);

      // Verifikasi transaction dipakai
      expect(db.transaction).toHaveBeenCalled();
      expect(Penerimaan.create).toHaveBeenCalledWith(
        expect.objectContaining({
          dana_amil: 125000,
          dana_bersih: 875000,
          created_by: 1
        }),
        expect.objectContaining({ transaction: mockTransaction })
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(createdMock.reload).toHaveBeenCalled();
    });

    test('muzakki tidak ditemukan → throw 404', async () => {
      Muzakki.findByPk.mockResolvedValue(null);

      await expect(penerimaanService.create(payload, 1)).rejects.toMatchObject({
        status: 404
      });
    });

    test('muzakki inactive → throw 400', async () => {
      Muzakki.findByPk.mockResolvedValue({ id: 1, status: 'inactive' });

      await expect(penerimaanService.create(payload, 1)).rejects.toMatchObject({
        status: 400,
        message: expect.stringContaining('tidak aktif')
      });
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update()', () => {
    test('penerimaan tidak ditemukan → throw 404', async () => {
      Penerimaan.findByPk.mockResolvedValue(null);

      await expect(penerimaanService.update(999, { jumlah: 500000 })).rejects.toMatchObject({
        status: 404
      });
    });

    test('muzakki_id berubah ke muzakki inactive → throw 400', async () => {
      const existing = {
        id: 1, muzakki_id: 1, jumlah: 1000000, persentase_amil: '12.50%',
        update: jest.fn(), reload: jest.fn()
      };
      Penerimaan.findByPk.mockResolvedValue(existing);
      Muzakki.findByPk.mockResolvedValue({ id: 2, status: 'inactive' });

      await expect(penerimaanService.update(1, { muzakki_id: 2 })).rejects.toMatchObject({
        status: 400
      });
    });

    test('update jumlah → recalculate dana + transaction', async () => {
      const existing = {
        id: 1, muzakki_id: 1, jumlah: 1000000, persentase_amil: '12.50%',
        update: jest.fn().mockResolvedValue(true),
        reload: jest.fn()
      };
      Penerimaan.findByPk.mockResolvedValue(existing);

      await penerimaanService.update(1, { jumlah: 2000000 });

      expect(db.transaction).toHaveBeenCalled();
      expect(existing.update).toHaveBeenCalledWith(
        expect.objectContaining({
          jumlah: 2000000,
          dana_amil: 250000,
          dana_bersih: 1750000
        }),
        expect.objectContaining({ transaction: mockTransaction })
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  // ─── destroy ───────────────────────────────────────────────────────────────

  describe('destroy()', () => {
    test('berhasil hapus + transaction', async () => {
      const mock = { id: 1, destroy: jest.fn().mockResolvedValue(true) };
      Penerimaan.findByPk.mockResolvedValue(mock);

      await expect(penerimaanService.destroy(1)).resolves.toBeUndefined();
      expect(db.transaction).toHaveBeenCalled();
      expect(mock.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ transaction: mockTransaction })
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('tidak ditemukan → throw 404', async () => {
      Penerimaan.findByPk.mockResolvedValue(null);

      await expect(penerimaanService.destroy(999)).rejects.toMatchObject({ status: 404 });
    });
  });

  // ─── rekap ─────────────────────────────────────────────────────────────────

  describe('rekapHarian()', () => {
    test('return rekap harian dengan ringkasan', async () => {
      db.query
        .mockResolvedValueOnce([[{ zis: 'Zakat', jenis_zis: 'Zakat', jumlah_transaksi: 5 }]])
        .mockResolvedValueOnce([[{ total_transaksi: 5, grand_total: 5000000 }]]);

      const result = await penerimaanService.rekapHarian({ tanggal: '2026-02-20' });

      expect(result.tanggal).toBe('2026-02-20');
      expect(result.ringkasan).toBeDefined();
      expect(result.detail).toHaveLength(1);
    });
  });

  describe('rekapBulanan()', () => {
    test('return rekap bulanan', async () => {
      db.query
        .mockResolvedValueOnce([[{ zis: 'Zakat', via: 'Cash' }]])
        .mockResolvedValueOnce([[{ total_transaksi: 20 }]]);

      const result = await penerimaanService.rekapBulanan({ bulan: 'Februari', tahun: 2026 });

      expect(result.bulan).toBe('Februari');
      expect(result.tahun).toBe(2026);
    });
  });

  describe('rekapTahunan()', () => {
    test('return rekap tahunan', async () => {
      db.query
        .mockResolvedValueOnce([[{ bulan: 'Januari', zis: 'Zakat' }]])
        .mockResolvedValueOnce([[{ total_transaksi: 100 }]]);

      const result = await penerimaanService.rekapTahunan({ tahun: 2026 });

      expect(result.tahun).toBe(2026);
    });
  });
});
