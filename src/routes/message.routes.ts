import { Router } from 'express';
import { postMessage, getMessagesBetweenUsers, getMessagesByUser, acknowledgeMessage} from '../controllers/message.controller';

const router = Router();

router.post('/', postMessage);
router.get('/:userId', getMessagesByUser);
router.get('/:user1Id/:user2Id', getMessagesBetweenUsers);
router.put('/:id', acknowledgeMessage);

export default router;