import { Router } from 'express';
import { sendNotificationToUser } from '../controllers/notification.controller';

const router = Router();

router.get('/send/:userId', sendNotificationToUser);

export default router;