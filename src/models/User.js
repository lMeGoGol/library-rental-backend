const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    username: { 
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "librarian", "reader"],
        default: "reader" 
    },

    lastName: String,
    firstName: String,
    middleName: String,

    address: {
        type: String,
        required: function () {
            return this.role === "reader";
        }
    },
    phone: {
        type: String,
        required: function () {
            return this.role === "reader";
        }
    },
    discountCategory: {
        type: String,
        enum: ["none", "student", "loyal", "pensioner", "vip"],
        default: "none"
    }
}, { timestamps: true });

userSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
    }
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ lastName: 1, firstName: 1 });

module.exports = mongoose.model("User", userSchema);