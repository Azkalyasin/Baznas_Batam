import { z } from 'zod';

const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const data = {
      body: req.body,
      query: req.query,
      params: req.params,
    }[source];

    const parsed = schema.parse(data);

    // req.query is read-only, use Object.assign to mutate in place
    if (source === 'body') req.body = parsed;
    if (source === 'query') Object.assign(req.query, parsed);
    if (source === 'params') Object.assign(req.params, parsed);

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