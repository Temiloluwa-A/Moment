const AppError = require('../utils/AppError');

// Validates req[source] (default: body) against a zod schema. On success,
// req[source] is replaced with the parsed (and any zod-applied default/coerced)
// value; on failure, throws a 400 AppError with a readable message built from
// zod's issues instead of leaking a raw zod error shape to the client.
const validate = (schema, source = 'body') => (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
        const message = result.error.issues.map((issue) => issue.message).join(' ');
        return next(new AppError(400, message));
    }
    req[source] = result.data;
    next();
};

module.exports = validate;
