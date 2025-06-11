import { Router } from 'express';
import { postPacket, getAllPackets, getPacketById, updatePacketById, deletePacketById, getUserByPacketId } from '../controllers/packet.controller';
import { auth } from 'google-auth-library';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/',postPacket);
router.get('/',getAllPackets);
router.get('/:id',getPacketById);
router.put('/:id',updatePacketById);
router.get('/:id/user', authMiddleware, getUserByPacketId);
router.delete('/:id',authMiddleware, deletePacketById);

export default router;