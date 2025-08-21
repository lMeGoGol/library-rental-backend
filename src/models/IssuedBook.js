const mongoose = require("mongoose");

const issuedBookSchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    reader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    expectedReturnDate: {
        type: Date,
        required: true
    },
    actualReturnDate: {
        type: Date,
    },
    rentPerDay: {
        type: Number,
        required: true
    },
    days: {
        type: Number,
        required: true
    },
    discountCategory: {
        type: String,
    },
    discountPercent: {
        type: Number,
        default: 0
    },
    totalRent: {
        type: Number,
        required: true
    },
    deposit: {
        type: Number,
        required: true
    },
    penalty: {
        type: Number,
        default: 0,
    },
    damageFee: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ["issued", "returned"],
        dfault: "issued"
    }
}, { timestamps: true });

module.exports = mongoose.model("IssuedBook", issuedBookSchema);