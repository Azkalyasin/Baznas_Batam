import db from '../config/database.js';

const setupTriggers = async () => {
    try {
        console.log('Setting up Triggers and Stored Procedures...');

        // --- MUSTAHIQ TRIGGERS ---
        await db.query(`DROP TRIGGER IF EXISTS before_mustahiq_insert_validate`);
        await db.query(`
            CREATE TRIGGER before_mustahiq_insert_validate
            BEFORE INSERT ON mustahiq
            FOR EACH ROW
            BEGIN
            DECLARE existing_count INT;
            
            IF NEW.nik IS NOT NULL AND NEW.nik != '' THEN
                SELECT COUNT(*) INTO existing_count
                FROM mustahiq
                WHERE nik = NEW.nik;
                
                IF existing_count > 0 THEN
                SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'NIK sudah terdaftar di sistem';
                END IF;
            END IF;
            END;
        `);

        // --- DISTRIBUSI TRIGGERS ---
        await db.query(`DROP TRIGGER IF EXISTS after_distribusi_insert`);
        await db.query(`
            CREATE TRIGGER after_distribusi_insert
            AFTER INSERT ON distribusi
            FOR EACH ROW
            BEGIN
            UPDATE mustahiq
            SET total_penerimaan_count = total_penerimaan_count + 1,
                total_penerimaan_amount = total_penerimaan_amount + NEW.jumlah,
                last_received_date = NEW.tanggal
            WHERE id = NEW.mustahiq_id;
            END;
        `);

        await db.query(`DROP TRIGGER IF EXISTS before_distribusi_insert`);
        await db.query(`
            CREATE TRIGGER before_distribusi_insert
            BEFORE INSERT ON distribusi
            FOR EACH ROW
            BEGIN
            IF NEW.mustahiq_id IS NOT NULL THEN
                SET NEW.no_reg_bpp = (SELECT no_reg_bpp FROM mustahiq WHERE id = NEW.mustahiq_id);
                SET NEW.nrm = (SELECT nrm FROM mustahiq WHERE id = NEW.mustahiq_id);
                SET NEW.nama_mustahik = (SELECT nama FROM mustahiq WHERE id = NEW.mustahiq_id);
                SET NEW.nik = (SELECT nik FROM mustahiq WHERE id = NEW.mustahiq_id);
                SET NEW.alamat = (SELECT alamat FROM mustahiq WHERE id = NEW.mustahiq_id);
                SET NEW.kelurahan = (SELECT kelurahan FROM mustahiq WHERE id = NEW.mustahiq_id);
                SET NEW.kecamatan = (SELECT kecamatan FROM mustahiq WHERE id = NEW.mustahiq_id);
                SET NEW.no_hp = (SELECT no_hp FROM mustahiq WHERE id = NEW.mustahiq_id);
                SET NEW.asnaf = (SELECT asnaf FROM mustahiq WHERE id = NEW.mustahiq_id);
                
                SET NEW.bulan = CASE MONTH(NEW.tanggal)
                WHEN 1  THEN 'Januari' WHEN 2  THEN 'Februari' WHEN 3  THEN 'Maret'
                WHEN 4  THEN 'April' WHEN 5  THEN 'Mei' WHEN 6  THEN 'Juni'
                WHEN 7  THEN 'Juli' WHEN 8  THEN 'Agustus' WHEN 9  THEN 'September'
                WHEN 10 THEN 'Oktober' WHEN 11 THEN 'November' WHEN 12 THEN 'Desember'
                END;
                
                SET NEW.tahun = YEAR(NEW.tanggal);
            END IF;
            END;
        `);

        await db.query(`DROP TRIGGER IF EXISTS after_distribusi_update`);
        await db.query(`
            CREATE TRIGGER after_distribusi_update
            AFTER UPDATE ON distribusi
            FOR EACH ROW
            BEGIN
            IF NEW.mustahiq_id != OLD.mustahiq_id THEN
                UPDATE mustahiq
                SET
                total_penerimaan_count  = GREATEST(total_penerimaan_count - 1, 0),
                total_penerimaan_amount = GREATEST(total_penerimaan_amount - OLD.jumlah, 0),
                last_received_date = (SELECT MAX(tanggal) FROM distribusi WHERE mustahiq_id = OLD.mustahiq_id)
                WHERE id = OLD.mustahiq_id;

                UPDATE mustahiq
                SET
                total_penerimaan_count  = total_penerimaan_count + 1,
                total_penerimaan_amount = total_penerimaan_amount + NEW.jumlah,
                last_received_date = NEW.tanggal
                WHERE id = NEW.mustahiq_id;
            ELSEIF NEW.jumlah != OLD.jumlah THEN
                UPDATE mustahiq
                SET
                total_penerimaan_amount = total_penerimaan_amount + (NEW.jumlah - OLD.jumlah),
                last_received_date = NEW.tanggal
                WHERE id = NEW.mustahiq_id;
            END IF;
            END;
        `);

        await db.query(`DROP TRIGGER IF EXISTS after_distribusi_delete`);
        await db.query(`
            CREATE TRIGGER after_distribusi_delete
            AFTER DELETE ON distribusi
            FOR EACH ROW
            BEGIN
            UPDATE mustahiq
            SET total_penerimaan_count = GREATEST(total_penerimaan_count - 1, 0),
                total_penerimaan_amount = GREATEST(total_penerimaan_amount - OLD.jumlah, 0)
            WHERE id = OLD.mustahiq_id;
            
            UPDATE mustahiq
            SET last_received_date = (SELECT MAX(tanggal) FROM distribusi WHERE mustahiq_id = OLD.mustahiq_id)
            WHERE id = OLD.mustahiq_id;
            END;
        `);

        // --- MUZAKKI TRIGGERS ---
        await db.query(`DROP TRIGGER IF EXISTS before_muzakki_update_nik_check`);
        await db.query(`
            CREATE TRIGGER before_muzakki_update_nik_check
            BEFORE UPDATE ON muzakki
            FOR EACH ROW
            BEGIN
            IF NEW.nik IS NOT NULL AND NEW.nik != '' THEN
                IF EXISTS (SELECT 1 FROM muzakki WHERE nik = NEW.nik AND id != OLD.id) THEN
                SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'ERROR: NIK sudah terdaftar di tabel muzakki';
                END IF;
            END IF;
            END;
        `);

        await db.query(`DROP TRIGGER IF EXISTS before_muzakki_insert_nik_check`);
        await db.query(`
            CREATE TRIGGER before_muzakki_insert_nik_check
            BEFORE INSERT ON muzakki
            FOR EACH ROW
            BEGIN
            IF NEW.nik IS NOT NULL AND NEW.nik != '' THEN
                IF EXISTS (SELECT 1 FROM muzakki WHERE nik = NEW.nik) THEN
                SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'ERROR: NIK sudah terdaftar di tabel muzakki';
                END IF;
            END IF;
            END;
        `);

        // --- PENERIMAAN TRIGGERS ---
        await db.query(`DROP TRIGGER IF EXISTS before_penerimaan_insert`);
        await db.query(`
            CREATE TRIGGER before_penerimaan_insert
            BEFORE INSERT ON penerimaan
            FOR EACH ROW
            BEGIN
            IF NEW.muzakki_id IS NOT NULL THEN
                IF NOT EXISTS (SELECT 1 FROM muzakki WHERE id = NEW.muzakki_id) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: muzakki_id tidak ditemukan di tabel muzakki';
                END IF;

                IF (SELECT status FROM muzakki WHERE id = NEW.muzakki_id) != 'active' THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Muzakki tidak aktif, transaksi ditolak';
                END IF;

                SET NEW.npwz = (SELECT npwz FROM muzakki WHERE id = NEW.muzakki_id);
                SET NEW.nama_muzakki = (SELECT nama FROM muzakki WHERE id = NEW.muzakki_id);
                SET NEW.nik_muzakki = (SELECT nik FROM muzakki WHERE id = NEW.muzakki_id);
                SET NEW.no_hp_muzakki = (SELECT no_hp FROM muzakki WHERE id = NEW.muzakki_id);
                SET NEW.jenis_muzakki = (SELECT jenis_muzakki FROM muzakki WHERE id = NEW.muzakki_id);
                SET NEW.jenis_upz = (SELECT jenis_upz FROM muzakki WHERE id = NEW.muzakki_id);

                SET NEW.bulan = CASE MONTH(NEW.tanggal)
                WHEN 1  THEN 'Januari' WHEN 2  THEN 'Februari' WHEN 3  THEN 'Maret'
                WHEN 4  THEN 'April' WHEN 5  THEN 'Mei' WHEN 6  THEN 'Juni'
                WHEN 7  THEN 'Juli' WHEN 8  THEN 'Agustus' WHEN 9  THEN 'September'
                WHEN 10 THEN 'Oktober' WHEN 11 THEN 'November' WHEN 12 THEN 'Desember'
                END;

                SET NEW.tahun = YEAR(NEW.tanggal);
            END IF;
            END;
        `);

        await db.query(`DROP TRIGGER IF EXISTS after_penerimaan_insert`);
        await db.query(`
            CREATE TRIGGER after_penerimaan_insert
            AFTER INSERT ON penerimaan
            FOR EACH ROW
            BEGIN
            UPDATE muzakki
            SET
                total_setor_count  = total_setor_count + 1,
                total_setor_amount = total_setor_amount + NEW.jumlah,
                last_setor_date    = NEW.tanggal
            WHERE id = NEW.muzakki_id;
            END;
        `);

        await db.query(`DROP TRIGGER IF EXISTS after_penerimaan_delete`);
        await db.query(`
            CREATE TRIGGER after_penerimaan_delete
            AFTER DELETE ON penerimaan
            FOR EACH ROW
            BEGIN
            UPDATE muzakki
            SET
                total_setor_count  = GREATEST(total_setor_count - 1, 0),
                total_setor_amount = GREATEST(total_setor_amount - OLD.jumlah, 0)
            WHERE id = OLD.muzakki_id;

            UPDATE muzakki
            SET last_setor_date = (SELECT MAX(tanggal) FROM penerimaan WHERE muzakki_id = OLD.muzakki_id)
            WHERE id = OLD.muzakki_id;
            END;
        `);

         await db.query(`DROP TRIGGER IF EXISTS before_penerimaan_update`);
         await db.query(`
            CREATE TRIGGER before_penerimaan_update
            BEFORE UPDATE ON penerimaan
            FOR EACH ROW
            BEGIN
            IF NEW.muzakki_id != OLD.muzakki_id OR NEW.tanggal != OLD.tanggal THEN
                IF NOT EXISTS (SELECT 1 FROM muzakki WHERE id = NEW.muzakki_id) THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: muzakki_id tidak ditemukan di tabel muzakki';
                END IF;

                IF (SELECT status FROM muzakki WHERE id = NEW.muzakki_id) != 'active' THEN
                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ERROR: Muzakki tidak aktif, perubahan ditolak';
                END IF;

                SET NEW.npwz = (SELECT npwz FROM muzakki WHERE id = NEW.muzakki_id);
                SET NEW.nama_muzakki = (SELECT nama FROM muzakki WHERE id = NEW.muzakki_id);
                SET NEW.nik_muzakki = (SELECT nik FROM muzakki WHERE id = NEW.muzakki_id);
                SET NEW.no_hp_muzakki = (SELECT no_hp FROM muzakki WHERE id = NEW.muzakki_id);
                SET NEW.jenis_muzakki = (SELECT jenis_muzakki FROM muzakki WHERE id = NEW.muzakki_id);
                SET NEW.jenis_upz = (SELECT jenis_upz FROM muzakki WHERE id = NEW.muzakki_id);

                SET NEW.bulan = CASE MONTH(NEW.tanggal)
                WHEN 1  THEN 'Januari' WHEN 2  THEN 'Februari' WHEN 3  THEN 'Maret'
                WHEN 4  THEN 'April' WHEN 5  THEN 'Mei' WHEN 6  THEN 'Juni'
                WHEN 7  THEN 'Juli' WHEN 8  THEN 'Agustus' WHEN 9  THEN 'September'
                WHEN 10 THEN 'Oktober' WHEN 11 THEN 'November' WHEN 12 THEN 'Desember'
                END;
                SET NEW.tahun = YEAR(NEW.tanggal);
            END IF;
            END;
         `);

        await db.query(`DROP TRIGGER IF EXISTS after_penerimaan_update`);
        await db.query(`
            CREATE TRIGGER after_penerimaan_update
            AFTER UPDATE ON penerimaan
            FOR EACH ROW
            BEGIN
            IF NEW.muzakki_id != OLD.muzakki_id THEN
                UPDATE muzakki
                SET
                total_setor_count  = GREATEST(total_setor_count - 1, 0),
                total_setor_amount = GREATEST(total_setor_amount - OLD.jumlah, 0),
                last_setor_date = (SELECT MAX(tanggal) FROM penerimaan WHERE muzakki_id = OLD.muzakki_id)
                WHERE id = OLD.muzakki_id;

                UPDATE muzakki
                SET
                total_setor_count  = total_setor_count + 1,
                total_setor_amount = total_setor_amount + NEW.jumlah,
                last_setor_date    = NEW.tanggal
                WHERE id = NEW.muzakki_id;
            ELSEIF NEW.jumlah != OLD.jumlah THEN
                UPDATE muzakki
                SET
                total_setor_amount = total_setor_amount + (NEW.jumlah - OLD.jumlah),
                last_setor_date    = NEW.tanggal
                WHERE id = NEW.muzakki_id;
            END IF;
            END;
        `);


        // --- STORED PROCEDURES ---
        await db.query(`DROP PROCEDURE IF EXISTS sp_search_mustahiq`);
        await db.query(`
            CREATE PROCEDURE sp_search_mustahiq(IN search_term VARCHAR(200))
            BEGIN
            SELECT 
                id, no_reg_bpp, nrm, nik, nama, kelurahan, kecamatan, no_hp, asnaf, status,
                total_penerimaan_count, total_penerimaan_amount, last_received_date
            FROM mustahiq
            WHERE 
                nik = search_term OR nrm = search_term OR no_reg_bpp = search_term OR nama LIKE CONCAT('%', search_term, '%')
            ORDER BY 
                CASE 
                WHEN nik = search_term THEN 1
                WHEN nrm = search_term THEN 2
                WHEN no_reg_bpp = search_term THEN 3
                ELSE 4
                END, nama;
            END;
        `);

        await db.query(`DROP PROCEDURE IF EXISTS sp_mustahiq_history`);
        await db.query(`
            CREATE PROCEDURE sp_mustahiq_history(IN p_mustahiq_id INT)
            BEGIN
            SELECT 
                d.id, d.no_reg_bpp, d.tanggal, d.nama_program, d.jenis_program, d.asnaf, d.jumlah, d.keterangan
            FROM distribusi d
            WHERE d.mustahiq_id = p_mustahiq_id
            ORDER BY d.tanggal DESC;
            END;
        `);

        console.log('All Triggers and Procedures setup successfully.');
    } catch (error) {
        console.error('Error setting up DB triggers:', error);
    }
};

export default setupTriggers;
