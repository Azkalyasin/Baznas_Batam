# BAZNAS Batam API - Simplified Postman Testing Guide

This guide provides simplified instructions and example data for testing the BAZNAS Batam API after the database restructure (using reference table IDs).

## 1. Initial Setup

### Environment Variables
Set these variables in your Postman Environment:
- `base_url`: `http://localhost:5000`
- `token`: (Automatically updated after login)

### Authentication
**Endpoint**: `POST {{base_url}}/api/auth/login`
**Credentials**:
- Username: `baznasbatam01`
- Password: `baznas01`

**Body (JSON)**:
```json
{
  "username": "baznasbatam01",
  "password": "baznas01"
}
```

---

## 2. Reference Tables (Optional)
Check if reference data exists:
- `GET {{base_url}}/api/ref/kecamatan`
- `GET {{base_url}}/api/ref/kelurahan`
- `GET {{base_url}}/api/ref/asnaf`

---

## 3. Muzakki (Donors)
**Endpoint**: `POST {{base_url}}/api/muzakki`
**Body (JSON)**:
```json
{
  "npwz": "NPWZ-TEST-001",
  "nama": "Budi Test Muzakki",
  "nik": "1234567890123402",
  "no_hp": "08123456780",
  "jenis_muzakki_id": 1,
  "jenis_upz_id": 1,
  "kelurahan_id": 1,
  "kecamatan_id": 1,
  "registered_by": 1
}
```

---

## 4. Mustahiq (Recipients)
**Endpoint**: `POST {{base_url}}/api/mustahiq`
**Body (JSON)**:
```json
{
  "nrm": "NRM-TEST-001",
  "nama": "Ahmad Test Mustahiq",
  "nik": "1234567890123401",
  "no_hp": "08123456789",
  "alamat": "Jl. Test No. 1",
  "kelurahan_id": 1,
  "kecamatan_id": 1,
  "asnaf_id": 1,
  "kategori_mustahiq_id": 1,
  "registered_by": 1
}
```

---

## 5. Penerimaan (ZIS Collection)
Testing this will automatically update Muzakki's total stats.
**Endpoint**: `POST {{base_url}}/api/penerimaan`
**Body (JSON)**:
```json
{
  "muzakki_id": 1,
  "tanggal": "2026-02-25",
  "via_id": 1,
  "zis_id": 1,
  "jenis_zis_id": 1,
  "jumlah": 500000,
  "persentase_amil_id": 1,
  "created_by": 1
}
```

---

## 6. Distribusi (ZIS Distribution)
Testing this will automatically update Mustahiq's total stats.
**Endpoint**: `POST {{base_url}}/api/distribusi`
**Body (JSON)**:
```json
{
  "mustahiq_id": 1,
  "tanggal": "2026-02-25",
  "nama_program_id": 1,
  "jumlah": 300000,
  "created_by": 1
}
```

---

## 7. Laporan & Export
- **Rekap Harian**: `GET {{base_url}}/api/penerimaan/rekap/harian?tanggal=2026-02-25`
- **Arus Kas**: `GET {{base_url}}/api/laporan/arus-kas?tahun=2026&bulan=Februari`
- **Export Excel**: `GET {{base_url}}/api/laporan/mustahiq/export` (Use *Send and Download*)

---

## Tips
- Always run **Login** first to update your `token`.
- If a request fails with **422**, check the response for missing `_id` fields.
- Triggers will automatically calculate `dana_amil` and update totals.
