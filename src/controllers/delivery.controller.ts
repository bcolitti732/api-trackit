import {Request, Response} from 'express';
import {IDelivery} from '../models/delivery';
import {DeliveryService} from '../services/delivery.service';

const deliveryService = new DeliveryService();

/**
 * @swagger
 * /api/deliveries:
 *   post:
 *     summary: Create a new delivery
 *     tags: [Deliveries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Delivery'
 *     responses:
 *       201:
 *         description: The delivery was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Delivery'
 *       400:
 *         description: Error creating delivery
 */
export async function postDelivery(req: Request, res: Response): Promise<void> {
    try {
        const delivery = req.body as IDelivery;
        const newDelivery = await deliveryService.postDelivery(delivery);
        res.status(201).json(newDelivery);
    } catch (error) {
        res.status(400).json({message: 'Error creating delivery', error});
    }
}

/**
 * @swagger
 * /api/deliveries:
 *   get:
 *     summary: Get all deliveries
 *     tags: [Deliveries]
 *     responses:
 *       200:
 *         description: List of all deliveries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Delivery'
 *       400:
 *         description: Error getting deliveries
 */
export async function getAllDeliveries(req: Request, res: Response): Promise<void> {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const deliveries = await deliveryService.getAllDeliveries(page, limit);
        res.status(200).json(deliveries);
    } catch (error) {
        res.status(400).json({message: 'Error getting deliveries', error});
    }
}

/**
 * @swagger
 * /api/deliveries/{id}:
 *   delete:
 *     summary: Delete a delivery by ID
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the delivery to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The delivery was successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Delivery'
 *       400:
 *         description: Error deleting delivery
 */
export async function deleteDelivery(req: Request, res: Response): Promise<void> {
    try {
        const deliveryId = req.params.id;
        const deletedDelivery = await deliveryService.deleteDelivery(deliveryId);
        if (deletedDelivery) {
            res.status(200).json(deletedDelivery);
        } else {
            res.status(404).json({message: 'Delivery not found'});
        }
    } catch (error) {
        res.status(400).json({message: 'Error deleting delivery', error});
    }
}

/**
 * @swagger
 * /api/deliveries/{id}:
 *   put:
 *     summary: Update a delivery by ID
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the delivery to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Delivery'
 *     responses:
 *       200:
 *         description: The delivery was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Delivery'
 *       400:
 *         description: Error updating delivery
 */
export async function updateDelivery(req: Request, res: Response): Promise<void> {
    try {
        const deliveryId = req.params.id;
        const delivery = req.body as IDelivery;
        const updatedDelivery = await deliveryService.updateDelivery(deliveryId, delivery);
        if (updatedDelivery) {
            res.status(200).json(updatedDelivery);
        } else {
            res.status(404).json({message: 'Delivery not found'});
        }
    } catch (error) {
        res.status(400).json({message: 'Error updating delivery', error});
    }
}
    