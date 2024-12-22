import express from 'express';
import { Bonus } from '../../DB/models/bonus.js'
import { notificationService } from '../utils/notification.js'
import { authMiddleware } from '../middleware/auth.js'
import { roleCheck } from '../middleware/roleCheck.js'

const router = express.Router();

// Create bonus request
router.post(
  '/',
  authMiddleware,
  roleCheck(['manager']),
  async (req, res) => {
    try {
      const bonusData = {
        ...req.body,
        requestedBy: req.user._id
      };
      
      const bonus = await Bonus.create(bonusData);
      
      await notificationService({
        type: 'bonus_request',
        recipientRole: 'finance_staff',
        data: bonus
      });
      
      res.status(201).json(bonus);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Get monthly bonus report
router.get(
  '/report/monthly',
  authMiddleware,
  roleCheck(['manager', 'finance_staff']),
  async (req, res) => {
    try {
      const { month, year } = req.query;
      const report = await Bonus.getMonthlyReport(parseInt(month), parseInt(year));
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
