import {Router} from 'express';

const router = Router();

import {postDelivery, getAllDeliveries, deleteDelivery, updateDelivery} from '../controllers/delivery.controller';

router.get("/", getAllDeliveries);
router.post("/", postDelivery);
router.delete("/:id", deleteDelivery);
router.put("/:id", updateDelivery);

export default router;