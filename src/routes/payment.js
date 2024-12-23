import { processPayment, executePayment } from "../modules/payment.js";
import express from "express";

const router = express.Router();

router.post('/payment', processPayment);
router.get('/payment/success', executePayment);

export default router;