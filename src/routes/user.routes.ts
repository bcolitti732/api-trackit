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
    getAssignedPackets,
    assignPacketToDelivery
} from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

router.get("/", getAllUsers);
router.post("/", postUser);
router.get("/me", authMiddleware, (req, res, next) => {
    req.params.name = req.user?.name;
    next();
}, getUserByName);
router.get('/:id', getUserById);
router.get('/name/:name', getUserByName);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUserById);
router.put('/:id/deactivate', deactivateUserById);
router.get('/:id/packets', authMiddleware, getUserPackets);
router.post('/:name/packets', addPacketToUser);
router.get('/:id/assignedPackets', getAssignedPackets);
router.post('/assign-packet', assignPacketToDelivery);




export default router;