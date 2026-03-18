/**
 * Simple validation middleware to check for required fields
 * @param {Array} fields - List of required field names
 */
exports.validateFields = (fields) => (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Please provide all required fields: ${missingFields.join(', ')}`
        });
    }

    next();
};

/**
 * Validates email format
 */
exports.isValidEmail = (email) => {
    const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};
