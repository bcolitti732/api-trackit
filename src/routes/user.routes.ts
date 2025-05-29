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
    getDeliveryQueue, // Importamos la función del controlador
    updateDeliveryQueue, // Importamos la función del controlador
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
router.post('/:name/packets', authMiddleware, addPacketToUser);

// Nuevas rutas para la deliveryQueue, para probarlas borrar authMiddleware ya que el inicio de sesión no está implementado en swagger!!
router.get('/:name/delivery-queue',  getDeliveryQueue);
router.put('/:name/delivery-queue',  updateDeliveryQueue);



export default router;