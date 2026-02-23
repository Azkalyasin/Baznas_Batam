/**
 * Token Blacklist — In-Memory Implementation
 *
 * Menyimpan JWT ID (jti) yang sudah di-logout beserta waktu expiry-nya.
 * Token yang masuk blacklist tidak bisa dipakai lagi meski belum expired.
 *
 * Trade-off:
 *  ✅ Zero dependencies, langsung jalan
 *  ⚠️  Hilang saat server restart (acceptable untuk stateless JWT design)
 *  ⚠️  Tidak cocok untuk multi-instance server → ganti ke Redis/DB
 *
 * Untuk upgrade ke Redis, cukup ganti 2 fungsi: addToBlacklist & isBlacklisted
 */

// Map<jti: string, expiresAt: number (Unix timestamp ms)>
const blacklist = new Map();

/**
 * Tambahkan token ke blacklist.
 * @param {string} jti - JWT ID unik dari token
 * @param {number} exp - Waktu expiry token (Unix timestamp detik, dari JWT payload)
 */
const addToBlacklist = (jti, exp) => {
  const expiresAtMs = exp * 1000; // Konversi detik → ms
  blacklist.set(jti, expiresAtMs);
};

/**
 * Cek apakah token sudah di-blacklist.
 * @param {string} jti
 * @returns {boolean}
 */
const isBlacklisted = (jti) => {
  return blacklist.has(jti);
};

/**
 * Bersihkan token yang sudah expired dari blacklist.
 * Otomatis dipanggil setiap 15 menit.
 */
const cleanup = () => {
  const now = Date.now();
  for (const [jti, expiresAt] of blacklist.entries()) {
    if (now > expiresAt) {
      blacklist.delete(jti);
    }
  }
};

// Auto-cleanup setiap 15 menit agar memory tidak terus bertambah
// .unref() agar timer ini tidak mencegah proses Node/Jest untuk exit
setInterval(cleanup, 15 * 60 * 1000).unref();

export default { addToBlacklist, isBlacklisted };
