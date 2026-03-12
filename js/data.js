// Emotion Temperature Test - Questions & Results Data
// All user-facing strings use i18n keys resolved at display time

const QUESTIONS = [
    {
        textKey: "questions.q1.text",
        options: [
            { textKey: "questions.q1.o1", score: 4 },
            { textKey: "questions.q1.o2", score: 3 },
            { textKey: "questions.q1.o3", score: 1 },
            { textKey: "questions.q1.o4", score: 0 }
        ]
    },
    {
        textKey: "questions.q2.text",
        options: [
            { textKey: "questions.q2.o1", score: 0 },
            { textKey: "questions.q2.o2", score: 2 },
            { textKey: "questions.q2.o3", score: 3 },
            { textKey: "questions.q2.o4", score: 4 }
        ]
    },
    {
        textKey: "questions.q3.text",
        options: [
            { textKey: "questions.q3.o1", score: 4 },
            { textKey: "questions.q3.o2", score: 3 },
            { textKey: "questions.q3.o3", score: 1 },
            { textKey: "questions.q3.o4", score: 0 }
        ]
    },
    {
        textKey: "questions.q4.text",
        options: [
            { textKey: "questions.q4.o1", score: 4 },
            { textKey: "questions.q4.o2", score: 2 },
            { textKey: "questions.q4.o3", score: 1 },
            { textKey: "questions.q4.o4", score: 0 }
        ]
    },
    {
        textKey: "questions.q5.text",
        options: [
            { textKey: "questions.q5.o1", score: 3 },
            { textKey: "questions.q5.o2", score: 2 },
            { textKey: "questions.q5.o3", score: 1 },
            { textKey: "questions.q5.o4", score: 0 }
        ]
    },
    {
        textKey: "questions.q6.text",
        options: [
            { textKey: "questions.q6.o1", score: 4 },
            { textKey: "questions.q6.o2", score: 2 },
            { textKey: "questions.q6.o3", score: 1 },
            { textKey: "questions.q6.o4", score: 0 }
        ]
    },
    {
        textKey: "questions.q7.text",
        options: [
            { textKey: "questions.q7.o1", score: 4 },
            { textKey: "questions.q7.o2", score: 3 },
            { textKey: "questions.q7.o3", score: 1 },
            { textKey: "questions.q7.o4", score: 0 }
        ]
    },
    {
        textKey: "questions.q8.text",
        options: [
            { textKey: "questions.q8.o1", score: 4 },
            { textKey: "questions.q8.o2", score: 3 },
            { textKey: "questions.q8.o3", score: 1 },
            { textKey: "questions.q8.o4", score: 0 }
        ]
    },
    {
        textKey: "questions.q9.text",
        options: [
            { textKey: "questions.q9.o1", score: 4 },
            { textKey: "questions.q9.o2", score: 3 },
            { textKey: "questions.q9.o3", score: 1 },
            { textKey: "questions.q9.o4", score: 0 }
        ]
    },
    {
        textKey: "questions.q10.text",
        options: [
            { textKey: "questions.q10.o1", score: 4 },
            { textKey: "questions.q10.o2", score: 3 },
            { textKey: "questions.q10.o3", score: 1 },
            { textKey: "questions.q10.o4", score: 0 }
        ]
    }
];

const RESULTS = [
    {
        min: -10, max: -5, temp: -8, emoji: "\uD83E\uDDCA",
        titleKey: "results.r1.title",
        subtitleKey: "results.r1.subtitle",
        color: "#1e3a5f", colorEnd: "#0a1628",
        descKey: "results.r1.desc",
        traitsKeys: ["results.r1.t1", "results.r1.t2", "results.r1.t3", "results.r1.t4"],
        activitiesKeys: ["results.r1.a1", "results.r1.a2", "results.r1.a3", "results.r1.a4"],
        warningsKeys: ["results.r1.w1", "results.r1.w2"],
        compatKey: "results.r1.compat",
        adviceKey: "results.r1.advice",
        quoteKey: "results.r1.quote",
        statisticsKey: "results.r1.statistics"
    },
    {
        min: -4, max: 0, temp: -2, emoji: "\u2744\uFE0F",
        titleKey: "results.r2.title",
        subtitleKey: "results.r2.subtitle",
        color: "#2d4a7a", colorEnd: "#142236",
        descKey: "results.r2.desc",
        traitsKeys: ["results.r2.t1", "results.r2.t2", "results.r2.t3", "results.r2.t4"],
        activitiesKeys: ["results.r2.a1", "results.r2.a2", "results.r2.a3", "results.r2.a4"],
        warningsKeys: ["results.r2.w1", "results.r2.w2"],
        compatKey: "results.r2.compat",
        adviceKey: "results.r2.advice",
        quoteKey: "results.r2.quote",
        statisticsKey: "results.r2.statistics"
    },
    {
        min: 1, max: 5, temp: 3, emoji: "\uD83C\uDF27\uFE0F",
        titleKey: "results.r3.title",
        subtitleKey: "results.r3.subtitle",
        color: "#3d5a80", colorEnd: "#1a2a40",
        descKey: "results.r3.desc",
        traitsKeys: ["results.r3.t1", "results.r3.t2", "results.r3.t3", "results.r3.t4"],
        activitiesKeys: ["results.r3.a1", "results.r3.a2", "results.r3.a3", "results.r3.a4"],
        warningsKeys: ["results.r3.w1", "results.r3.w2"],
        compatKey: "results.r3.compat",
        adviceKey: "results.r3.advice",
        quoteKey: "results.r3.quote",
        statisticsKey: "results.r3.statistics"
    },
    {
        min: 6, max: 10, temp: 8, emoji: "\uD83C\uDF24\uFE0F",
        titleKey: "results.r4.title",
        subtitleKey: "results.r4.subtitle",
        color: "#457b9d", colorEnd: "#1d3557",
        descKey: "results.r4.desc",
        traitsKeys: ["results.r4.t1", "results.r4.t2", "results.r4.t3", "results.r4.t4"],
        activitiesKeys: ["results.r4.a1", "results.r4.a2", "results.r4.a3", "results.r4.a4"],
        warningsKeys: ["results.r4.w1", "results.r4.w2"],
        compatKey: "results.r4.compat",
        adviceKey: "results.r4.advice",
        quoteKey: "results.r4.quote",
        statisticsKey: "results.r4.statistics"
    },
    {
        min: 11, max: 15, temp: 13, emoji: "\uD83C\uDF38",
        titleKey: "results.r5.title",
        subtitleKey: "results.r5.subtitle",
        color: "#e07a5f", colorEnd: "#8c3e2a",
        descKey: "results.r5.desc",
        traitsKeys: ["results.r5.t1", "results.r5.t2", "results.r5.t3", "results.r5.t4"],
        activitiesKeys: ["results.r5.a1", "results.r5.a2", "results.r5.a3", "results.r5.a4"],
        warningsKeys: ["results.r5.w1", "results.r5.w2"],
        compatKey: "results.r5.compat",
        adviceKey: "results.r5.advice",
        quoteKey: "results.r5.quote",
        statisticsKey: "results.r5.statistics"
    },
    {
        min: 16, max: 20, temp: 18, emoji: "\u2600\uFE0F",
        titleKey: "results.r6.title",
        subtitleKey: "results.r6.subtitle",
        color: "#f4a261", colorEnd: "#a85d18",
        descKey: "results.r6.desc",
        traitsKeys: ["results.r6.t1", "results.r6.t2", "results.r6.t3", "results.r6.t4"],
        activitiesKeys: ["results.r6.a1", "results.r6.a2", "results.r6.a3", "results.r6.a4"],
        warningsKeys: ["results.r6.w1", "results.r6.w2"],
        compatKey: "results.r6.compat",
        adviceKey: "results.r6.advice",
        quoteKey: "results.r6.quote",
        statisticsKey: "results.r6.statistics"
    },
    {
        min: 21, max: 25, temp: 23, emoji: "\uD83C\uDF3B",
        titleKey: "results.r7.title",
        subtitleKey: "results.r7.subtitle",
        color: "#e76f51", colorEnd: "#9c3a1e",
        descKey: "results.r7.desc",
        traitsKeys: ["results.r7.t1", "results.r7.t2", "results.r7.t3", "results.r7.t4"],
        activitiesKeys: ["results.r7.a1", "results.r7.a2", "results.r7.a3", "results.r7.a4"],
        warningsKeys: ["results.r7.w1", "results.r7.w2"],
        compatKey: "results.r7.compat",
        adviceKey: "results.r7.advice",
        quoteKey: "results.r7.quote",
        statisticsKey: "results.r7.statistics"
    },
    {
        min: 26, max: 40, temp: 35, emoji: "\uD83D\uDD25",
        titleKey: "results.r8.title",
        subtitleKey: "results.r8.subtitle",
        color: "#d62828", colorEnd: "#6b1010",
        descKey: "results.r8.desc",
        traitsKeys: ["results.r8.t1", "results.r8.t2", "results.r8.t3", "results.r8.t4"],
        activitiesKeys: ["results.r8.a1", "results.r8.a2", "results.r8.a3", "results.r8.a4"],
        warningsKeys: ["results.r8.w1", "results.r8.w2", "results.r8.w3"],
        compatKey: "results.r8.compat",
        adviceKey: "results.r8.advice",
        quoteKey: "results.r8.quote",
        statisticsKey: "results.r8.statistics"
    }
];

// Score to temperature mapping
function scoreToTemp(totalScore) {
    // Total score range: 0 (all 0) to 40 (all 4)
    // Map to temperature: -10 to 40
    const ratio = totalScore / 40;
    return Math.round(-10 + ratio * 50);
}

function getResult(temp) {
    for (const r of RESULTS) {
        if (temp >= r.min && temp <= r.max) return r;
    }
    return RESULTS[RESULTS.length - 1];
}
