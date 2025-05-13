"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: (props) => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    available: {
        type: Boolean,
        required: true,
        default: true
    },
    birthdate: {
        type: Date,
        required: true,
    },
    isProfileComplete: {
        type: Boolean,
        default: true,
    },
    packets: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Packet" }],
    role: {
        type: String,
        enum: ["admin", "user", "dealer"],
        default: "user",
    },
    deliveryProfileId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Delivery",
        required: false
    }
});
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=user.js.map