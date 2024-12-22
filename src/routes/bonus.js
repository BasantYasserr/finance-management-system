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

router.get(
  '/bonus/monthly',
  authMiddleware,
  roleCheck(['manager', 'finance_staff']),
  async (req, res) => {
    try {
      const { month, year } = req.query;
      const report = await Bonus.getPendingRequests(parseInt(month), parseInt(year));
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.put(
  '/:bonusId/approve-reject',
  authMiddleware,
  roleCheck(['staff']),  // Only staff can approve/reject
  async (req, res) => {
    const { bonusId } = req.params;
    const { status, reason } = req.body; // status: "approved" or "rejected"
    
    try {
      // Validate the status
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      console.log(bonusId)
      // Find and update the bonus request
      const bonus = await Bonus.findByIdAndUpdate(
        bonusId,
        {
          $set: { status },
          $push: {
            approvalHistory: {
              status,
              updatedBy: req.user._id, // assuming req.user._id is the staff's ID
              comment,
              date: new Date(),
            },
          },
        },
        { new: true }
      );

      // If the bonus does not exist
      if (!bonus) {
        return res.status(404).json({ error: 'Bonus request not found' });
      }

      // Send notification to the user who requested the bonus (or to others as needed)
      await notificationService.sendNotification({
        type: `bonus_${status}`, // "bonus_approved" or "bonus_rejected"
        recipientId: bonus.userId,
        data: bonus,
      });

      res.status(200).json(bonus); // Return the updated bonus object
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);


export default router;
