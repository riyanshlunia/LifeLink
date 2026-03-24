const { AuditLog } = require('../models');

const auditLogger = (action, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const logData = {
          user_id: req.user.id,
          action: action,
          entity_type: entityType,
          entity_id: data.data?.id || null,
          details: {
            method: req.method,
            path: req.path,
            body: req.body,
            params: req.params,
            query: req.query
          },
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.headers['user-agent']
        };

        AuditLog.create(logData).catch(err => {
          console.error('Audit log creation failed:', err);
        });
      }

      return originalJson(data);
    };

    next();
  };
};

module.exports = auditLogger;
