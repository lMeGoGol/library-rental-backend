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
    renewals: {
        type: Number,
        default: 0,
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
    default: "issued"
    }
}, { timestamps: true });

issuedBookSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

issuedBookSchema.index({ reader: 1, status: 1, createdAt: -1 });
issuedBookSchema.index({ book: 1, status: 1 });
issuedBookSchema.index({ expectedReturnDate: 1, status: 1 });

module.exports = mongoose.model("IssuedBook", issuedBookSchema);