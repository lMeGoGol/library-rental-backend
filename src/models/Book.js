const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
    },
    deposit: {
        type: Number,
    required: true,
    min: 0
    },
    rentPrice: {
        type: Number,
    required: true,
    min: 0
    },
    genre: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 0,
    },
    availableCount: {
        type: Number,
        default: 1,
        min: 0,
    },
    reservedUntil: {
        type: Date,
    },
    isReserved: {
        type: Boolean,
        default: false,
        index: true
    }
}, { timestamps: true });

bookSchema.pre('save', function(next) {
    if (typeof this.availableCount === 'number') {
        this.available = this.availableCount > 0;
        if (typeof this.quantity === 'number' && this.availableCount > this.quantity) {
            this.availableCount = this.quantity;
        }
    }
    if (this.isReserved && this.reservedUntil && this.reservedUntil < new Date()) {
        this.isReserved = false;
    if (this.availableCount === 0) { }
    }
    next();
});

bookSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

bookSchema.index({ title: 'text', author: 'text', genre: 'text' });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ available: 1, availableCount: 1 });

module.exports = mongoose.model("Book", bookSchema);