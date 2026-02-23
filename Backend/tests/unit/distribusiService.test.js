import distribusiService from '../../src/services/distribusiService.js';
import Distribusi from '../../src/models/distribusiModel.js';
import Mustahiq from '../../src/models/mustahiqModel.js';
import db from '../../src/config/database.js';

jest.mock('../../src/models/distribusiModel.js', () => ({
  findAndCountAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  findAll: jest.fn(),
}));

jest.mock('../../src/models/mustahiqModel.js', () => ({
  findByPk: jest.fn(),
}));

jest.mock('../../src/config/database.js', () => ({
  transaction: jest.fn(),
  fn: jest.fn(),
  col: jest.fn(),
  literal: jest.fn(),
}));

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

describe('distribusiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.transaction.mockResolvedValue(mockTransaction);
  });

  describe('getAll()', () => {
    test('berhasil mengambil list distribusi', async () => {
      Distribusi.findAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 1 }] });
      const result = await distribusiService.getAll({ page: 1, limit: 10 });
      expect(result.rows).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('getById()', () => {
    test('data ditemukan → return data', async () => {
      const mockData = { id: 1, nama_mustahik: 'Mustahiq A' };
      Distribusi.findByPk.mockResolvedValue(mockData);
      const result = await distribusiService.getById(1);
      expect(result).toEqual(mockData);
    });

    test('data tidak ditemukan → throw 404', async () => {
      Distribusi.findByPk.mockResolvedValue(null);
      await expect(distribusiService.getById(999)).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('create()', () => {
    const payload = { mustahiq_id: 1, tanggal: '2026-02-23', jumlah: 1000000 };
    const mockMustahiq = {
      id: 1, nama: 'Mustahiq A', nik: '123', kelurahan: 'Tembesi',
      no_reg_bpp: 'BPP-1', nrm: 'NRM-1', alamat: 'Alamat', kecamatan: 'Batu Aji',
      no_hp: '0812', asnaf: 'Fakir'
    };

    test('berhasil membuat distribusi dengan denormalisasi data', async () => {
      Mustahiq.findByPk.mockResolvedValue(mockMustahiq);
      Distribusi.create.mockResolvedValue({ id: 1, ...payload });

      const result = await distribusiService.create(payload, 1);

      expect(db.transaction).toHaveBeenCalled();
      expect(Distribusi.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nama_mustahik: 'Mustahiq A',
          nrm: 'NRM-1',
          bulan: 'Februari',
          tahun: 2026
        }),
        expect.objectContaining({ transaction: mockTransaction })
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    test('mustahiq tidak ditemukan → throw 404', async () => {
      Mustahiq.findByPk.mockResolvedValue(null);
      await expect(distribusiService.create(payload, 1)).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('Rekap Functions', () => {
    test('rekapHarian memanggil findAll dengan benar', async () => {
       await distribusiService.rekapHarian({ tanggal: '2026-02-23' });
       expect(Distribusi.findAll).toHaveBeenCalledWith(expect.objectContaining({
         where: { tanggal: '2026-02-23' }
       }));
    });
  });
});
