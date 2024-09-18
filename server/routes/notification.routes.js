import express from "express"
import { verifyToken } from "../middleware/verifyToken.js";
import { getNotifications, deleteAllNotifications, deleteSingleNotifications } from "../controllers/notification.controller.js";

const router = express.Router()

router.get('/', verifyToken, getNotifications)
router.delete('/:id', verifyToken, deleteSingleNotifications)
router.delete('/', verifyToken, deleteAllNotifications)

export default router;
