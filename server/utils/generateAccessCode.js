/**
 * Generates a random alphanumeric access code for exams
 * @param {number} length - Desired length of the code
 * @returns {string} - Generated code
 */
const generateAccessCode = (length = 8) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

module.exports = generateAccessCode;
