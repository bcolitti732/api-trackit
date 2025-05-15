import { Router } from 'express';
import { postMessage, getMessagesBetweenUsers, getMessagesByUser, acknowledgeMessage, getUserContacts, startConversation} from '../controllers/message.controller';

const router = Router();

router.post('/', postMessage);
router.get('/contacts/:userId', getUserContacts);
router.get('/:user1Id/:user2Id', getMessagesBetweenUsers);
router.get('/:userId', getMessagesByUser);
router.put('/acknowledge', acknowledgeMessage);
router.post('/start', startConversation);

export default router;