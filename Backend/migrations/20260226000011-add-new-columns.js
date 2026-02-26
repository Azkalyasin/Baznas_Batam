'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // ================================================================
        // MUZAKKI: tambah registered_date dan tgl_lahir
        // ================================================================
        await queryInterface.addColumn('muzakki', 'registered_date', {
            type: Sequelize.DATEONLY,
            allowNull: true,
            after: 'keterangan'
        });
        await queryInterface.addColumn('muzakki', 'tgl_lahir', {
            type: Sequelize.DATEONLY,
            allowNull: true,
            after: 'registered_date'
        });

        // ================================================================
        // MUSTAHIQ: tambah registered_date dan tgl_lahir
        // ================================================================
        await queryInterface.addColumn('mustahiq', 'registered_date', {
            type: Sequelize.DATEONLY,
            allowNull: true,
            after: 'keterangan'
        });
        await queryInterface.addColumn('mustahiq', 'tgl_lahir', {
            type: Sequelize.DATEONLY,
            allowNull: true,
            after: 'registered_date'
        });

        // ================================================================
        // DISTRIBUSI: tambah kolom-kolom permohonan dan survei
        // ================================================================
        await queryInterface.addColumn('distribusi', 'tgl_masuk_permohonan', {
            type: Sequelize.DATEONLY,
            allowNull: true,
            after: 'keterangan'
        });
        await queryInterface.addColumn('distribusi', 'tgl_survei', {
            type: Sequelize.DATEONLY,
            allowNull: true,
            after: 'tgl_masuk_permohonan'
        });
        await queryInterface.addColumn('distribusi', 'surveyor', {
            type: Sequelize.STRING(100),
            allowNull: true,
            after: 'tgl_survei'
        });
        await queryInterface.addColumn('distribusi', 'jumlah_permohonan', {
            type: Sequelize.DECIMAL(15, 2),
            allowNull: true,
            after: 'surveyor'
        });
        await queryInterface.addColumn('distribusi', 'status', {
            type: Sequelize.ENUM('diterima', 'ditolak'),
            allowNull: true,
            after: 'jumlah_permohonan'
        });
        await queryInterface.addColumn('distribusi', 'no_reg_bpp', {
            type: Sequelize.STRING(12),
            allowNull: true,
            after: 'status'
        });
    },

    async down(queryInterface) {
        // Muzakki
        await queryInterface.removeColumn('muzakki', 'registered_date');
        await queryInterface.removeColumn('muzakki', 'tgl_lahir');

        // Mustahiq
        await queryInterface.removeColumn('mustahiq', 'registered_date');
        await queryInterface.removeColumn('mustahiq', 'tgl_lahir');

        // Distribusi
        await queryInterface.removeColumn('distribusi', 'tgl_masuk_permohonan');
        await queryInterface.removeColumn('distribusi', 'tgl_survei');
        await queryInterface.removeColumn('distribusi', 'surveyor');
        await queryInterface.removeColumn('distribusi', 'jumlah_permohonan');
        await queryInterface.removeColumn('distribusi', 'status');
        await queryInterface.removeColumn('distribusi', 'no_reg_bpp');
    }
};
