import { Router } from 'express';
import { postMessage, getMessagesBetweenUsers, getMessagesByUser, acknowledgeMessage, getUserContacts, startConversation} from '../controllers/message.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware,postMessage);
router.get('/contacts/:userId',authMiddleware,getUserContacts);
router.get('/:user1Id/:user2Id', authMiddleware,getMessagesBetweenUsers);
router.get('/:userId', authMiddleware,getMessagesByUser);
router.put('/acknowledge', authMiddleware,acknowledgeMessage);
router.post('/start', authMiddleware, startConversation);

export default router;