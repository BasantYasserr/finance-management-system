import express from 'express';
import { Bonus } from '../../DB/models/bonus.js';
import { authMiddleware } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

// Get monthly bonus report
router.get('/monthly-bonus', 
  authMiddleware, 
  roleCheck(['manager', 'finance_staff']), 
  async (req, res) => {
    try {
      const { month, year } = req.query;
      const report = await Bonus.getMonthlyReport(
        parseInt(month), 
        parseInt(year)
      );
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Get department summary
router.get('/department-summary', 
  authMiddleware, 
  roleCheck(['manager', 'finance_staff']), 
  async (req, res) => {
    try {
      const summary = await Bonus.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $group: {
            _id: '$user.department',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
            avgAmount: { $avg: '$amount' }
          }
        }
      ]);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Export report
router.get('/export', 
  authMiddleware, 
  roleCheck(['manager', 'staff']), 
  async (req, res) => {
    try {
      const { type, startDate, endDate } = req.query;
      let report;

      switch (type) {
        case 'bonus':
          report = await Bonus.find({
            createdAt: { 
              $gte: new Date(startDate), 
              $lte: new Date(endDate) 
            }
          }).populate('userId', 'username department');
          break;
        // Add more report types as needed
        default:
          return res.status(400).json({ error: 'Invalid report type' });
      }

      // Convert to CSV or desired format
      // Implementation needed

      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

export default router;