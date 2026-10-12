function validateBody(requiredFields) {
    return (req, res, next) => {
        const body = req.body;

        if (!body || typeof body !== "object" || Array.isArray(body)) {
            return res.status(400).json({
                success: false,
                message: "Request body must be a JSON object.",
            });
        }

        const missingFields = requiredFields.filter((field) => {
            const value = body[field];

            if (typeof value === "string") {
                return value.trim().length === 0;
            }

            return value === undefined || value === null;
        });

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing.",
                missingFields,
            });
        }

        next();
    };
}

module.exports = { validateBody };
