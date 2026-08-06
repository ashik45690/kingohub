/**
 * Calculates the percentage score
 * @param {number} score - Correct answers count
 * @param {number} total - Total questions count
 * @returns {number} - Percentage
 */
exports.calculatePercentage = (score, total) => {
    if (total === 0) return 0;
    return parseFloat(((score / total) * 100).toFixed(2));
};

/**
 * Calculates time taken in seconds
 * @param {Date} start - Start time
 * @param {Date} end - End time
 * @returns {number} - Seconds
 */
exports.calculateTimeTaken = (start, end) => {
    const diff = new Date(end) - new Date(start);
    return Math.floor(diff / 1000); // return in seconds
};

/**
 * Helper to check if current time is within exam window
 * @param {Date} start - Exam start date
 * @param {Date} end - Exam end date
 * @returns {boolean}
 */
exports.isExamActive = (start, durationMins) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(startDate.getTime() + durationMins * 60000);
    return now >= startDate && now <= endDate;
};

/**
 * Returns status for student view based on time window and completion
 * @param {Date} start
 * @param {Date} end
 * @param {boolean} hasSubmitted
 * @returns {'upcoming'|'ongoing'|'completed'}
 */
exports.getStudentExamStatus = (start, durationMins, hasSubmitted) => {
    if (hasSubmitted) return 'completed';
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(startDate.getTime() + (durationMins || 0) * 60000);
    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'ongoing';
};

/**
 * Convert options input to {A,B,C,D} shape
 * @param {object|array} options
 * @returns {{A:string,B:string,C:string,D:string}}
 */
exports.normalizeOptions = (options) => {
    if (Array.isArray(options)) {
        return {
            A: options[0] ?? '',
            B: options[1] ?? '',
            C: options[2] ?? '',
            D: options[3] ?? ''
        };
    }
    return {
        A: options?.A ?? '',
        B: options?.B ?? '',
        C: options?.C ?? '',
        D: options?.D ?? ''
    };
};

/**
 * Convert options object to array [A,B,C,D]
 * @param {{A:string,B:string,C:string,D:string}} options
 * @returns {string[]}
 */
exports.optionsToArray = (options) => {
    if (Array.isArray(options)) {
        return [
            options[0] ?? '',
            options[1] ?? '',
            options[2] ?? '',
            options[3] ?? ''
        ];
    }
    return [
        options?.A ?? '',
        options?.B ?? '',
        options?.C ?? '',
        options?.D ?? ''
    ];
};

/**
 * Convert answer index (0-3) to letter (A-D)
 * @param {number|string} answer
 * @returns {string}
 */
exports.answerIndexToLetter = (answer) => {
    if (typeof answer === 'string' && ['A', 'B', 'C', 'D'].includes(answer)) {
        return answer;
    }
    const idx = Number(answer);
    if (Number.isNaN(idx) || idx < 0 || idx > 3) return 'A';
    return String.fromCharCode(65 + idx);
};

/**
 * Convert answer letter (A-D) to index (0-3)
 * @param {string|number} answer
 * @returns {number}
 */
exports.answerLetterToIndex = (answer) => {
    if (typeof answer === 'number') return answer;
    if (typeof answer === 'string') {
        const upper = answer.toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(upper)) {
            return upper.charCodeAt(0) - 65;
        }
        const maybe = Number(answer);
        if (!Number.isNaN(maybe)) return maybe;
    }
    return -1;
};
