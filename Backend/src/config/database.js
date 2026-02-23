import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,        // Maksimal 10 koneksi aktif bersamaan
    min: 2,         // Minimal 2 koneksi selalu siap
    acquire: 30000, // Batas waktu mendapat koneksi (30 detik)
    idle: 10000     // Koneksi idle ditutup setelah 10 detik
  }
});

export default db;
