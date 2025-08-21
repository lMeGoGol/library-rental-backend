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

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);