const questions = [
    {
        id: 1,
        question: "Which language runs natively in a web browser?",
        options: ["Java", "JavaScript", "C", "Python"],
        correctAnswer: "JavaScript",
    },
    {
        id: 2,
        question: "Which HTTP method is commonly used to retrieve data?",
        options: ["POST", "DELETE", "GET", "PATCH"],
        correctAnswer: "GET",
    },
];

function getQuestions(req, res) {
    const publicQuestions = questions.map(
        ({ correctAnswer, ...question }) => question
    );

    return res.status(200).json({
        success: true,
        message: "Demo assessment questions retrieved.",
        data: publicQuestions,
    });
}

function submitAssessment(req, res) {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Answers must be a non-empty array.",
        });
    }

    const validIds = new Set(questions.map((question) => question.id));

    const invalidAnswer = answers.some(
        (answer) =>
            !answer ||
            !Number.isInteger(answer.questionId) ||
            typeof answer.answer !== "string" ||
            !validIds.has(answer.questionId)
    );

    if (invalidAnswer) {
        return res.status(400).json({
            success: false,
            message: "One or more submitted answers are invalid.",
        });
    }

    const submittedIds = answers.map((answer) => answer.questionId);

    if (new Set(submittedIds).size !== submittedIds.length) {
        return res.status(400).json({
            success: false,
            message: "Each question can only be answered once.",
        });
    }

    const correctCount = answers.filter((answer) => {
        const question = questions.find(
            (item) => item.id === answer.questionId
        );

        return question.correctAnswer === answer.answer;
    }).length;

    const percentage = Math.round(
        (correctCount / questions.length) * 100
    );

    return res.status(200).json({
        success: true,
        message: "Demo assessment evaluated.",
        data: {
            totalQuestions: questions.length,
            answeredQuestions: answers.length,
            correctAnswers: correctCount,
            scorePercentage: percentage,
            note: "Demo result only; this is not a verified skill score.",
        },
    });
}

module.exports = { getQuestions, submitAssessment };
