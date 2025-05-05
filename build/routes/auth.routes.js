"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
router.post("/verify", auth_controller_1.verifyTokenEndpoint);
router.post("/refresh", auth_controller_1.refreshToken);
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), (req, res) => {
    const { accessToken, refreshToken, isProfileComplete } = req.user;
    const redirectUrl = new URL('http://localhost:3000/login/callback');
    redirectUrl.searchParams.append('accessToken', accessToken);
    redirectUrl.searchParams.append('refreshToken', refreshToken);
    redirectUrl.searchParams.append('isProfileComplete', String(isProfileComplete));
    res.redirect(redirectUrl.toString());
});
router.put("/complete-profile", auth_middleware_1.authMiddleware, auth_controller_1.completeProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map