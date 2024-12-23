import { processPayment, executePayment } from "../modules/payment.js";
import express from "express";
import { roleCheck } from "../middleware/roleCheck.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post('/payment',authMiddleware,roleCheck(['manager', 'staff']),
processPayment);
router.get('/payment/success', executePayment);

export default router;