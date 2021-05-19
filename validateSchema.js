const { sanitize } = require('express-mongo-sanitize');
const sanitizeHtml = require('sanitize-html');
const BaseJoi = require('joi');
// validate data before inserting or updating something (cheat from POSTMAN), this schema has nothing to do with schema of mongoose

// defining an extension on joi.string()
// prevent html, script code on data 
const extension = (joi) => ({
    type: "string",
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not inclue HTML"
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error("string.escapeHTML", {value}) 
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
    // Joi.object() is data type
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
});

// validate for review comments
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})

