import { Router } from 'express';
import { postPacket, getAllPackets, getPacketById, updatePacketById, deletePacketById } from '../controllers/packet.controller';
import { auth } from 'google-auth-library';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware,postPacket);
router.get('/', authMiddleware,getAllPackets);
router.get('/:id', authMiddleware,getPacketById);
router.put('/:id', authMiddleware,updatePacketById);
router.delete('/:id',authMiddleware, deletePacketById);

export default router;