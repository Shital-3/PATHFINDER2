const { randomUUID } = require("crypto");

const dilemmas = new Map();

function createDilemma(req, res) {
    const { title, options, constraints = [] } = req.body;

    if (
        !Array.isArray(options) ||
        options.length < 2 ||
        options.some((option) => typeof option !== "string" || !option.trim())
    ) {
        return res.status(400).json({
            success: false,
            message: "Provide at least two valid career options.",
        });
    }

    if (!Array.isArray(constraints)) {
        return res.status(400).json({
            success: false,
            message: "Constraints must be an array.",
        });
    }

    const dilemma = {
        id: randomUUID(),
        title: title.trim(),
        options: options.map((option) => option.trim()),
        constraints,
        createdAt: new Date().toISOString(),
    };

    dilemmas.set(dilemma.id, dilemma);

    return res.status(201).json({
        success: true,
        message: "Career dilemma created successfully.",
        data: dilemma,
    });
}

function getDilemma(req, res) {
    const dilemma = dilemmas.get(req.params.id);

    if (!dilemma) {
        return res.status(404).json({
            success: false,
            message: "Career dilemma not found.",
        });
    }

    return res.status(200).json({
        success: true,
        data: dilemma,
    });
}

module.exports = { createDilemma, getDilemma };
