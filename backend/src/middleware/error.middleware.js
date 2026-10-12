function notFound(req, res) {
    return res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}

function errorHandler(err, req, res, next) {
    console.error(err.stack || err);

    if (res.headersSent) {
        return next(err);
    }

    return res.status(err.status || 500).json({
        success: false,
        message:
            err.status && err.status < 500
                ? err.message
                : "Internal server error.",
    });
}

module.exports = { notFound, errorHandler };
