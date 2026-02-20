import { z } from 'zod';

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body);
    req.body = parsed; // Use parsed data (stripped of unknown keys if configured)
    next();
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: e.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    next(e);
  }
};

export default validate;
