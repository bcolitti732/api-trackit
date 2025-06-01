"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
router.get("/", auth_middleware_1.authMiddleware, user_controller_1.getAllUsers);
router.post("/", auth_middleware_1.authMiddleware, user_controller_1.postUser);
router.get("/me", auth_middleware_1.authMiddleware, (req, res, next) => {
    var _a;
    req.params.name = (_a = req.user) === null || _a === void 0 ? void 0 : _a.name;
    next();
}, user_controller_1.getUserByName);
router.get('/:id', auth_middleware_1.authMiddleware, user_controller_1.getUserById);
router.get('/name/:name', auth_middleware_1.authMiddleware, user_controller_1.getUserByName);
router.put('/:id', auth_middleware_1.authMiddleware, user_controller_1.updateUserById);
router.delete('/:id', auth_middleware_1.authMiddleware, user_controller_1.deleteUserById);
router.put('/:id/deactivate', auth_middleware_1.authMiddleware, user_controller_1.deactivateUserById);
router.get('/:id/packets', auth_middleware_1.authMiddleware, user_controller_1.getUserPackets);
router.get('/:id/assigned-packets', auth_middleware_1.authMiddleware, user_controller_1.getAssignedPackets);
router.post('/:name/packets', auth_middleware_1.authMiddleware, user_controller_1.addPacketToUser);
router.post('/:id/assign-packet', auth_middleware_1.authMiddleware, user_controller_1.assignPacket);
router.get('/:id/optimized-route', auth_middleware_1.authMiddleware, user_controller_1.getOptimizedRoute);
exports.default = router;
//# sourceMappingURL=user.routes.js.map