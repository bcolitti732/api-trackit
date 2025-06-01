import { Router } from 'express';

const router = Router();

import { 
    postUser, 
    getAllUsers, 
    getUserById, 
    deleteUserById, 
    updateUserById, 
    deactivateUserById, 
    getUserPackets, 
    addPacketToUser, 
    getUserByName,
    assignPacket,
    getAssignedPackets,
    getOptimizedRoute
} from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { auth } from 'google-auth-library';

router.get("/",authMiddleware, getAllUsers);
router.post("/",authMiddleware, postUser);
router.get("/me", authMiddleware, (req, res, next) => {
    req.params.name = req.user?.name;
    next();
}, getUserByName);
router.get('/:id',authMiddleware, getUserById);
router.get('/name/:name', authMiddleware,getUserByName);
router.put('/:id', authMiddleware,updateUserById);
router.delete('/:id',authMiddleware, deleteUserById);
router.put('/:id/deactivate', authMiddleware,deactivateUserById);
router.get('/:id/packets', authMiddleware, getUserPackets);
router.get('/:id/assigned-packets', authMiddleware,getAssignedPackets);
router.post('/:name/packets', authMiddleware,addPacketToUser);
router.post('/:id/assign-packet',authMiddleware,assignPacket);
router.get('/:id/optimized-route', authMiddleware,getOptimizedRoute);
export default router;