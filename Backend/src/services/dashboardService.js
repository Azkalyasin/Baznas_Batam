import Penerimaan from '../models/penerimaanModel.js';
import Distribusi from '../models/distribusiModel.js';
import { Op } from 'sequelize';
import db from '../config/database.js';

const getDashboardInfo = async (query) => {
  const now = new Date();
  const tahun = parseInt(query.tahun) || now.getFullYear();

  // Call the stored procedure for overview statistics
  const [results] = await db.query(
    'CALL sp_dashboard_overview_by_year(:tahun)',
    {
      replacements: { tahun },
      type: db.QueryTypes.RAW
    }
  );

  // Results will be an array since it's a multi-statement result from a stored procedure
  // With db.query and RAW, it usually returns the first result set as the first element of an array
  const overview = results || {};

  return {
    overview: {
      total_muzakki: parseInt(overview.total_muzakki) || 0,
      total_mustahiq: parseInt(overview.total_mustahiq) || 0,
      total_penerimaan: parseFloat(overview.total_penerimaan) || 0,
      total_distribusi: parseFloat(overview.total_distribusi) || 0
    },
    tahun
  };
};

export default {
  getDashboardInfo
};
