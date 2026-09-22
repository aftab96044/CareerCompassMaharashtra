const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema(
    {},
    { strict: false }
);

module.exports = mongoose.model(
    "College",
    collegeSchema,
    "engineering_colleges"
);