"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
router.get("/", user_controller_1.getAllUsers);
router.post("/", user_controller_1.postUser);
router.get("/me", auth_middleware_1.authMiddleware, (req, res, next) => {
    var _a;
    req.params.name = (_a = req.user) === null || _a === void 0 ? void 0 : _a.name;
    next();
}, user_controller_1.getUserByName);
router.get('/:id', user_controller_1.getUserById);
router.get('/name/:name', user_controller_1.getUserByName);
router.put('/:id', user_controller_1.updateUserById);
router.delete('/:id', user_controller_1.deleteUserById);
router.put('/:id/deactivate', user_controller_1.deactivateUserById);
router.get('/:id/packets', auth_middleware_1.authMiddleware, user_controller_1.getUserPackets);
router.post('/:name/packets', user_controller_1.addPacketToUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map