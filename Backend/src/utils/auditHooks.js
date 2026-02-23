import auditLogService from '../services/auditLogService.js';

/**
 * Register global hooks for Audit Trail.
 * @param {import('sequelize').Model} model - Sequelize model
 * @param {string} tableName - Display name for the table
 */
export const registerAuditHooks = (model, tableName) => {
  model.addHook('afterCreate', async (instance, options) => {
    // skip logging for AuditLog table itself
    if (tableName === 'audit_log') return;
    
    const userId = options.userId || null;
    const ipAddress = options.ipAddress || null;
    
    await auditLogService.logAction(
      userId, 
      tableName, 
      'INSERT', 
      null, 
      instance.toJSON(), 
      ipAddress
    );
  });

  model.addHook('afterUpdate', async (instance, options) => {
    if (tableName === 'audit_log') return;

    const userId = options.userId || null;
    const ipAddress = options.ipAddress || null;

    // Ambil data sebelum perubahan
    // _previousDataValues berisi nilai asli sebelum di-update
    const oldData = instance._previousDataValues;
    const newData = instance.toJSON();

    await auditLogService.logAction(
      userId, 
      tableName, 
      'UPDATE', 
      oldData, 
      newData, 
      ipAddress
    );
  });

  model.addHook('afterDestroy', async (instance, options) => {
    if (tableName === 'audit_log') return;

    const userId = options.userId || null;
    const ipAddress = options.ipAddress || null;

    await auditLogService.logAction(
      userId, 
      tableName, 
      'DELETE', 
      instance.toJSON(), 
      null, 
      ipAddress
    );
  });
};
