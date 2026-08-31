// Thrown from a controller (or middleware) to produce a specific status code
// and message from the global error handler in index.js, instead of every
// call site building its own res.status(...).send(...).
class AppError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

module.exports = AppError;
